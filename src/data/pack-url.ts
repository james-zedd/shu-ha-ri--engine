/**
 * Curated packs and the directory itself are only ever served from GitHub
 * gist raw URLs under our control. Both the directory fetch and the per-pack
 * content fetch require a pack URL to point at that host, so a typo'd or
 * lookalike domain that slips past the review of `curated-packs-list.ts` still
 * can't reach the network or be installed (see issue #30).
 */
const ALLOWED_PACK_HOSTS = new Set(["gist.githubusercontent.com"]);

export function isAllowedPackUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_PACK_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}
