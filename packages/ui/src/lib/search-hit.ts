/**
 * The DS search hit: what you looked for sits on a `you` fill, yellow in every
 * theme, with ink type in the surrounding font and weight. No edge and no bold
 * (stdrc, 2026-10-24): a ring made a hit look like one more badge beside a
 * row's "DM" or "Channel" tag and cut the descenders, and it is the mention of
 * you that keeps the ring. 1px of fill above and below (`py-px`) keeps
 * the descenders inside it. Every place that marks a hit (message text,
 * Markdown, search results) uses this; `[font:inherit]` drops the browser's
 * mark styling.
 */
export const searchHit = [
  "[font:inherit]",
  "rounded-sticker bg-you px-[2px] py-px box-decoration-clone",
  "text-sticker-ink",
];
