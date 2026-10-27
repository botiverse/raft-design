import { listCell, listCellFocus, listCellStates } from "../../lib/list-cell";
import { tv } from "../../lib/tv";

export const searchEntity = tv({
  slots: {
    entity: [
      "flex min-w-0 w-full items-center gap-3 text-left",
      "rounded-none border-0 py-3 text-foreground",
      // A finger's row: 64px on a touch screen at any width, by the input,
      // not the width (design/patterns/responsive.md#touch-screens).
      "pointer-coarse:min-h-16",
      listCell,
      listCellStates,
      "disabled:cursor-default",
      "data-[selected=true]:before:bg-brand-soft",
      listCellFocus,
    ],
    entityLeading: ["relative flex shrink-0"],
    entityIcon: [
      "flex items-center justify-center overflow-hidden",
      "size-[27px] rounded-sticker bg-fill-muted text-foreground-muted",
      "[&_svg]:size-3.5",
    ],
    entityActivity: [
      "absolute inline-block shrink-0",
      "right-[-3px] bottom-[-3px] size-[9px] rounded-[2px]",
      "border-[1.5px] border-sticker-ink bg-presence-online",
      "shadow-[0_0_0_2px_var(--layer-canvas)]",
    ],
    entityContent: ["min-w-0 flex-1", "flex flex-col gap-0.5"],
    entityHeader: ["flex min-w-0 items-center gap-2"],
    entityTitle: [
      "truncate",
      "font-sans text-body font-semibold text-foreground",
      "data-muted:text-foreground-hint",
    ],
    entityDescription: [
      "block truncate",
      "text-callout text-foreground-muted",
      "data-muted:text-foreground-hint",
    ],
  },
});
