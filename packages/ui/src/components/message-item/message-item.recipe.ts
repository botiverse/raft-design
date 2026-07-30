import { tv, type VariantProps } from "../../lib/tv";

export const messageItem = tv({
  slots: {
    root: [
      "group/message relative flex h-fit min-h-[3rem] gap-3",
      "[@media(hover:none)]:select-none [@media(hover:none)]:[&_*]:select-none",
    ],
    gutter: ["relative w-9 shrink-0 self-stretch"],
    avatarSlot: ["relative mt-0.5 w-9 shrink-0 self-start"],
    continuationTime: ["absolute right-0 top-1 select-none tabular-nums"],
    content: ["min-w-0 flex-1"],
    header: ["flex min-w-0 overflow-hidden pr-24"],
    sender: ["min-w-0 shrink-0 truncate", "data-[interactive]:cursor-pointer"],
    senderBadges: ["inline-flex shrink-0 items-center gap-1"],
    meta: ["min-w-0 truncate"],
    time: ["shrink-0 whitespace-nowrap"],
    inlineStatus: ["shrink-0"],
    body: ["break-words select-text", "[&_*]:select-text"],
    embedded: ["mt-1.5 min-w-0"],
    notice: ["mt-1 inline-flex max-w-full"],
    attachments: ["mt-1 space-y-2"],
    footer: ["mt-1.5 flex flex-wrap items-center gap-1.5"],
    toolbar: [
      "pointer-events-none absolute z-20 flex items-center overflow-hidden opacity-0",
      "group-hover/message:pointer-events-auto group-hover/message:opacity-100",
      "group-focus-within/message:pointer-events-auto group-focus-within/message:opacity-100",
      "group-has-[[data-popup-open]]/message:pointer-events-auto group-has-[[data-popup-open]]/message:opacity-100",
    ],
    toolbarButton: ["inline-flex shrink-0 items-center justify-center", "[&_svg]:shrink-0"],
    saveButton: [],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "mb-1 mt-1.5 border-2 border-transparent px-2 py-1",
          "hover:border-line-strong hover:bg-layer-panel",
          "data-[popup-open]:border-line-strong data-[popup-open]:bg-layer-panel",
          "has-[[data-popup-open]]:border-line-strong has-[[data-popup-open]]:bg-layer-panel",
        ],
        continuationTime:
          "font-mono text-[10px] leading-none text-black/0 group-hover/message:text-black/40 group-has-[[data-popup-open]]/message:text-black/40",
        // Body + pre-body chips (e.g. AttachmentCommentRefChip) inherit from content.
        // Live Slock applies the same appearance size class to the chip and the body.
        content: "text-sm",
        header: "items-center gap-2",
        sender: [
          "text-sm font-bold text-black",
          "data-[interactive]:hover:underline data-[interactive]:hover:decoration-2 data-[interactive]:hover:underline-offset-2",
        ],
        meta: "font-mono text-xs text-black/40",
        time: "font-mono text-xs text-black/40",
        inlineStatus: "text-[10px] font-bold text-black/40",
        // Live Slock body is appearance `text-sm` only (Tailwind default leading-5).
        body: "text-sm text-black",
        notice: [
          "border border-line-strong bg-soft-signal/40 px-2 py-1",
          "text-xs font-bold text-foreground/70",
        ],
        toolbar: ["-top-3.5 right-2", "border-2 border-line-strong bg-white shadow-sm"],
        toolbarButton: [
          "size-6",
          "text-black/50 hover:bg-soft-signal/30 hover:text-black",
          "data-popup-open:bg-soft-signal/30 data-popup-open:text-black",
          "[&_svg]:size-[13px]",
        ],
        saveButton: "data-[selected]:text-brutal-orange data-[selected]:hover:text-brutal-orange",
      },
      elegant: {
        root: [
          "gap-3 border border-transparent max-md:gap-2 px-7 py-3.5 max-md:px-4 max-md:py-2",
          "has-[+[data-compact=true]]:pb-0.5 max-md:has-[+[data-compact=true]]:pb-0",
          "hover:bg-ink-2 data-[popup-open]:bg-ink-2 has-[[data-popup-open]]:bg-ink-2",
        ],
        gutter: "max-md:w-8",
        avatarSlot: ["max-md:w-8", "max-md:[&_[data-slot=avatar][data-size=md]]:size-7"],
        continuationTime: [
          "top-0 pt-1.5",
          "font-sans text-xs leading-none",
          "text-transparent group-hover/message:text-foreground-muted/60 group-has-[[data-popup-open]]/message:text-foreground-muted/60",
        ],
        // Pre-body chips inherit body type size from content (same as brutal).
        content: "text-sm leading-5.25 tracking-[-0.01em]",
        header: "items-baseline gap-1.5",
        sender: [
          "text-sm font-medium leading-none text-foreground-muted",
          "data-[interactive]:hover:underline data-[interactive]:hover:decoration-2 data-[interactive]:hover:underline-offset-2",
        ],
        meta: "font-sans text-xs leading-none text-foreground-muted/70",
        time: "font-sans text-xs leading-none tabular-nums text-foreground-muted/70",
        inlineStatus: "font-sans text-[11px] font-medium leading-none text-foreground-muted",
        body: [
          "mt-1.5 mb-1.5 max-md:mt-1 max-md:mb-1",
          "text-sm leading-5.25 tracking-[-0.01em] text-foreground-muted",
          "select-text [&_*]:select-text",
          "group-data-[compact=true]/message:mt-0 group-data-[compact=true]/message:mb-0",
        ],
        notice: [
          "rounded-md bg-layer-muted px-2 py-1.5",
          "text-xs font-medium text-foreground-muted",
        ],
        toolbar: [
          "top-1 right-[26px]",
          "gap-0.5 rounded-sm px-1 py-0.5",
          "bg-layer-popover bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_0.05)_0%,oklab(0%_0_0_/_0.01)_100%)]",
          "shadow-lg ring-1 ring-line-subtle",
        ],
        toolbarButton: [
          "size-7 rounded-md border border-transparent bg-transparent p-0",
          "text-foreground-icon hover:bg-layer-strong/80 hover:text-foreground",
          "data-popup-open:bg-layer-strong/80 data-popup-open:text-foreground",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
          "[&_svg]:size-3.5",
        ],
        saveButton: "data-[selected]:text-primary-400 data-[selected]:hover:text-primary-400",
        footer: "mt-2.5 max-md:mt-1.5",
      },
    },
    rowState: {
      active: {},
      "search-match": {},
      select: {
        root: [
          "hover:border-transparent hover:bg-layer-panel",
          "has-[[data-popup-open]]:border-transparent has-[[data-popup-open]]:bg-layer-panel",
        ],
      },
    },
    compact: {
      true: { body: "mt-0 mb-0" },
    },
    toolbarVisible: { true: { toolbar: "pointer-events-auto opacity-100" } },
  },
  compoundVariants: [
    {
      theme: "brutal",
      rowState: "search-match",
      class: { root: "border-line-strong bg-brutal-cyan/25 shadow-md hover:bg-brutal-cyan/25" },
    },
    { theme: "brutal", compact: true, class: { root: "mt-0 min-h-0 py-1" } },
    {
      theme: "elegant",
      rowState: "search-match",
      class: {
        root: [
          "border-transparent bg-info-base/10 shadow-none hover:bg-info-base/10",
          "ring-[0.5px] ring-inset ring-info-base/50",
        ],
      },
    },
    {
      theme: "elegant",
      compact: true,
      class: { root: "mt-0 min-h-0 pt-0.5 pb-0.5 max-md:pt-0.5 max-md:pb-0.5" },
    },
  ],
});

export type MessageItemVariantProps = VariantProps<typeof messageItem>;
