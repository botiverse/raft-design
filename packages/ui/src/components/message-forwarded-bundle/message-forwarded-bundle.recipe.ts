import { tv } from "../../lib/tv";

export const messageForwardedBundle = tv({
  slots: {
    root: ["mt-1 max-w-[min(34rem,100%)]"],
    header: ["flex flex-wrap items-center justify-between", "gap-2"],
    headerContent: ["flex min-w-0 items-center", "gap-2"],
    headerLabel: [
      "inline-flex shrink-0 items-center",
      "gap-1 text-footnote font-bold text-foreground-muted [&_svg]:size-3.5",
    ],
    headerCount: ["shrink-0", "font-mono text-mono-meta text-foreground-hint"],
    source: [
      "min-w-0 truncate",
      "inline-flex items-center gap-1 rounded-[2px] text-caption font-semibold text-foreground-hint",
      "decoration-[1.5px] underline-offset-[3px] hover:text-foreground hover:underline",
      "outline-none focus-visible:shadow-focus",
      "[&_svg]:size-3.5",
    ],
    sourceLabel: [
      "min-w-0 truncate",
      "inline-flex items-center gap-1 text-caption text-foreground-hint [&_svg]:size-3.5",
    ],
    items: ["relative", ""],
    footerAction: [
      "inline-flex items-center gap-1 rounded-[2px] text-footnote font-semibold text-foreground",
      "decoration-[1.5px] underline-offset-[3px] hover:underline",
      "outline-none focus-visible:shadow-focus",
    ],
  },
  variants: {
    fullWidth: {
      true: {
        root: "w-full max-w-none",
      },
    },
    collapsed: {
      true: {
        items: [
          // Fallback fold height (160px ≈ eight 20px lines); the component
          // overrides it inline with foldLineLimit x line height when it can
          // measure, and folds the height with the same number as the rule.
          // overflow-clip, not hidden: a folded card must not become a scroll
          // container — sticky content inside (the mermaid action bar) would
          // otherwise anchor to the clipped card instead of the message list.
          // The cut fades out over the content fade (48px), a mask, so a
          // hovered or located row under it fades with its fill.
          "max-h-40 overflow-clip",
          // A fold shorter than 60px would be mostly fade; it takes the edge
          // fade (24px) and keeps one line readable.
          "mask-fade-b data-tight-fold:mask-fade-b-edge",
        ],
      },
    },
  },
});

export const messageForwardedBundleItem = tv({
  slots: {
    root: ["px-3 py-2.5 text-body text-foreground"],
    meta: [
      "flex min-w-0 flex-wrap items-center",
      "mb-0.5 gap-1.5 font-mono text-mono-meta tabular-nums text-foreground-hint",
    ],
    author: ["font-sans text-footnote font-bold text-foreground"],
    /** The item's text body — also the fold measurement's reading surface. */
    itemContent: ["min-w-0 max-w-full wrap-break-word"],
    attachments: ["flex flex-wrap", "mt-1.5 gap-1.5"],
    attachment: [
      "inline-flex max-w-full items-center",
      "h-[22px] gap-1 rounded-chip bg-fill-muted pr-[6.5px] pl-[5.5px]",
      "text-caption font-semibold text-foreground [&_svg]:size-3.5",
    ],
    attachmentName: ["min-w-0 truncate"],
    attachmentMeta: ["shrink-0", "font-mono font-normal text-foreground-hint"],
  },
  variants: {
    /**
     * `interactive` marks an attachment the consumer wired to open (preview
     * or download). The affordance is style-only here; the element and the
     * action stay with the consumer via `render`.
     */
    action: {
      static: {},
      interactive: {
        attachment: [
          "cursor-pointer focus-visible:keyboard:outline-2 focus-visible:keyboard:outline-offset-2 focus-visible:keyboard:outline-line-strong",
          "hover:overlay-medium active:overlay-medium",
          "focus-visible:outline-none focus-visible:shadow-focus",
        ],
      },
    },
  },
  defaultVariants: {
    action: "static",
  },
});

/**
 * Image rows for forwarded attachments: message-scale rows that compose the
 * shared MessageImageGallery surfaces, so forwarded images read the same as
 * images in a message. The component owns the layout (rows of three; a lone
 * row of exactly four splits two-and-two) and the consumer owns the media.
 */
export const messageForwardedBundleGallery = tv({
  slots: {
    // The bundle is the container its rows switch on: three across and the
    // taller rows from 360px of its own width, two across below,
    // wherever it is (design/patterns/responsive.md#switch-on-the-regions-width).
    root: ["@container/bundle w-full min-w-0"],
    row: ["grid gap-2"],
    tile: ["[&_img]:block [&_img]:size-full [&_img]:object-cover"],
  },
  variants: {
    count: {
      // Heights ride the grid rows (auto-rows), so a row that wraps into two
      // columns in a narrow bundle keeps per-image heights (same fix as the
      // message gallery rows).
      1: { row: "grid-cols-1 auto-rows-[8rem] @min-[360px]/bundle:auto-rows-[9rem]" },
      2: { row: "grid-cols-2 auto-rows-[8rem] @min-[360px]/bundle:auto-rows-[9rem]" },
      3: {
        row: "grid-cols-2 auto-rows-[7rem] @min-[360px]/bundle:auto-rows-[8rem] @min-[360px]/bundle:grid-cols-3",
      },
    },
  },
});
