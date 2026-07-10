import { tv, type VariantProps } from "../../lib/tv";

export type DataAttributes = Record<`data-${string}`, string | undefined>;
export type MessageItemRowState = "active" | "search-match" | "select";
export type MessageItemBadgeTone = "default" | "cyan";

export const messageItem = tv({
  slots: {
    root: ["group/message relative flex h-fit min-h-[3rem] gap-3", "border-2 border-transparent"],
    gutter: ["relative w-9 shrink-0 self-stretch"],
    avatarSlot: ["relative mt-0.5 shrink-0 self-start hover:brightness-90 transition-colors"],
    selectMark: [
      "mt-1.5 inline-flex size-5 shrink-0 items-center justify-center self-start rounded-full",
      "border-2 border-line-strong bg-layer-panel text-transparent",
      "data-[checked=true]:bg-brutal-yellow data-[checked=true]:text-black",
      "[&_svg]:size-3 [&_svg]:stroke-[3]",
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
    footer: [
      "mt-1.5 flex flex-wrap items-center gap-1.5",
      "[[data-slot=app-shell-root]_&_[data-slot=badge].inline-flex.h-5]:![border-color:var(--sidebar-chrome-bg-color)]",
      "[[data-slot=app-shell-root]_&_[data-slot=badge].inline-flex.h-5]:[letter-spacing:-0.025em]",
      "[[data-slot=app-shell-root]_&_.inline-flex.h-5]:![border-color:var(--sidebar-chrome-bg-color)]",
      "[[data-slot=app-shell-root]_&_.inline-flex.h-5]:[letter-spacing:-0.025em]",
    ],
    toolbar: ["absolute z-20 hidden items-center overflow-hidden", "group-hover/message:flex"],
    toolbarButton: [
      "inline-flex shrink-0 items-center justify-center",
      "data-[active=true]:text-foreground-strong data-[active=true]:hover:text-foreground-strong",
      "data-[saved=true]:text-brutal-orange data-[saved=true]:hover:text-brutal-orange",
      "[&_svg]:shrink-0",
    ],
    savedIndicator: [
      "absolute top-1 flex size-6 items-center justify-center",
      "group-hover/message:hidden",
      "[&_svg]:size-[13px]",
    ],
    systemRoot: ["mb-1 flex min-w-0 items-center justify-center gap-2 px-2 py-1.5"],
    systemTime: ["shrink-0 whitespace-nowrap font-mono text-xs text-foreground/40"],
    systemContent: ["min-w-0 truncate text-xs text-foreground/50"],
    imageGallery: ["max-w-[min(22rem,calc(100vw-7rem))] space-y-2 md:max-w-[28rem]"],
    imageGalleryRow: ["grid gap-2"],
    imageGalleryItem: [
      "group/img relative overflow-hidden border-2 border-line-strong text-left",
      "bg-brutal-cream/60 hover:brightness-95",
      "data-[optimistic=true]:opacity-70 data-[optimistic=true]:hover:brightness-100",
      "data-[single=true]:inline-block data-[single=true]:w-fit data-[single=true]:max-w-[26rem] data-[single=true]:justify-self-start",
    ],
    imageGalleryMedia: [
      "block h-full w-full",
      "data-[fit=contain]:object-contain data-[fit=cover]:object-cover",
    ],
    imageGalleryOverlay: ["absolute inset-0 flex items-center justify-center"],
    imageGalleryAction: [
      "absolute right-1 bottom-1 z-10 hidden size-6 items-center justify-center",
      "border border-line-strong bg-white/80 text-black/50",
      "hover:text-black focus:flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
      "group-hover/img:flex",
      "[&_svg]:size-3",
    ],
    videoPreview: [
      "group/video relative w-full max-w-[min(28rem,calc(100vw-7rem))] overflow-hidden",
      "border-2 border-line-strong bg-black text-left",
    ],
    videoPreviewFrame: ["relative aspect-video w-full bg-black"],
    videoPreviewMedia: ["block h-full w-full bg-black object-contain"],
    videoPreviewFallback: [
      "flex h-full w-full items-center justify-center bg-black text-white",
      "data-[interactive=true]:hover:bg-black/90 data-[interactive=true]:cursor-pointer data-[interactive=false]:cursor-default",
    ],
    videoPreviewAction: [
      "absolute right-1.5 top-1.5 flex size-6 items-center justify-center",
      "border border-line-strong bg-white/80 text-black/60",
      "hover:bg-white hover:text-black",
      "[&_svg]:size-3",
    ],
    attachmentCard: [
      "group/img relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col justify-between overflow-hidden",
      "border border-black/15 bg-white px-2.5 py-2 text-left",
      "text-black transition-colors hover:border-black/30 hover:bg-black/5",
      "data-[loading=true]:!bg-soft-signal/30 data-[loading=true]:cursor-wait data-[optimistic=true]:opacity-70",
    ],
    attachmentIcon: [
      "absolute bottom-1.5 right-1.5 flex size-5 items-center justify-center",
      "text-black/60 group-hover/img:text-black",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    attachmentBody: ["w-full min-w-0 max-w-full overflow-hidden"],
    attachmentTitle: ["block w-full max-w-full truncate text-xs font-bold text-black"],
    attachmentMeta: ["mt-0.5 block truncate text-[10px] text-black/45"],
    attachmentAction: [
      "absolute bottom-1.5 right-1.5 flex size-5 items-center justify-center",
      "text-black/60 group-hover/img:text-black",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    attachmentLoadingBar: [
      "absolute inset-x-0 bottom-0 flex h-6 items-center gap-1.5",
      "border-t-2 border-line-strong bg-soft-signal px-2",
      "text-[10px] font-bold uppercase tracking-wide text-black",
    ],
    badge: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap",
      "border transition-colors",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    reactionChip: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden rounded px-1.5",
      "whitespace-nowrap bg-[oklch(0.945_0.009_100)] text-[12px] font-bold leading-none text-foreground-strong",
      "transition-colors hover:bg-[oklch(0.899_0.014_97.5)]",
      "data-[reacted=true]:bg-brutal-pink/20 data-[reacted=true]:hover:bg-brutal-pink/30",
      "data-[failed=true]:bg-brutal-orange/30 data-[failed=true]:hover:bg-brutal-orange/30",
    ],
    reactionGlyph: [
      "inline-flex items-center justify-center leading-none",
      "data-[emoji=true]:shrink-0",
      "[&>svg]:size-[13px] [&>svg]:shrink-0",
    ],
    reactionCount: ["font-mono tabular-nums"],
    reactionAddButton: [
      "inline-flex h-5 min-w-0 items-center justify-center rounded px-1.5",
      "bg-[oklch(0.945_0.009_100)] text-foreground-strong",
      "transition-colors hover:bg-[oklch(0.899_0.014_97.5)] active:bg-[oklch(0.899_0.014_97.5)]",
      "[&_svg]:size-[13px] [&_svg]:shrink-0",
    ],
    reactionQuickRow: ["flex h-9 items-center gap-1 bg-white px-2"],
    reactionQuickButton: [
      "flex size-7 items-center justify-center rounded bg-transparent transition-colors",
      "hover:bg-brutal-pink/20 active:bg-brutal-pink/20",
    ],
    reactionPicker: [
      "inline-flex items-center gap-0.5 border-2 border-line-strong bg-white px-1.5 py-1",
      "shadow-lg",
    ],
    reactionPickerContent: [
      "inline-flex min-w-0 flex-row items-center gap-0.5",
      "rounded-none border-2 border-black bg-white px-1.5 py-1",
      "shadow-[0_4px_12px_oklch(0_0_0_/_0.08)]",
    ],
    reactionPopover: [
      "inline-block max-w-[280px] border-2 border-line-strong bg-white px-2 py-1.5",
      "text-xs font-bold text-black",
    ],
    reactionPopoverNames: ["flex max-w-60 flex-wrap items-center gap-y-0.5"],
    reactionPopoverName: ["inline-flex min-w-0 items-baseline leading-5"],
    reactionPopoverNameText: ["max-w-28 truncate"],
    reactionPopoverSeparator: ["shrink-0 text-black/45"],
  },
  variants: {
    badgeTone: {
      default: {
        badge: [
          "!h-[20px] !border-0 !bg-transparent !px-0 !py-0 !shadow-none !ring-0",
          "text-[12px] tracking-[-0.01em] text-foreground-muted/76",
          "hover:!bg-transparent hover:text-foreground-strong",
        ],
      },
      cyan: {
        badge: [
          "!h-[20px] border-transparent !bg-primary-100 !text-primary-800",
          "text-[12px] tracking-[-0.01em] hover:!bg-primary-200/90",
        ],
      },
    },
    theme: {
      brutal: {
        root: [
          "mb-1 mt-1.5 px-2 py-1",
          "hover:border-line-strong hover:bg-layer-panel active:border-line-strong active:bg-layer-panel",
        ],
        continuationTime: "text-foreground/0 group-hover/message:text-foreground/40",
        header: "items-center gap-2",
        sender: "font-bold text-foreground-strong",
        senderState: [
          "border border-line-strong bg-gray-300 px-1.5 py-0.5",
          "text-[10px] font-bold uppercase text-foreground/60",
        ],
        meta: "font-mono text-xs text-foreground/40",
        time: "font-mono text-xs text-foreground/40",
        body: "text-sm leading-5 text-foreground-strong",
        toolbar: ["-top-3.5 right-2", "border-2 border-line-strong bg-white shadow-brutal-sm"],
        toolbarButton: [
          "size-6",
          "text-black/50 hover:bg-soft-signal/30 hover:text-black",
          "[&_svg]:size-[13px]",
        ],
        savedIndicator: "right-1 text-brutal-orange",
        badge: [
          "border-line-strong px-1.5 text-[10px] font-bold leading-none",
          "text-foreground-strong",
        ],
      },
      elegant: {
        root: [
          "px-7 py-3.5",
          "hover:bg-[color-mix(in_oklch,#EEEEED_35%,transparent)] active:bg-layer-muted/90",
        ],
        continuationTime: "text-transparent group-hover/message:text-foreground-muted/60",
        header: "items-baseline gap-1.5",
        sender: "text-[14px] font-medium leading-none text-foreground-muted",
        senderState: [
          "border border-line-strong bg-gray-300 px-1.5 py-0.5",
          "text-[10px] font-bold uppercase leading-none text-foreground/60",
        ],
        meta: "font-sans text-[12px] leading-none text-foreground-muted/60",
        time: "font-sans text-[12px] leading-none tabular-nums text-foreground-muted/60",
        body: "mt-1.5 mb-1.5 text-[15px] leading-[22.5px] tracking-[-0.01em] text-foreground-muted select-text [&_*]:select-text [&_p]:pb-1 [&_p]:pt-0.5",
        toolbar: [
          "top-1 right-[calc(1.75rem-2px)]",
          "gap-[2px] rounded-sm px-1 py-[2px]",
          "bg-layer-popover shadow-xs ring-1 ring-line-subtle/30",
        ],
        toolbarButton: [
          "size-7 rounded-md border border-transparent bg-transparent !p-0",
          "text-foreground-muted/68 hover:bg-[color-mix(in_oklch,#EEEEED_80%,transparent)] hover:text-foreground",
          "data-[saved=true]:text-primary-400 data-[saved=true]:hover:text-primary-400",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
          "[&_svg]:size-3.5",
        ],
        savedIndicator: "right-[calc(1.75rem-2px)] text-primary-400",
        badge: [
          "rounded-md border-0 px-1.5 py-0.5 shadow-none ring-0",
          "text-[12px] font-medium tracking-[-0.01em] text-foreground-muted",
          "hover:bg-layer-muted",
        ],
      },
    },
    rowState: {
      active: {
        root: "border-line-strong bg-layer-panel",
      },
      "search-match": {
        root: "border-line-strong bg-brutal-cyan/25 shadow-brutal",
      },
      select: {
        root: [
          "hover:border-transparent active:border-transparent",
          "hover:bg-layer-panel active:bg-layer-panel",
        ],
      },
    },
    menuOpen: {
      true: {},
      false: {},
    },
    compact: {
      true: {
        root: "mt-0 min-h-0 py-[2px]",
        body: "mt-0 mb-0",
      },
    },
    toolbarVisible: {
      true: {
        toolbar: "flex",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      menuOpen: true,
      class: { root: "border-black bg-white" },
    },
  ],
});

export type MessageItemVariantProps = VariantProps<typeof messageItem>;
