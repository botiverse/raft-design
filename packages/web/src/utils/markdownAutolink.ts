const CJK_URL_BOUNDARY_PUNCTUATION = "，。、；：！？）》」』】》〉”’（《「『【〈“‘";

/**
 * remark-gfm treats bare URL autolinks greedily. When a URL is followed by
 * CJK punctuation or an ASCII comma and more CJK text, it can absorb text until a later
 * punctuation mark. Wrapping just the URL in `<...>` pins the autolink
 * boundary before markdown parsing.
 *
 * If the URL is already preceded by an unmatched `<` (e.g., the user typed
 * `<URL，` thinking they were starting an autolink but never closed it), we
 * consume that leading `<` instead of inserting a second one. Otherwise the
 * downstream `escapeUserRawHtmlForMessageMarkdown` pass would protect the
 * inner `<URL>` autolink and escape the outer `<` to a literal `&lt;`,
 * leaving a stray angle bracket next to the rendered link/card. See
 * #proj-message task #25.
 */
export function wrapBareUrlsBeforeCjkPunctuation(text: string): string {
  const wrappedCjkBoundaries = text.replace(
    new RegExp(
      `(<?)(https?:\\/\\/[^\\s<>${CJK_URL_BOUNDARY_PUNCTUATION}]+)([${CJK_URL_BOUNDARY_PUNCTUATION}])`,
      "g",
    ),
    (_match, _lt: string, url: string, punct: string) => `<${url}>${punct}`,
  );
  return wrappedCjkBoundaries.replace(
    /(<?)(https?:\/\/[^\s<>]*?),(?=\s|[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])/gu,
    (_match, _lt: string, url: string) => `<${url}>,`,
  );
}
