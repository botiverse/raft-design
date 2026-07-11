import { tv, type VariantProps } from "../../lib/tv";

export type DataAttributes = Record<`data-${string}`, string | undefined>;

export const messageItem = tv({
  slots: {
    root: ["group/message relative flex h-fit min-h-[3rem] gap-3", "border-2 border-transparent"],
    gutter: ["relative w-9 shrink-0 self-stretch"],
    avatarSlot: ["relative mt-0.5 shrink-0 self-start hover:brightness-90 transition-colors"],
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
    embedded: ["mt-1.5 min-w-0"],
    notice: [
      "mt-1 inline-flex max-w-full border border-line-strong bg-soft-signal/40 px-2 py-1",
      "text-xs font-bold text-foreground/70",
    ],
    attachments: ["mt-1 space-y-2"],
    footer: ["mt-1.5 flex flex-wrap items-center gap-1.5"],
    toolbar: ["absolute z-20 hidden items-center overflow-hidden", "group-hover/message:flex"],
    toolbarButton: ["inline-flex shrink-0 items-center justify-center", "[&_svg]:shrink-0"],
    savedIndicator: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap",
      "border border-line-strong px-1.5 text-[10px] font-bold leading-none",
      "[&_svg]:size-[10px] [&_svg]:shrink-0",
    ],
    badge: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap",
      "border transition-colors",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    badgeSeparator: ["text-foreground/45"],
    systemRoot: ["mb-1 flex min-w-0 items-center justify-center gap-2 px-2 py-1.5"],
    systemTime: ["shrink-0 whitespace-nowrap font-mono text-xs text-foreground/40"],
    systemContent: ["min-w-0 truncate text-xs text-foreground/50"],
    systemDisclosure: [
      "group flex max-w-full items-center gap-1.5 px-2 py-1",
      "text-xs text-foreground/50 transition-colors hover:text-foreground/75",
      "[&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:rotate-90 [&_svg]:text-foreground/35 [&_svg]:transition-transform",
      "aria-expanded:[&_svg]:-rotate-90",
    ],
  },
  variants: {
    badgeStatus: { read: {}, unread: {} },
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
          "border border-line-strong bg-[oklch(0.872_0.01_258.338)] px-1.5 py-0.5",
          "text-[10px] font-bold uppercase text-foreground/60",
        ],
        meta: "font-mono text-xs text-black/40",
        time: "font-mono text-xs text-black/40",
        inlineStatus: "text-black/40",
        body: "text-sm leading-5 text-black",
        toolbar: ["-top-3.5 right-2", "border-2 border-line-strong bg-white shadow-brutal-sm"],
        toolbarButton: [
          "size-6",
          "text-black/50 hover:bg-soft-signal/30 hover:text-black",
          "data-[active=true]:text-black data-[active=true]:hover:text-black",
          "data-[saved=true]:text-brutal-orange data-[saved=true]:hover:text-brutal-orange",
          "[&_svg]:size-[13px]",
        ],
        savedIndicator: [
          "bg-brutal-orange/15 text-black transition-[filter] duration-100 hover:brightness-90",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black",
          "[&_svg]:text-brutal-orange",
        ],
        badge: [
          "border-line-strong px-1.5 text-[10px] font-bold leading-none text-black",
          "transition-colors hover:bg-brutal-cyan/40",
        ],
      },
      elegant: {
        root: ["px-7 py-3.5", "hover:bg-layer-strong/35 active:bg-layer-muted/90"],
        continuationTime: [
          "top-0 pt-1.5",
          "text-transparent group-hover/message:text-foreground-muted/60",
        ],
        header: "items-baseline gap-1.5",
        sender: "text-[14px] font-medium leading-none text-foreground-muted",
        senderState: [
          "border border-line-strong bg-layer-muted px-1.5 py-0.5",
          "text-[10px] font-bold uppercase leading-none text-foreground/60",
        ],
        meta: "font-sans text-[12px] leading-none text-foreground-muted/60",
        time: "font-sans text-[12px] leading-none tabular-nums text-foreground-muted/60",
        body: [
          "mt-1.5 mb-1.5 text-[14px] leading-[21px] tracking-[-0.01em] text-foreground-muted",
          "select-text [&_*]:select-text [&_p]:pb-1 [&_p]:pt-0.5",
          "group-data-[compact=true]/message:mt-0 group-data-[compact=true]/message:mb-0",
          "group-data-[compact=true]/message:[&_p]:pt-0",
        ],
        toolbar: [
          "top-1 right-[calc(1.75rem-2px)]",
          "gap-[2px] rounded-sm px-1 py-[2px]",
          "bg-layer-popover shadow-xs ring-1 ring-line-subtle/30",
        ],
        toolbarButton: [
          "size-7 rounded-md border border-transparent bg-transparent !p-0",
          "text-foreground-icon hover:bg-layer-strong/80 hover:text-foreground",
          "aria-[pressed=true]:text-primary-400 aria-[pressed=true]:hover:text-primary-400",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
          "[&_svg]:size-3.5",
        ],
        savedIndicator: "right-[calc(1.75rem-2px)] text-primary-400",
        footer: "mt-2.5",
        badge: [
          "!h-[20px] rounded-md px-1.5 py-0.5 shadow-none ring-0",
          "text-[12px] font-[420] tracking-[-0.01em] [&_svg]:size-[11px]",
        ],
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
    toolbarVisible: { true: { toolbar: "flex" } },
  },
  compoundVariants: [
    { theme: "brutal", rowState: "active", class: { root: "border-line-strong bg-white" } },
    {
      theme: "brutal",
      rowState: "search-match",
      class: { root: "border-line-strong bg-brutal-cyan/25 shadow-brutal" },
    },
    { theme: "brutal", compact: true, class: { root: "mt-0 min-h-0 py-1" } },
    { theme: "elegant", rowState: "active", class: { root: "border-line-strong bg-layer-panel" } },
    {
      theme: "elegant",
      rowState: "search-match",
      class: { root: "border-line-strong bg-info-light shadow-sm" },
    },
    { theme: "elegant", compact: true, class: { root: "mt-0 min-h-0 py-[2px]" } },
    { theme: "brutal", badgeStatus: "read", class: { badge: "!bg-white" } },
    { theme: "brutal", badgeStatus: "unread", class: { badge: "!bg-brutal-cyan/20" } },
    {
      theme: "elegant",
      badgeStatus: "read",
      class: { badge: "text-foreground-muted" },
    },
    {
      theme: "elegant",
      badgeStatus: "unread",
      class: {
        badge: [
          "!h-[20px] border-transparent !bg-primary-100 !text-primary-800",
          "text-[12px] tracking-[-0.01em] hover:!bg-primary-200/90",
        ],
      },
    },
  ],
});

export type MessageItemVariantProps = VariantProps<typeof messageItem>;
