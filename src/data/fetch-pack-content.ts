import { MAX_PACK_FILE_SIZE } from "@/data/validate-pack";

/**
 * Downloads a curated pack's raw JSON from its directory `url`. This is the
 * only place a pack's own content is fetched — the Packs view derives install
 * status from a local version comparison (#35), so nothing touches a pack's
 * URL until the user presses Install or Update (#36). The returned text is
 * handed straight to `installPack`, which parses, validates, and semver-gates
 * it; this function only handles the network side.
 */

const FETCH_TIMEOUT_MS = 15_000;

export type FetchPackContentResult =
  | { ok: true; jsonText: string }
  | { ok: false; reason: string };

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function fetchPackContent(
  url: string,
): Promise<FetchPackContentResult> {
  if (!isHttpsUrl(url)) {
    return { ok: false, reason: "This pack has an invalid download URL." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
  } catch {
    return { ok: false, reason: "Could not download this pack. Check your connection." };
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    return { ok: false, reason: `Downloading this pack failed (${response.status}).` };
  }

  const jsonText = await response.text();
  if (jsonText.length > MAX_PACK_FILE_SIZE) {
    return { ok: false, reason: "This pack is too large to install." };
  }

  return { ok: true, jsonText };
}
