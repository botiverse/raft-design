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
        headerLabel: "gap-1 text-[11px] font-black uppercase leading-none text-black/70",
        headerCount: "text-[11px] font-bold text-black/55",
        source:
          "inline-flex items-center gap-1 text-[11px] font-bold underline-offset-2 transition-colors text-black/50 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        sourceLabel: "inline-flex items-center gap-1 text-[11px] font-bold text-black/45",
        items: "divide-y divide-black/10",
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
        items: "divide-y-[0.5px] divide-line-muted/75",
        footerAction:
          "inline-flex items-center gap-1 text-[11px] font-medium text-foreground-placeholder hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
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
        root: "px-3 py-3.5 text-[13px] leading-5 text-foreground-muted",
        meta: "mb-1 gap-1.5 text-[11px] font-sans tabular-nums text-foreground-placeholder",
        author: "font-normal text-foreground-placeholder",
        attachments: "mt-1.5 gap-1.5",
        attachment:
          "gap-1 rounded-sm border border-line-muted bg-layer-panel px-2 py-1 text-[11px] leading-4 font-medium text-foreground-muted dark:bg-fill-muted",
        attachmentMeta: "text-foreground-placeholder",
      },
    },
  },
});
