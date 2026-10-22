import { tv } from "../../lib/tv";

// The date line sits a section step (24px) from the text on both sides,
// measured to its rule: its padding gives back the row inset of the row above
// and the lead of the turn below (design/foundations/spacing.md#timeline-rhythm).
// The notice is a row of its own: a row's lead above it, the row inset under
// it.
export const messageList = tv({
  slots: {
    root: ["relative h-full min-h-0"],
    viewport: ["min-w-0 overscroll-none"],
    content: ["flex min-h-full w-full min-w-0 flex-col"],
    dateDividerRoot: [
      "flex select-none items-center",
      "gap-2 px-4",
      "pt-[calc(var(--spacing-timeline-section)-var(--spacing-timeline-row)-var(--text-mono-meta--line-height)/2)]",
      "pb-[calc(var(--spacing-timeline-section)-var(--spacing-timeline-lead)-var(--text-mono-meta--line-height)/2)]",
    ],
    dateDividerRule: ["flex-1", "min-w-3 border-t border-line-hairline"],
    dateDividerChip: [
      "inline-flex items-center",
      "font-mono text-mono-meta whitespace-nowrap text-foreground-hint",
    ],
    notice: ["text-center", "pt-timeline-lead pb-timeline-row font-mono text-mono-meta"],
    historyLimited: [
      "inline-flex items-center",
      "h-[22px] gap-1 rounded-chip px-1.5",
      "font-mono text-mono-meta text-foreground-muted",
      "inset-ring inset-ring-line-hairline",
      "[&_svg]:size-3",
    ],
  },
  variants: {
    tone: {
      faint: {
        notice: ["text-foreground-hint"],
      },
      muted: {
        notice: ["text-foreground-muted"],
      },
    },
  },
  defaultVariants: {
    tone: "faint",
  },
});

// The jump controls float over the list, centred, 12px from its edge and 8px
// apart. At the bottom they rise by `--message-list-bottom-inset`, the height
// of what else floats on that edge (the line of who is about to post), so they
// never cover it. The pills are Buttons at `outline md`, from the Button
// recipe, so their type, icon and height can't drift from it. Two that don't
// fit side by side (a phone) stack 12px apart, so their 44px hit areas don't
// overlap, the first one nearest the edge.
export const messageListJump = tv({
  slots: {
    controls: [
      "absolute inset-x-0 z-10 mx-auto",
      "flex w-fit max-w-[calc(100%-1.5rem)] flex-wrap items-center justify-center gap-x-2 gap-y-3",
    ],
    group: [
      "inline-flex shrink-0 items-stretch",
      "*:data-[slot=message-list-jump-pill]:rounded-e-none",
    ],
    dismiss: [
      "rounded-s-none border-s-0",
      "text-foreground-muted hover:text-foreground",
      "[&_svg:not([class*='size-'])]:size-4",
      "after:-inset-y-[calc(--spacing(1.5)+1.5px)] after:right-[calc(-0.75rem-1.5px)] after:left-0",
    ],
  },
  variants: {
    side: {
      bottom: {
        controls: [
          "bottom-[calc(--spacing(3)+var(--message-list-bottom-inset,0px))]",
          "flex-wrap-reverse",
        ],
      },
      top: { controls: ["top-3"] },
    },
  },
  defaultVariants: {
    side: "bottom",
  },
});
