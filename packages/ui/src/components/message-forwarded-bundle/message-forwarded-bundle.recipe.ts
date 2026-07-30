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
    footer: [],
    toggle: [],
  },
  variants: {
    theme: {
      brutal: {
        root: "",
        header: "gap-2",
        headerContent: "gap-2",
        headerLabel: "gap-1 text-[11px] font-black leading-none text-black/60",
        headerCount: "text-[11px] font-bold text-black/50",
        source:
          "inline-flex items-center gap-1 text-[11px] font-bold transition-colors text-black/45 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        sourceLabel: "inline-flex items-center gap-1 text-[11px] font-bold text-black/40",
        items: "divide-y-[0.5px] divide-black/[0.08]",
        footer: "",
        toggle:
          "inline-flex items-center gap-1 text-[11px] font-black text-black/50 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
      },
      elegant: {
        root: "",
        header: "gap-2",
        headerContent: "gap-2",
        headerLabel: "gap-1 text-[11px] font-medium leading-none text-foreground-muted",
        headerCount: "text-[11px] font-medium text-foreground-placeholder",
        source:
          "inline-flex items-center gap-1 text-[11px] font-medium transition-colors text-foreground-placeholder hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
        sourceLabel:
          "inline-flex items-center gap-1 text-[11px] font-medium text-foreground-placeholder",
        items: "divide-y-[0.5px] divide-line-subtle/75",
        footer: "",
        toggle:
          "inline-flex items-center gap-1 text-[11px] font-medium text-foreground-placeholder hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      },
    },
    collapsed: {
      true: {
        items: [
          "max-h-36 overflow-hidden sm:max-h-45",
          "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-10 after:bg-gradient-to-t",
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
      class: { items: "after:from-white after:via-white/80 after:to-white/0" },
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
        root: "bg-white px-3 py-3.5 text-[13px] leading-5 text-black",
        meta: "mb-1 gap-1.5 text-[11px] font-sans tabular-nums text-black/60",
        author: "font-normal text-black/60",
        attachments: "mt-1.5 gap-1.5",
        attachment:
          "gap-1 border-[1.5px] border-black bg-brutal-lavender px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-black",
        attachmentMeta: "text-black/50",
      },
      elegant: {
        root: "px-3 py-3.5 text-[13px] leading-5 text-foreground-muted",
        meta: "mb-1 gap-1.5 text-[11px] font-sans tabular-nums text-foreground-placeholder",
        author: "font-normal text-foreground-placeholder",
        attachments: "mt-1.5 gap-1.5",
        attachment:
          "gap-1 rounded-sm border border-line-subtle bg-layer-field px-2 py-1 text-[11px] leading-4 font-medium text-foreground-muted",
        attachmentMeta: "text-foreground-placeholder",
      },
    },
  },
});
