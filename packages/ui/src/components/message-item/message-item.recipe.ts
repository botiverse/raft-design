import { tv, type VariantProps } from "../../lib/tv";

export const messageItem = tv({
  slots: {
    interactionBoundary: ["[contain:layout_style] [overflow:clip_visible]"],
    root: [
      "group/message relative flex h-fit min-h-[3rem] gap-3 max-md:gap-2",
      "border-2 border-transparent",
    ],
    gutter: ["relative w-9 shrink-0 self-stretch max-md:w-8"],
    avatarSlot: [
      "relative mt-0.5 shrink-0 self-start hover:brightness-90 transition-colors",
      "max-md:[&_[data-slot=avatar][data-size=md]]:size-8",
    ],
    avatarStatus: [
      "absolute -right-[2px] -bottom-[2px] inline-block size-[11px] shrink-0 rounded-full",
    ],
    continuationTime: [
      "absolute right-1 top-1 select-none font-mono text-[10px] leading-none tabular-nums",
    ],
    content: ["min-w-0 flex-1"],
    header: ["flex min-w-0 overflow-hidden pr-24"],
    sender: ["min-w-0 shrink-0 truncate text-sm"],
    senderState: ["inline-flex items-center"],
    meta: ["min-w-0 truncate"],
    time: ["shrink-0 whitespace-nowrap"],
    inlineStatus: ["shrink-0 text-[10px] font-bold text-foreground/40"],
    body: ["break-words select-text", "[&_*]:select-text"],
    translationPlaceholder: ["inline-block h-4 w-44 max-w-full align-middle"],
    translationOriginal: ["mt-1.5"],
    translationOriginalLabel: [],
    translationStatus: ["inline-flex items-center gap-1.5"],
    translationAction: ["font-bold underline underline-offset-2"],
    embedded: ["mt-1.5 min-w-0"],
    notice: [
      "mt-1 inline-flex max-w-full border border-line-strong bg-soft-signal/40 px-2 py-1",
      "text-xs font-bold text-foreground/70",
    ],
    attachments: ["mt-1 space-y-2"],
    footer: ["mt-1.5 flex flex-wrap items-center gap-1.5"],
    toolbar: [
      "pointer-events-none absolute z-20 flex items-center overflow-hidden opacity-0",
      "group-hover/message:pointer-events-auto group-hover/message:opacity-100",
      "group-focus-within/message:pointer-events-auto group-focus-within/message:opacity-100",
    ],
    toolbarButton: ["inline-flex shrink-0 items-center justify-center", "[&_svg]:shrink-0"],
    saveButton: [],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "mb-1 mt-1.5 px-2 py-1",
          "hover:border-line-strong hover:bg-layer-panel active:border-line-strong active:bg-layer-panel",
        ],
        avatarStatus: "border border-black",
        continuationTime: "text-black/0 group-hover/message:text-black/40",
        header: "items-center gap-2",
        sender: "font-bold text-black",
        senderState: [
          "border border-black bg-[oklch(0.872_0.01_258.338)] px-1.5 py-0.5",
          "text-[10px] font-bold uppercase text-black/60",
        ],
        meta: "font-mono text-xs text-black/40",
        time: "font-mono text-xs text-black/40",
        inlineStatus: "text-black/40",
        body: "text-sm leading-5 text-black",
        translationPlaceholder: "border-2 border-black/20",
        translationOriginal: "border-l-2 border-black/20 pl-2 text-black/70",
        translationOriginalLabel:
          "mb-0.5 text-[10px] font-bold uppercase tracking-normal text-black/40",
        translationStatus: "font-mono text-[11px] text-black/45",
        translationAction: "decoration-black/40 hover:decoration-black",
        toolbar: ["-top-3.5 right-2", "border-2 border-line-strong bg-white shadow-brutal-sm"],
        toolbarButton: [
          "size-6",
          "text-black/50 hover:bg-soft-signal/30 hover:text-black",
          "aria-[pressed=true]:text-black aria-[pressed=true]:hover:text-black",
          "[&_svg]:size-[13px]",
        ],
        saveButton:
          "aria-[pressed=true]:text-brutal-orange aria-[pressed=true]:hover:text-brutal-orange",
      },
      elegant: {
        root: [
          "px-7 py-3.5 max-md:px-4 max-md:py-2",
          "hover:bg-layer-strong/35 active:bg-layer-muted/90",
        ],
        continuationTime: [
          "top-0 pt-1.5",
          "text-transparent group-hover/message:text-foreground-muted/60",
        ],
        header: "items-baseline gap-1.5",
        sender: "text-[14px] font-medium leading-none text-foreground-muted",
        senderState: [
          "rounded-sm border-0 bg-layer-muted px-1.5 py-0.5",
          "text-[10px] font-medium normal-case leading-none text-foreground-muted",
        ],
        meta: "font-sans text-[12px] leading-none text-foreground-muted",
        time: "font-sans text-[12px] leading-none tabular-nums text-foreground-muted",
        inlineStatus: "font-sans text-[11px] font-medium leading-none text-foreground-muted",
        body: [
          "mt-1.5 mb-1.5 max-md:mt-1 max-md:mb-1",
          "text-[14px] leading-[21px] tracking-[-0.01em] text-foreground-muted",
          "select-text [&_*]:select-text",
          "group-data-[compact=true]/message:mt-0 group-data-[compact=true]/message:mb-0",
        ],
        translationPlaceholder: "rounded-sm",
        translationOriginal: "border-l border-line-subtle pl-2 text-foreground-muted",
        translationOriginalLabel:
          "mb-0.5 text-[10px] font-medium uppercase tracking-normal text-foreground-muted",
        translationStatus: "text-[11px] leading-none text-foreground-muted",
        translationAction:
          "decoration-foreground-muted/50 hover:text-foreground hover:decoration-foreground",
        notice: [
          "rounded-md border-0 bg-layer-muted px-2 py-1.5",
          "text-xs font-medium text-foreground-muted",
        ],
        toolbar: [
          "top-1 right-[calc(1.75rem-2px)]",
          "gap-[2px] rounded-sm px-1 py-[2px]",
          "bg-layer-popover bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_0.05)_0%,oklab(0%_0_0_/_0.01)_100%)]",
          "shadow-lg ring-1 ring-line-subtle",
        ],
        toolbarButton: [
          "size-7 rounded-md border border-transparent bg-transparent !p-0",
          "text-foreground-icon hover:bg-layer-strong/80 hover:text-foreground",
          "aria-[pressed=true]:text-primary-400 aria-[pressed=true]:hover:text-primary-400",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
          "[&_svg]:size-3.5",
        ],
        footer: "mt-2.5 max-md:mt-1.5",
      },
    },
    rowState: {
      active: {},
      "search-match": {},
      select: {
        root: [
          "hover:border-transparent active:border-transparent",
          "hover:bg-layer-panel active:bg-layer-panel",
        ],
      },
    },
    compact: {
      true: { body: "mt-0 mb-0" },
    },
    toolbarVisible: { true: { toolbar: "pointer-events-auto opacity-100" } },
    translationTone: {
      failed: {},
      normal: {},
      pending: { translationStatus: "[&_svg]:animate-pulse" },
    },
  },
  compoundVariants: [
    { theme: "brutal", rowState: "active", class: { root: "border-line-strong bg-white" } },
    {
      theme: "brutal",
      rowState: "search-match",
      class: { root: "border-line-strong bg-brutal-cyan/25 shadow-brutal" },
    },
    { theme: "brutal", compact: true, class: { root: "mt-0 min-h-0 py-1" } },
    {
      theme: "elegant",
      rowState: "active",
      class: {
        root: [
          "border-transparent bg-layer-strong/65 shadow-none",
          "ring-1 ring-inset ring-foreground-muted/80",
        ],
      },
    },
    {
      theme: "elegant",
      rowState: "search-match",
      class: {
        root: [
          "border-transparent bg-info-base/10 shadow-none",
          "ring-1 ring-inset ring-info-dark",
        ],
      },
    },
    {
      theme: "brutal",
      translationTone: "failed",
      class: {
        translationStatus: "text-brutal-orange",
        translationAction: "text-brutal-orange",
      },
    },
    {
      theme: "elegant",
      translationTone: "failed",
      class: {
        translationStatus: "text-danger-base",
        translationAction: "text-danger-base",
      },
    },
    { theme: "elegant", compact: true, class: { root: "mt-0 min-h-0 py-[2px]" } },
  ],
});

export type MessageItemVariantProps = VariantProps<typeof messageItem>;
