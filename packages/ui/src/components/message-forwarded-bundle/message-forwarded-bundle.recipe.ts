import { tv } from "../../lib/tv";

export const messageForwardedBundle = tv({
  slots: {
    root: ["mt-1 max-w-[min(34rem,100%)]"],
    header: ["flex flex-wrap items-center justify-between"],
    headerContent: ["flex min-w-0 items-center"],
    headerLabel: ["inline-flex shrink-0 items-center"],
    headerCount: ["shrink-0"],
    source: ["min-w-0 truncate"],
    sourceLabel: ["min-w-0 truncate"],
    items: ["relative"],
    footerAction: [],
  },
  variants: {
    theme: {
      brutal: {
        header: "gap-2",
        headerContent: "gap-2",
        // The label keeps its authored casing: "Forwarded" must not read as
        // "FORWARDED" (the app's forward card prints the word as-is).
        headerLabel: "gap-1 text-[11px] font-black leading-none text-black/70",
        headerCount: "text-[11px] font-bold text-black/55",
        source:
          "inline-flex items-center gap-1 text-[11px] font-bold underline-offset-2 transition-colors text-black/50 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        sourceLabel: "inline-flex items-center gap-1 text-[11px] font-bold text-black/45",
        // No divider between forwarded items: the app's bundle is a single
        // flat surface, one item after another.
        items: "",
        footerAction:
          "inline-flex items-center gap-1 text-[11px] font-black underline underline-offset-2 text-black/60 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
      },
      elegant: {
        header: "gap-2",
        headerContent: "gap-2",
        headerLabel: "gap-1 text-[11px] font-medium leading-none text-foreground-muted",
        headerCount: "text-[11px] font-medium text-foreground-placeholder",
        source:
          "inline-flex items-center gap-1 text-[11px] font-medium transition-colors text-foreground-placeholder hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
        sourceLabel:
          "inline-flex items-center gap-1 text-[11px] font-medium text-foreground-placeholder",
        // No divider between forwarded items — see the brutal note.
        items: "",
        footerAction:
          "inline-flex items-center gap-1 text-[11px] font-medium text-foreground-placeholder hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
      },
    },
    fullWidth: {
      true: {
        root: "w-full max-w-none",
      },
    },
    collapsed: {
      true: {
        items: [
          "max-h-36 overflow-hidden sm:max-h-45",
          "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-10 after:bg-linear-to-t",
        ],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      collapsed: true,
      class: { items: "after:from-white after:via-white/80 after:to-white/0" },
    },
    {
      theme: "elegant",
      collapsed: true,
      class: { items: "after:from-layer-panel after:via-layer-panel/80 after:to-layer-panel/0" },
    },
  ],
});

export const messageForwardedBundleItem = tv({
  slots: {
    root: [],
    meta: ["flex min-w-0 flex-wrap items-center"],
    author: [],
    attachments: ["flex flex-wrap"],
    attachment: ["inline-flex max-w-full items-center"],
    attachmentName: ["min-w-0 truncate"],
    attachmentMeta: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white px-3 py-2 text-sm text-black",
        meta: "mb-1 gap-1.5 text-[11px] font-mono text-black/55",
        author: "font-bold text-black/75",
        attachments: "mt-1.5 gap-1.5",
        attachment:
          "gap-1 border border-black/20 bg-white px-1.5 py-1 text-[11px] font-bold text-black/80",
        attachmentMeta: "text-black/50",
      },
      elegant: {
        // Body copy reads at the message body scale and colour, not as a
        // muted caption (the app's forwarded content is regular message text).
        root: "px-3 py-3.5 text-sm leading-5 text-foreground-strong",
        meta: "mb-1 gap-1.5 text-[11px] font-sans tabular-nums text-foreground-placeholder",
        author: "font-semibold text-foreground-strong",
        attachments: "mt-1.5 gap-1.5",
        attachment:
          "gap-1 rounded-sm border border-line-muted bg-layer-panel px-2 py-1 text-[11px] leading-4 font-medium text-foreground-muted dark:bg-fill-muted",
        attachmentMeta: "text-foreground-placeholder",
      },
    },
    /**
     * `interactive` marks an attachment the consumer wired to open (preview
     * or download). The affordance is style-only here; the element and the
     * action stay with the consumer via `render`.
     */
    action: {
      static: {},
      interactive: {
        attachment:
          "cursor-pointer transition-colors hover:border-line-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
      },
    },
  },
  defaultVariants: {
    action: "static",
  },
});

/**
 * Media gallery for forwarded attachments: the component owns the layout of
 * a horizontal image strip (three-up snap scroller and edge cues); the
 * consumer owns the media (slot in `<img>`/`<video>`) and the open action.
 *
 * The cue gradients use the surface tokens instead of a hardcoded white, so
 * dark surfaces keep a themed edge hint.
 */
export const messageForwardedBundleGallery = tv({
  slots: {
    gallery: ["group/gallery relative min-w-0"],
    viewport: [
      "scrollbar-none grid grid-flow-col auto-cols-[calc((100%-1rem)/3)] snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain",
    ],
    tile: [
      "group/media relative aspect-square w-full min-w-0 overflow-hidden",
      "[&_img]:block [&_img]:size-full  [&_img]:object-cover",
    ],
    cue: ["pointer-events-none absolute inset-y-0 z-10 w-5 opacity-0 transition-opacity"],
  },
  variants: {
    theme: {
      brutal: {
        tile: "border-2 border-black bg-brutal-cream/60",
      },
      elegant: {
        tile: "rounded-md border-[0.5px] border-line-muted bg-layer-inset dark:border-transparent",
      },
    },
    side: {
      left: {},
      right: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      side: "left",
      class: {
        cue: "left-0 bg-linear-to-r from-white to-transparent group-data-[overflow-left=true]/gallery:opacity-100",
      },
    },
    {
      theme: "brutal",
      side: "right",
      class: {
        cue: "right-0 bg-linear-to-l from-white to-transparent group-data-[overflow-right=true]/gallery:opacity-100",
      },
    },
    {
      theme: "elegant",
      side: "left",
      class: {
        cue: "left-0 bg-linear-to-r from-layer-panel to-transparent group-data-[overflow-left=true]/gallery:opacity-100",
      },
    },
    {
      theme: "elegant",
      side: "right",
      class: {
        cue: "right-0 bg-linear-to-l from-layer-panel to-transparent ",
      },
    },
  ],
});
