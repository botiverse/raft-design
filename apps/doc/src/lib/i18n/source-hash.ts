/**
 * The hash a translation records of the English file it was made from
 * (`sourceHash` in its front matter): FNV-1a over the file's text, as 8 hex
 * digits. Shared by the site, which says when a translation is behind, and
 * scripts/i18n.mjs, which writes and checks it.
 */
export function sourceHash(source: string): string {
  let hash = 0x811c9dc5;
  for (const char of source.replace(/\r\n/g, "\n")) {
    const code = char.codePointAt(0)!;
    hash ^= code;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
