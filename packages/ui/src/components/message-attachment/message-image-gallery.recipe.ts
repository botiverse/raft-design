import { tv } from "../../lib/tv";

export const messageImageGallery = tv({
  slots: {
    root: ["max-w-[min(360px,calc(100vw-112px))] stack-y-1 md:max-w-[360px]"],
    row: ["grid", "gap-1"],
    item: [
      "group/img relative overflow-hidden text-left",
      "rounded-control border border-line-hairline bg-fill-muted",
      "has-data-[slot=message-image-gallery-overlay]:opacity-70",
    ],
    media: "block size-full ",
    overlay: "absolute inset-0 flex items-center justify-center",
    preview: [
      "absolute inset-0",
      "outline-none focus-visible:inset-ring-2 focus-visible:inset-ring-foreground",
    ],
    action: [
      "absolute z-10 hidden items-center justify-center",
      "focus:flex",
      "group-hover/img:flex",
      "right-1.5 bottom-1.5 size-8 rounded-control border-[1.5px] border-line-strong",
      "bg-layer-card text-foreground hover:press-overlay active:press-overlay",
      "outline-none focus-visible:shadow-focus",
      "[&_svg]:size-4",
    ],
  },
  defaultVariants: {
    single: false,
  },
  compoundVariants: [
    // Row heights only exist for multi-image rows; a lone image sizes itself
    // through its own reserved box instead (see the single variant below).
    // The height goes on the grid rows (not the row box), so a row that wraps
    // into two columns on narrow viewports keeps per-image heights instead of
    // squeezing both grid rows into one fixed height.
    { count: 1, single: false, class: { row: "auto-rows-[8rem] sm:auto-rows-[9rem]" } },
    { count: 2, single: false, class: { row: "auto-rows-[8rem] sm:auto-rows-[9rem]" } },
    { count: 3, single: false, class: { row: "auto-rows-[7rem] sm:auto-rows-[8rem]" } },
    { count: 3, class: { row: "md:grid-cols-2" } },
  ],
  variants: {
    count: {
      1: { row: "grid-cols-1" },
      2: { row: "grid-cols-2" },
      3: { row: "grid-cols-2 md:grid-cols-3" },
    },
    /** A single-image gallery keeps the image's proportions instead of a row height. */
    single: {
      true: { item: ["inline-block w-fit max-w-[26rem] justify-self-start", "rounded-container"] },
    },
    /** Set from an item layout: the cell owns its media sizing. */
    laidOut: {
      true: { item: "[&_img]:block [&_img]:size-full" },
    },
    /** How the media fills its cell: cropped, or fully visible on a neutral backdrop. */
    fit: {
      cover: { item: "[&_img]:object-cover" },
      contain: { item: ["[&_img]:object-contain", "[&_img]:bg-transparent"] },
    },
  },
});
