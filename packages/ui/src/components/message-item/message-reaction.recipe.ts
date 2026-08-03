import { tv } from "../../lib/tv";

export const messageReaction = tv({
  slots: {
    chip: [
      "inline-flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap",
      "transition-colors",
    ],
    errorIndicator: ["sr-only"],
    glyph: [
      "inline-flex items-center justify-center leading-none",
      "[&>svg]:size-[13px] [&>svg]:shrink-0",
    ],
    count: ["font-mono tabular-nums"],
    addButton: [
      "inline-flex min-w-0 items-center justify-center",
      "transition-colors",
      "[&_svg]:shrink-0",
    ],
    quickRow: ["flex shrink-0 items-center"],
    quickButton: ["flex items-center justify-center", "bg-transparent transition-colors"],
    pickerContent: ["inline-flex items-center"],
    pickerStatic: ["inline-flex items-center"],
    tooltip: ["inline-block max-w-[280px]"],
    tooltipNames: ["flex max-w-60 flex-wrap items-center gap-y-0.5"],
    tooltipName: ["inline-flex min-w-0 items-baseline leading-5"],
    tooltipNameText: ["max-w-28 truncate"],
    tooltipSeparator: ["shrink-0 text-foreground-strong/45"],
    tooltipMeta: ["leading-5 text-foreground-strong/50"],
  },
  variants: {
    theme: {
      brutal: {
        chip: [
          "h-5 gap-1 rounded px-1.5 text-xs font-bold leading-none",
          "bg-black/[0.03] text-black",
          "hover:bg-black/[0.08]",
          "data-[pressed]:bg-brutal-pink/20 data-[pressed]:hover:bg-brutal-pink/30",
          "has-[[data-slot=message-reaction-error-indicator]]:bg-brutal-orange/30 has-[[data-slot=message-reaction-error-indicator]]:hover:bg-brutal-orange/30",
        ],
        addButton: [
          "h-5 rounded px-1.5 [&_svg]:size-[13px]",
          "bg-black/[0.03] text-black hover:bg-black/[0.08] active:bg-black/[0.08]",
        ],
        quickRow: ["h-9 gap-1 bg-white px-2", "[&>[role=menuitem]]:size-7 [&>[role=menuitem]]:p-0"],
        quickButton: "size-7 rounded p-0 hover:bg-brutal-pink/20 active:bg-brutal-pink/20",
        pickerContent: [
          "gap-0.5 px-1.5 py-1",
          "[&>[role=menuitem]]:size-7 [&>[role=menuitem]]:p-0",
          "rounded-none border-2 border-black bg-white",
          // Live `shadow-faint-popover`: 0 4px 12px rgba(0,0,0,0.08)
          "shadow-[0_4px_12px_oklch(0_0_0_/_0.08)]",
        ],
        pickerStatic: [
          "gap-0.5 px-1.5 py-1",
          "rounded-none border-2 border-black bg-white",
          "shadow-[0_4px_12px_oklch(0_0_0_/_0.08)]",
        ],
        tooltip: "border-2 border-line-strong bg-white px-2 py-1.5 text-xs font-bold text-black",
      },
      elegant: {
        chip: [
          "h-5 rounded-full gap-1.5 px-2 text-[11px] font-medium leading-3 tracking-[0.22px]",
          "bg-fill-strong text-foreground-muted",
          "hover:bg-ink-10",
          "data-[pressed]:bg-accent-200/50 data-[pressed]:text-accent-700 data-[pressed]:hover:bg-accent-200/70",
          "has-[[data-slot=message-reaction-error-indicator]]:bg-danger-soft has-[[data-slot=message-reaction-error-indicator]]:text-danger",
        ],
        addButton: [
          "h-5 rounded-full px-1.5 bg-fill-muted text-foreground-icon [&_svg]:size-[13px]",
          "hover:bg-fill-strong active:bg-fill-strong",
        ],
        quickRow: [
          "h-9 gap-1 bg-layer-popover px-2",
          "[&>[role=menuitem]]:size-7 [&>[role=menuitem]]:p-0",
        ],
        quickButton:
          "size-7 rounded p-0 hover:bg-ink-10 data-[highlighted]:bg-ink-10 active:bg-ink-16",
        pickerContent: [
          "min-w-0 flex-row gap-0.5 px-1.5 py-1",
          "[&>[role=menuitem]]:size-7 [&>[role=menuitem]]:p-0",
        ],
        pickerStatic: [
          "min-w-0 flex-row rounded-md bg-layer-popover p-1",
          "shadow-raft-lg outline-none",
        ],
        tooltip: "px-2 py-1.5 text-xs",
      },
    },
  },
});
