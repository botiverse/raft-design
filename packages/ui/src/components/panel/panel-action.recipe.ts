import { tv } from "../../lib/tv";

const panelActionBase = tv({
  base: [
    "relative inline-flex w-auto shrink-0 items-center justify-center",
    "overflow-visible font-sans leading-none tabular-nums select-none outline-none",
    "transition-all duration-100",
    "[&>svg]:pointer-events-none [&>svg]:shrink-0",
    "h-11 min-w-11 rounded-control border-[1.5px] border-transparent bg-transparent px-2 py-0",
    // Desktop heads use the DS small icon button (32, an 18px glyph) and
    // keep a 44px hit area through the overhang; a phone head keeps the
    // 44px button, its tap target.
    "md:h-8 md:min-w-8 md:px-[5px] md:after:absolute md:after:-inset-1.5",
    "text-foreground",
    "hover:bg-fill-pressed active:bg-fill-pressed",
    "focus-visible:shadow-focus",
    "[&>svg]:size-[22px] md:[&>svg]:size-[18px]",
  ],
});

export const panelAction = tv({
  extend: panelActionBase,
  base: [
    "whitespace-nowrap",
    "disabled:pointer-events-none disabled:transform-none",
    "gap-1.5 text-control font-bold",
    "disabled:bg-transparent disabled:text-foreground-disabled disabled:opacity-100",
    "aria-pressed:border-sticker-ink aria-pressed:bg-brand aria-pressed:text-sticker-ink aria-pressed:ring-[1.5px] aria-pressed:ring-sticker-edge",
    "aria-pressed:active:press-overlay-sticker",
  ],
});

export const panelToggleAction = tv({
  extend: panelActionBase,
  base: [
    "data-disabled:pointer-events-none data-disabled:transform-none",
    "gap-1.5 text-control font-bold",
    "data-disabled:bg-transparent data-disabled:text-foreground-disabled data-disabled:opacity-100",
    "data-pressed:border-sticker-ink data-pressed:bg-brand data-pressed:text-sticker-ink data-pressed:ring-[1.5px] data-pressed:ring-sticker-edge",
    "data-pressed:active:press-overlay-sticker",
  ],
});
