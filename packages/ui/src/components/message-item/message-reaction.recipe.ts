import { tv } from "../../lib/tv";

export const reactionCountKeyframes: Keyframe[] = [
  { opacity: 0.7, transform: "translateY(1px) scale(0.92)", offset: 0 },
  { opacity: 1, transform: "translateY(-1px) scale(1.16)", offset: 0.45 },
  { opacity: 1, transform: "translateY(0) scale(1)", offset: 1 },
];

export const reactionCountTiming: KeyframeAnimationOptions = {
  duration: 180,
  easing: "cubic-bezier(0.2, 0, 0.2, 1)",
};

export const messageReaction = tv({
  slots: {
    chip: [
      "inline-flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap",
      "transition-colors",
      "h-6 gap-1 rounded-chip px-[7px] text-callout text-foreground",
      "bg-fill-muted hover:overlay-medium active:overlay-medium",
      "data-pressed:bg-attention-soft",
      "has-data-[slot=message-reaction-error-indicator]:bg-warning-soft",
      "outline-none focus-visible:shadow-focus",
      "[&_[data-slot=message-reaction-glyph]>svg]:size-4",
    ],
    errorIndicator: ["sr-only"],
    glyph: [
      "inline-flex items-center justify-center leading-none",
      "[&>svg]:size-[13px] [&>svg]:shrink-0",
    ],
    count: ["inline-block origin-center font-mono tabular-nums", "text-mono-meta font-bold"],
    addButton: [
      "inline-flex min-w-0 items-center justify-center",
      "transition-colors",
      "[&_svg]:shrink-0",
      "h-6 rounded-chip px-1.5 [&_svg]:size-4",
      "bg-fill-muted text-foreground-muted hover:overlay-medium active:overlay-medium",
      "outline-none focus-visible:shadow-focus",
    ],
    quickRow: [
      "flex shrink-0 items-center",
      "justify-between gap-0.5 bg-layer-popover p-0",
      "[&>[role=menuitem]]:size-9 [&>[role=menuitem]]:p-0 *:[[role=menuitem]]:justify-center",
    ],
    quickButton: [
      "flex items-center justify-center",
      "bg-transparent transition-colors",
      "size-9 rounded-chip p-0 text-xl leading-none text-foreground-muted",
      "hover:bg-brand-soft data-highlighted:bg-brand-soft active:bg-brand-soft",
      "outline-none focus-visible:shadow-focus",
    ],
    pickerContent: [
      "inline-flex items-center",
      "min-w-0 flex-row gap-0.5 p-1",
      "[&>[role=menuitem]]:size-9 [&>[role=menuitem]]:p-0",
    ],
    pickerStatic: [
      "inline-flex items-center",
      "min-w-0 flex-row gap-0.5 rounded-container p-1",
      "bg-layer-popover ring-1 ring-line-seam shadow-float outline-none",
    ],
    tooltip: ["inline-block max-w-[280px]", "px-2.5 py-1 text-footnote font-medium"],
    tooltipNames: ["flex max-w-60 flex-wrap items-center gap-y-0.5"],
    tooltipName: ["inline-flex min-w-0 items-baseline leading-5"],
    tooltipNameText: ["max-w-28 truncate"],
    tooltipSeparator: ["shrink-0", "text-foreground-on-hud/70"],
    tooltipMeta: ["leading-5", "text-foreground-on-hud/70"],
  },
});
