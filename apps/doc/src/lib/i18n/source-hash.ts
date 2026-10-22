/**
 * The hash a translation records of the English page it was made from
 * (`sourceHash` in its front matter): FNV-1a, as 8 hex digits, over the
 * page's text without its front matter, every run of whitespace read as one
 * space, so a change to `status:`, a trailing space or a paragraph wrapped
 * differently does not mark the translation stale. Shared by the site, which says when a translation is behind, and
 * scripts/i18n.mjs, which writes and checks it.
 */
export function sourceHash(source: string): string {
  const text = source
    .replace(/\r\n/g, "\n")
    .replace(/^---\n[\s\S]*?\n---\n?/, "")
    .replace(/\s+/g, " ")
    .trim();
  let hash = 0x811c9dc5;
  for (const char of text) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
