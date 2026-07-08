import { tv, type VariantProps } from "../../lib/tv";

export type DataAttributes = Record<`data-${string}`, string | undefined>;
export type MessageItemRowState = "active" | "search-match";
export type MessageItemBadgeTone = "default" | "cyan";

export const messageItem = tv({
  slots: {
    root: [
      "group/message relative mb-1 mt-1.5 flex h-fit min-h-[3rem] min-w-0 gap-3 px-2 py-1",
      "border-2 border-transparent text-left",
      "transition-colors duration-100",
      "hover:border-line-strong hover:bg-layer-panel active:border-line-strong active:bg-layer-panel",
    ],
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
      "text-foreground/0 group-hover/message:text-foreground/40",
    ],
    content: ["min-w-0 flex-1"],
    header: ["flex min-w-0 items-center gap-2 overflow-hidden pr-24"],
    sender: ["min-w-0 shrink-0 truncate text-sm font-bold text-foreground-strong"],
    senderState: [
      "inline-flex shrink-0 items-center border border-line-strong bg-gray-300 px-1.5 py-0.5",
      "text-[10px] font-bold uppercase leading-none text-foreground/60",
    ],
    meta: ["min-w-0 truncate font-mono text-xs text-foreground/40"],
    time: ["shrink-0 whitespace-nowrap font-mono text-xs text-foreground/40"],
    inlineStatus: ["shrink-0 text-[10px] font-bold text-foreground/40"],
    body: ["break-words text-sm leading-5 text-foreground-strong select-text", "[&_*]:select-text"],
    embedded: ["mt-1.5 min-w-0"],
    notice: [
      "mt-1 inline-flex max-w-full border border-line-strong bg-soft-signal/40 px-2 py-1",
      "text-xs font-bold text-foreground/70",
    ],
    attachments: ["mt-1 space-y-2"],
    footer: ["mt-1.5 flex flex-wrap items-center gap-1.5"],
    toolbar: [
      "absolute -top-3.5 right-2 z-20 hidden items-center overflow-hidden",
      "border-2 border-line-strong bg-white shadow-brutal-sm",
      "group-hover/message:flex",
    ],
    toolbarButton: [
      "inline-flex size-6 shrink-0 items-center justify-center",
      "text-black/50 transition-colors duration-100 hover:bg-soft-signal/30 hover:text-black",
      "data-[active=true]:text-foreground-strong",
      "data-[saved=true]:text-brutal-orange",
      "[&_svg]:size-[13px] [&_svg]:shrink-0",
    ],
    savedIndicator: [
      "absolute right-1 top-1 flex size-6 items-center justify-center",
      "text-brutal-orange group-hover/message:hidden",
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
      "data-[optimistic=true]:opacity-70 data-[single=true]:inline-block data-[single=true]:w-fit data-[single=true]:max-w-[26rem] data-[single=true]:justify-self-start",
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
      "data-[optimistic=true]:opacity-70",
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
      "text-black transition-colors duration-100 hover:border-black/30 hover:bg-black/5",
      "data-[loading=true]:!bg-soft-signal/30 data-[loading=true]:cursor-wait data-[optimistic=true]:opacity-70",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    attachmentIcon: [
      "absolute bottom-1.5 right-1.5 flex items-center justify-center",
      "text-black/60 group-hover/img:text-black",
    ],
    attachmentBody: ["w-full min-w-0 max-w-full overflow-hidden"],
    attachmentTitle: ["block w-full max-w-full truncate text-xs font-bold text-black"],
    attachmentMeta: ["mt-0.5 block truncate text-[10px] leading-4 text-black/45"],
    attachmentAction: [
      "absolute bottom-1.5 right-1.5 flex items-center justify-center",
      "text-black/60 group-hover/img:text-black",
      "[&_svg]:size-3",
    ],
    badge: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap",
      "border border-line-strong px-1.5 text-[10px] font-bold leading-none",
      "text-foreground-strong transition-colors duration-100",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    reactionChip: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden rounded px-1.5",
      "whitespace-nowrap bg-[oklch(0.9449_0.0094_99.99)] text-[12px] font-bold leading-none text-foreground-strong",
      "transition-colors duration-100 hover:bg-[oklch(0.8994_0.0136_97.46)]",
      "data-[reacted=true]:bg-brutal-pink/20 data-[reacted=true]:hover:bg-brutal-pink/30",
      "data-[failed=true]:bg-brutal-orange/30",
    ],
    reactionGlyph: [
      "inline-flex items-center justify-center leading-none",
      "data-[emoji=true]:shrink-0",
      "[&>svg]:size-[13px] [&>svg]:shrink-0",
    ],
    reactionCount: [
      "inline-flex min-w-[1ch] items-center justify-center font-mono leading-none tabular-nums",
    ],
    reactionQuickRow: ["flex h-9 items-center gap-1 bg-white px-2"],
    reactionQuickButton: [
      "flex size-7 items-center justify-center rounded bg-transparent transition-colors",
      "hover:bg-brutal-pink/20 active:bg-brutal-pink/20",
    ],
    reactionPicker: [
      "inline-flex items-center gap-0.5 border-2 border-line-strong bg-white px-1.5 py-1",
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
    rowState: {
      active: {
        root: "border-line-strong bg-layer-panel",
      },
      "search-match": {
        root: "border-line-strong bg-brutal-cyan/25 shadow-brutal",
      },
    },
    badgeTone: {
      default: {
        badge: "bg-white",
      },
      cyan: {
        badge: "bg-brutal-cyan/20 hover:bg-brutal-cyan/40",
      },
    },
    compact: {
      true: {
        root: "mt-0 min-h-0",
      },
    },
    toolbarVisible: {
      true: {
        toolbar: "flex",
      },
    },
  },
});

export type MessageItemVariantProps = VariantProps<typeof messageItem>;
