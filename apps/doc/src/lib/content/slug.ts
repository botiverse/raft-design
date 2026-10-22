/**
 * A heading's anchor, as GitHub writes it, so `color.md#meanings-of-color`
 * works on GitHub and on the site: lowercase, punctuation removed, each space
 * a hyphen.
 */
export function headingSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

/**
 * A heading's text and anchor. A translated heading carries the English
 * page's anchor after it, `## 颜色的含义 {#meanings-of-color}`
 * (i18n/README.md), so links and shared URLs work in every language; any
 * other heading's anchor is its slug.
 */
export function parseHeading(text: string): { id: string; title: string } {
  const explicit = text.match(/^(.*?)\s*\{#([\w-]+)\}\s*$/);
  if (explicit) return { id: explicit[2]!, title: explicit[1]!.trim() };
  return { id: headingSlug(text), title: text.trim() };
}
