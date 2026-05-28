/**
 * Single source of truth for the in-message reference-chip box.
 *
 * Every chip rendered inside message content — @self-mention (MentionLink),
 * thread / #channel / task / slock-permalink (MessageItem), resolved and
 * unresolved — composes this exact box, so they are provably one height and
 * sit at the inline-code background-box height (stdrc #proj-message task #28
 * msg=dee00ea3: "确保所有 chip 高度一致，且和 inline code 背景框高度一致").
 *
 * - `leading-[21px]` is chosen to match the inline-code `<code>` background
 *   box. Huarong measured the real preview env (#proj-message:ca65d96d,
 *   #1895 head a67618de, screenshot id 49c13851): inline-code box = 23px;
 *   chips at `leading-[21px]` render at ~23px → equal. An earlier
 *   `leading-[19px]` attempt (chasing stdrc's optional "上下各缩 1px"
 *   consideration) measured 21px and was 2px SHORTER than inline-code —
 *   the mandatory "和 inline code 背景框高度一致" requirement wins over the
 *   optional 1px-shrink, so leading stays at 21px (the structural win of
 *   this module is the single shared box, not a leading change).
 * - `whitespace-nowrap` keeps refs like `task #16` atomic in screenshot
 *   export. Without it, a shrink-to-fit inline-block at the end of a wrapped
 *   line can split `#16` into `#1` + `6`, and html-to-image may then paint
 *   the second digit into the following text line.
 * - NO `cursor` here on purpose: per the cursor contract (CLAUDE.md →
 *   Interaction Patterns; stdrc task #28 msg=ca65d96d) in-message refs are
 *   app chrome and must stay on the arrow cursor — every call site appends
 *   `cursor-default` explicitly (the live thread-ref appends `cursor-wait`
 *   while resolving). Only the trailing external-URL `<a target="_blank">`
 *   keeps the browser link-hand. Explicit per-site cursor avoids relying on
 *   the global `a[href="#"]` rule, which never matched the slock-permalink
 *   chip (it carries a real href) or `MentionLink` self-mention.
 *
 * Lives in its own module (not inlined in MessageItem) so MentionLink can
 * import the same constant — Huarong review #proj-message:ca65d96d found the
 * self-mention chip drifting on its own `leading-[21px]` box because the
 * constant was MessageItem-local. Shared module + contract test pins it.
 */
export const MSG_REF_CHIP =
  "inline-block whitespace-nowrap border border-black px-1 text-sm font-bold leading-[21px] select-text";
