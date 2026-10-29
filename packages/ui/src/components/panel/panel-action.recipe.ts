import { controlIconInset } from "../../lib/head-edges";
import { tv } from "../../lib/tv";

const panelActionBase = tv({
  base: [
    "relative inline-flex w-auto shrink-0 items-center justify-center",
    "overflow-visible font-sans leading-none tabular-nums select-none outline-none",
    "transition-all duration-100",
    "[&>svg]:pointer-events-none [&>svg]:shrink-0",
    "h-control min-w-control rounded-control border-[1.5px] border-transparent bg-transparent py-0",
    // The control metrics: on a desktop (from 768px with a mouse or
    // trackpad) the DS small icon button, 32 with an 18px glyph, keeping a
    // 44px hit area through the overhang; on a phone and on a touch screen
    // the 44px button, its tap target, with no overhang. The ::after is
    // placed from inside the 1.5px border, so it reaches that far too.
    "px-2 md:pointer-fine:px-[5px]",
    "after:absolute after:-inset-[calc(var(--spacing-control-hit)+1.5px)]",
    "text-foreground",
    "hover:bg-fill-medium active:bg-fill-medium",
    "focus-visible:shadow-focus",
    "[&>svg]:size-control-icon",
    controlIconInset,
  ],
});

export const panelAction = tv({
  extend: panelActionBase,
  base: [
    "whitespace-nowrap",
    "disabled:pointer-events-none disabled:transform-none",
    "gap-1.5 text-control font-bold",
    "disabled:bg-transparent disabled:text-foreground-disabled disabled:opacity-100",
    "aria-pressed:border-sticker-ink aria-pressed:bg-selected aria-pressed:text-sticker-ink aria-pressed:ring-[1.5px] aria-pressed:ring-sticker-edge",
    "aria-pressed:active:overlay-sticker-medium",
  ],
});

export const panelToggleAction = tv({
  extend: panelActionBase,
  base: [
    "data-disabled:pointer-events-none data-disabled:transform-none",
    "gap-1.5 text-control font-bold",
    "data-disabled:bg-transparent data-disabled:text-foreground-disabled data-disabled:opacity-100",
    "data-pressed:border-sticker-ink data-pressed:bg-selected data-pressed:text-sticker-ink data-pressed:ring-[1.5px] data-pressed:ring-sticker-edge",
    "data-pressed:active:overlay-sticker-medium",
  ],
});
