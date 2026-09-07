import type { CuratedPack } from "@/data/curated-packs-list";
import { stripControlAndSpoofingChars } from "@/data/sanitize-string";
import { isSemver } from "@/data/semver";
import { isSafePackId } from "@/data/validate-pack";

/**
 * The running app's source of truth for the curated packs directory. The
 * in-repo `curated-packs-list.ts` is only the PR-reviewed authoring surface;
 * after a change merges, its contents are mirrored to this gist by hand (see
 * issue #41), so the directory can change without an app store release.
 */
export const CURATED_PACKS_DIRECTORY_URL =
  "https://gist.githubusercontent.com/james-zedd/8144d9e657f5aa1c994a57eec0280643/raw/curated-packs-list.json";

// This is directory metadata, not pack content, so the bar is lower than
// validatePack — but a malformed entry still must not be able to break the
// whole Packs view, so bad entries are skipped rather than rejected wholesale.
const MAX_DIRECTORY_BYTES = 512 * 1024;
const MAX_ENTRIES = 500;
const MAX_FIELD_LENGTH = 2048;
const FETCH_TIMEOUT_MS = 10_000;

export type FetchCuratedPacksResult =
  | { ok: true; packs: CuratedPack[] }
  | { ok: false; reason: string };

function cleanField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (value.length > MAX_FIELD_LENGTH) return null;
  const cleaned = stripControlAndSpoofingChars(value).trim();
  if (cleaned.length === 0) return null;
  // Directory strings are rendered as plain text; reject anything with angle
  // brackets rather than trying to sanitize markup out of metadata.
  if (/[<>]/.test(cleaned)) return null;
  return cleaned;
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function parseEntry(value: unknown): CuratedPack | null {
  if (typeof value !== "object" || value === null) return null;
  const entry = value as Record<string, unknown>;

  const id = cleanField(entry.id);
  if (!id || !isSafePackId(id)) return null;

  const name = cleanField(entry.name);
  const description = cleanField(entry.description);
  const author = cleanField(entry.author);
  if (!name || !description || !author) return null;

  if (!isHttpsUrl(entry.url)) return null;
  if (typeof entry.version !== "string" || !isSemver(entry.version)) return null;

  return { id, name, description, author, url: entry.url, version: entry.version };
}

/**
 * Validates already-parsed directory JSON. Split out from the fetch so it can
 * be exercised without a network call.
 */
export function parseCuratedPacksDirectory(
  raw: unknown,
): FetchCuratedPacksResult {
  if (!Array.isArray(raw)) {
    return { ok: false, reason: "directory data is not a JSON array" };
  }
  if (raw.length > MAX_ENTRIES) {
    return { ok: false, reason: "directory data has too many entries" };
  }

  const packs: CuratedPack[] = [];
  const seenIds = new Set<string>();
  for (const value of raw) {
    const entry = parseEntry(value);
    if (!entry || seenIds.has(entry.id)) continue;
    seenIds.add(entry.id);
    packs.push(entry);
  }

  return { ok: true, packs };
}

export async function fetchCuratedPacks(
  url: string = CURATED_PACKS_DIRECTORY_URL,
): Promise<FetchCuratedPacksResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
  } catch {
    return { ok: false, reason: "Could not reach the curated packs directory." };
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return {
      ok: false,
      reason: `The curated packs directory returned ${response.status}.`,
    };
  }

  const text = await response.text();
  if (text.length > MAX_DIRECTORY_BYTES) {
    return { ok: false, reason: "The curated packs directory is too large." };
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return {
      ok: false,
      reason: "The curated packs directory is not valid JSON.",
    };
  }

  return parseCuratedPacksDirectory(json);
}
