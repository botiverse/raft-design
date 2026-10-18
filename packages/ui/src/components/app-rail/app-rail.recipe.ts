import { tv } from "../../lib/tv";

export const appRail = tv({
  slots: {
    root: [
      "flex size-full  flex-col items-center select-none",
      "w-[calc(var(--shell-header-height,56px)+1px)] border-r border-line-seam",
      "bg-layer-frame text-foreground-on-frame",
      "[@media(max-height:600px)]:w-[49px]",
    ],
    header: [
      "relative flex w-full shrink-0 items-center justify-center",
      "h-(--shell-header-height,56px) border-b border-line-seam",
      "[@media(max-height:600px)]:h-12",
    ],
    nav: [
      "flex w-full flex-1 flex-col items-center py-2", // Raft DS › Rail: 40px items 6px apart, everywhere on the rail. Under
      // the rail head the first item starts 10px below its seam (the head's
      // 4px margin plus the 6px gap). With no head (a top bar above the
      // rail takes the workspace switcher) the rail's side inset frames it
      // instead: 8px (a 40px item in the 56px rail), as at the bottom. In
      // short windows the items shrink to 36 and the inset to 6.
      "gap-1.5 pt-2.5 pb-2 first:pt-2",
      "[@media(max-height:600px)]:pt-1.5 [@media(max-height:600px)]:first:pt-1.5",
    ],
    footer: [
      "flex w-full shrink-0 flex-col items-center justify-center",
      "h-auto gap-1.5 pb-2 [@media(max-height:600px)]:pb-1.5",
    ],
    item: [
      "relative inline-flex shrink-0 items-center justify-center",
      "outline-none",
      "disabled:pointer-events-none disabled:opacity-45",
      "[&_svg]:shrink-0",
      "size-10 rounded-control border-[1.5px] border-transparent",
      "text-foreground-on-frame [&_svg]:size-5",
      "hover:bg-fill-frame-pressed active:bg-fill-frame-pressed",
      "data-[selected=true]:border-line-frame-active data-[selected=true]:bg-layer-frame-active",
      // The yellow "you are here" is a sticker: the die-cut edge in dark mode.
      "data-[selected=true]:ring-[1.5px] data-[selected=true]:ring-sticker-edge",
      "data-[selected=true]:text-foreground-on-frame-active",
      "focus-visible:shadow-focus",
      "[@media(max-height:600px)]:size-9",
    ],
    itemIcon: ["relative inline-flex items-center justify-center"],
    itemLabel: ["sr-only"],
    itemBadge: [
      "absolute -right-1 -top-1 inline-flex items-center justify-center",
      "h-4 min-w-4 rounded-sticker px-1",
      "bg-attention-400 text-sticker-ink inset-ring-[1.5px] inset-ring-sticker-ink ring-[1.5px] ring-sticker-edge",
      "font-mono text-[10px] font-bold leading-4 tabular-nums",
    ],
    itemIndicator: ["pointer-events-none absolute", "-top-1 -right-1"],
  },
});
