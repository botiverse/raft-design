/**
 * The DS search hit: what you looked for is a small yellow sticker, like an @
 * to you. Every place that marks a hit (message text, Markdown, search
 * results) uses this. The hit keeps the surrounding font (`[font:inherit]`
 * drops the browser's mark styling) but is always bold, which needs `!` to win
 * over that shorthand.
 */
export const searchHit = [
  "[font:inherit] font-bold!",
  "rounded-sticker bg-brand px-[3px] box-decoration-clone",
  "text-sticker-ink inset-ring-[1.5px] inset-ring-sticker-ink ring-[1.5px] ring-sticker-edge",
];
