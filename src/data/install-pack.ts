import { Directory, File, Paths } from "expo-file-system";

import {
  parsePackJson,
  requireNewerVersion,
  validatePack,
  type Pack,
  type PackValidationIssue,
} from "@/data/validate-pack";

export type InstallPackResult =
  | { installed: true; pack: Pack; skipped: PackValidationIssue[]; replaced: boolean }
  | { installed: false; reason: string };

function packsDirectory(): Directory {
  return new Directory(Paths.document, "packs");
}

function readInstalledPack(file: File): Pack | null {
  try {
    return JSON.parse(file.textSync()) as Pack;
  } catch {
    return null;
  }
}

/**
 * The single entry point for writing a pack to disk, for both first-time
 * imports and updates. The caller never chooses which validator to run —
 * this looks at whether a pack with the same id is already installed and
 * applies the semver-newer gate itself, so that path can't be bypassed by
 * routing a same-id file through the "import" flow instead of "update".
 */
export function installPack(jsonText: string): InstallPackResult {
  const parsed = parsePackJson(jsonText);
  if ("reason" in parsed) return { installed: false, reason: parsed.reason };

  const result = validatePack(parsed.parsed);
  if (!result.valid) return { installed: false, reason: result.reason };

  const file = new File(packsDirectory(), `${result.pack.id}.json`);
  const replaced = file.exists;

  if (replaced) {
    const installedPack = readInstalledPack(file);
    if (!installedPack) {
      return {
        installed: false,
        reason: `an installed pack "${result.pack.id}" exists but could not be read`,
      };
    }
    const versionCheck = requireNewerVersion(result.pack, installedPack.version);
    if (!versionCheck.ok) return { installed: false, reason: versionCheck.reason };
  }

  packsDirectory().create({ idempotent: true, intermediates: true });
  file.write(JSON.stringify(result.pack));

  return { installed: true, pack: result.pack, skipped: result.skipped, replaced };
}
