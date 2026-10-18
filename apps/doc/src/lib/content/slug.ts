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
