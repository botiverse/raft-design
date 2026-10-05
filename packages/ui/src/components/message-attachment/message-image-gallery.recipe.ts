import { tv } from "../../lib/tv";

export const messageImageGallery = tv({
  slots: {
    root: "max-w-[min(352px,calc(100vw-112px))] md:max-w-[448px]",
    row: "grid gap-2",
    item: "group/img relative overflow-hidden text-left",
    media: "block size-full ",
    overlay: "absolute inset-0 flex items-center justify-center",
    preview: "absolute inset-0",
    action: [
      "absolute right-1 bottom-1 z-10 hidden size-6 items-center justify-center",
      "focus:flex",
      "group-hover/img:flex",
      "[&_svg]:size-3",
    ],
  },
  defaultVariants: {
    single: false,
  },
  compoundVariants: [
    // Row heights only exist for multi-image rows; a lone image sizes itself
    // through its own reserved box instead (see the single variant below).
    { count: 1, single: false, class: { row: "h-32 sm:h-36" } },
    { count: 2, single: false, class: { row: "h-32 sm:h-36" } },
    { count: 3, single: false, class: { row: "h-28 sm:h-32" } },
  ],
  variants: {
    count: {
      1: { row: "grid-cols-1" },
      2: { row: "grid-cols-2" },
      3: { row: "grid-cols-2 md:grid-cols-3" },
    },
    /** A single-image gallery keeps the image's proportions instead of a row height. */
    single: {
      true: { item: "inline-block w-fit max-w-[26rem] justify-self-start" },
    },
    /** Set from an item layout: the cell owns its media sizing. */
    laidOut: {
      true: { item: "[&_img]:block [&_img]:size-full" },
    },
    /** How the media fills its cell: cropped, or fully visible on a neutral backdrop. */
    fit: {
      cover: { item: "[&_img]:object-cover" },
      contain: { item: "[&_img]:object-contain [&_img]:bg-white" },
    },
    theme: {
      brutal: {
        root: "space-y-2",
        item: [
          "border-2 border-black bg-brutal-cream/60 hover:brightness-95",
          "has-data-[slot=message-image-gallery-overlay]:opacity-70 has-data-[slot=message-image-gallery-overlay]:hover:brightness-100",
        ],
        preview:
          "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black",
        action:
          "border border-black bg-white/80 text-black/50 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
      },
      elegant: {
        root: "space-y-2",
        item: [
          "rounded-md bg-fill-muted shadow-raft-xs",
          "transition-shadow duration-150 hover:shadow-raft-sm",
          "has-data-[slot=message-image-gallery-overlay]:opacity-70",
        ],
        preview:
          "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-line-strong",
        action: [
          "rounded-full border-0 bg-white/75 text-foreground-muted shadow-none backdrop-blur-md",
          "dark:text-[oklch(0.36_0.006_106.42)] dark:hover:text-[oklch(0.21_0.006_106.42)]",
          "transition-[background-color,color,opacity,box-shadow,transform] duration-150",
          "hover:bg-white/85 hover:text-foreground active:scale-[0.97]",
          "outline outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground",
        ],
      },
    },
  },
});
