import { tv } from "../../lib/tv";

export const messageForwardedBundle = tv({
  slots: {
    root: ["max-w-[min(34rem,100%)]"],
    header: ["flex flex-wrap items-center justify-between"],
    headerLabel: ["inline-flex shrink-0"],
    headerCount: ["shrink-0"],
    source: ["min-w-0 truncate"],
    items: ["relative"],
    collapsedItems: ["relative max-h-36 overflow-hidden sm:max-h-45"],
    item: [],
    itemMeta: ["flex min-w-0 flex-wrap items-center"],
    itemAuthor: [],
    content: [],
    attachments: ["flex flex-wrap"],
    attachment: ["inline-flex max-w-full items-center"],
    attachmentName: ["min-w-0 truncate"],
    attachmentMeta: ["shrink-0"],
    collapsedFade: ["pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t"],
    footer: [],
    toggle: [],
  },
  variants: {
    theme: {
      brutal: {
        root: "mt-1 border border-black/20 bg-white",
        header: "gap-2 border-b border-black/10 bg-white px-2.5 py-1.5",
        headerLabel: "text-[11px] font-black uppercase leading-none text-black/70",
        headerCount: "text-[11px] font-bold text-black/55",
        source:
          "text-[11px] font-bold underline-offset-2 transition-colors text-black/50 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        items: "divide-y divide-black/10",
        collapsedItems: "divide-y divide-black/10",
        item: "bg-white px-3 py-2",
        itemMeta: "mb-1 gap-1.5 text-[11px] font-mono text-black/55",
        itemAuthor: "font-bold text-black/75",
        content: "text-sm text-black",
        attachments: "mt-1.5 gap-1.5",
        attachment:
          "gap-1 border border-black/20 bg-white px-1.5 py-1 text-[11px] font-bold text-black/80",
        attachmentMeta: "text-black/50",
        collapsedFade: "from-white via-white/80 to-white/0",
        footer: "border-t border-black/10 bg-white px-3 py-1.5",
        toggle:
          "text-[11px] font-black underline underline-offset-2 text-black/60 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
      },
      elegant: {
        root: "mt-1 rounded-md border border-line-subtle bg-layer-panel",
        header: "gap-2 border-b border-line-subtle bg-layer-muted px-2.5 py-1.5",
        headerLabel: "text-[11px] font-medium uppercase leading-none text-foreground-strong",
        headerCount: "text-[11px] font-medium text-foreground-muted",
        source:
          "text-[11px] font-medium underline-offset-2 transition-colors text-foreground-muted hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
        items: "divide-y divide-line-subtle",
        collapsedItems: "divide-y divide-line-subtle",
        item: "bg-layer-panel px-3 py-2",
        itemMeta: "mb-1 gap-1.5 text-[11px] font-mono text-foreground-muted",
        itemAuthor: "font-medium text-foreground-strong",
        content: "text-sm text-foreground-muted",
        attachments: "mt-1.5 gap-1.5",
        attachment:
          "gap-1 rounded-sm border border-line-subtle bg-layer-muted px-1.5 py-1 text-[11px] font-medium text-foreground-muted",
        attachmentMeta: "text-foreground-placeholder",
        collapsedFade: "from-layer-panel via-layer-panel/80 to-layer-panel/0",
        footer: "border-t border-line-subtle bg-layer-panel px-3 py-1.5",
        toggle:
          "text-[11px] font-medium underline underline-offset-2 text-foreground-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      },
    },
  },
});
