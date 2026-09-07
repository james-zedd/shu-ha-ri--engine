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

export type DeletePackResult =
  | { deleted: true }
  | { deleted: false; reason: string };

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

function isPackShaped(value: unknown): value is Pack {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.version === "string" &&
    Array.isArray(p.questions)
  );
}

/**
 * The installed pack with this id, or null when it isn't installed or its file
 * can't be read. Used to compare an installed pack against the curated
 * directory's version (#35) and to source a training session's questions.
 */
export function getInstalledPack(packId: string): Pack | null {
  const file = new File(packsDirectory(), `${packId}.json`);
  if (!file.exists) return null;
  const pack = readInstalledPack(file);
  return pack && isPackShaped(pack) ? pack : null;
}

/**
 * Every pack currently on disk, sorted by name. A file that can't be read or
 * parsed, or that no longer has a pack's basic shape, is skipped rather than
 * throwing — one bad file must not break the training screen.
 */
export function listInstalledPacks(): Pack[] {
  const dir = packsDirectory();
  if (!dir.exists) return [];

  const packs: Pack[] = [];
  for (const entry of dir.list()) {
    if (!(entry instanceof File) || entry.extension !== ".json") continue;
    const pack = readInstalledPack(entry);
    if (pack && isPackShaped(pack)) packs.push(pack);
  }
  return packs.sort((a, b) => a.name.localeCompare(b.name));
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

/**
 * Removes an installed pack's file. Destructive — the pack has to be
 * re-downloaded to get it back — so callers should confirm with the user first.
 */
export function deletePack(packId: string): DeletePackResult {
  const file = new File(packsDirectory(), `${packId}.json`);
  if (!file.exists) return { deleted: false, reason: "pack is not installed" };
  try {
    file.delete();
    return { deleted: true };
  } catch {
    return { deleted: false, reason: "could not remove the pack file" };
  }
}
