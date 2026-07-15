import { tv } from "../../lib/tv";

export const messageReaction = tv({
  slots: {
    chip: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-full px-1.5",
      "whitespace-nowrap text-[12px] font-bold leading-none transition-colors",
    ],
    errorIndicator: ["sr-only"],
    glyph: [
      "inline-flex items-center justify-center leading-none",
      "data-[emoji=true]:shrink-0",
      "[&>svg]:size-[13px] [&>svg]:shrink-0",
    ],
    count: ["font-mono tabular-nums"],
    addButton: [
      "inline-flex h-5 min-w-0 items-center justify-center rounded-full px-1.5",
      "transition-colors",
      "[&_svg]:size-[13px] [&_svg]:shrink-0",
    ],
    quickRow: ["flex h-9 shrink-0 items-center gap-1 px-2"],
    quickButton: [
      "flex !size-7 !w-7 items-center justify-center rounded !p-0",
      "bg-transparent transition-colors",
    ],
    pickerContent: ["inline-flex items-center gap-0.5 px-1.5 py-1"],
    tooltip: ["inline-block max-w-[280px] px-2 py-1.5 text-xs"],
    tooltipNames: ["flex max-w-60 flex-wrap items-center gap-y-0.5"],
    tooltipName: ["inline-flex min-w-0 items-baseline leading-5"],
    tooltipNameText: ["max-w-28 truncate"],
    tooltipSeparator: ["shrink-0 text-foreground/45"],
    tooltipMeta: ["leading-5 text-foreground/50"],
  },
  variants: {
    theme: {
      brutal: {
        chip: [
          "bg-[oklch(0.945_0.009_100)] text-black",
          "hover:bg-[oklch(0.899_0.014_97.5)]",
          "aria-[pressed=true]:bg-brutal-pink/20 aria-[pressed=true]:hover:bg-brutal-pink/30",
          "has-[[data-slot=message-reaction-error-indicator]]:bg-brutal-orange/30 has-[[data-slot=message-reaction-error-indicator]]:hover:bg-brutal-orange/30",
        ],
        addButton: [
          "bg-[oklch(0.945_0.009_100)] text-black",
          "hover:bg-[oklch(0.899_0.014_97.5)] active:bg-[oklch(0.899_0.014_97.5)]",
        ],
        quickRow: "bg-white",
        quickButton: "hover:bg-brutal-pink/20 active:bg-brutal-pink/20",
        pickerContent: [
          "rounded-none border-2 border-line-strong border-black bg-white",
          "shadow-soft-popover !shadow-soft-popover",
        ],
        tooltip: "border-2 border-line-strong bg-white font-bold text-black",
      },
      elegant: {
        chip: [
          "gap-1.5 px-2 text-[11px] font-medium leading-3 tracking-[0.22px]",
          "bg-layer-strong text-foreground-muted",
          "hover:bg-ink-10",
          "aria-[pressed=true]:bg-accent-200/50 aria-[pressed=true]:text-accent-700 aria-[pressed=true]:hover:bg-accent-200/70",
          "has-[[data-slot=message-reaction-error-indicator]]:bg-danger-lighter has-[[data-slot=message-reaction-error-indicator]]:text-danger-base",
        ],
        addButton: [
          "bg-layer-muted text-foreground-icon",
          "hover:bg-layer-strong active:bg-layer-strong",
        ],
        quickRow: "bg-layer-popover",
        quickButton: "hover:!bg-ink-10 data-[highlighted]:!bg-ink-10 active:!bg-ink-16",
        pickerContent: "min-w-0 flex-row",
      },
    },
  },
});
