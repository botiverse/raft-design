import { tv } from "../../lib/tv";

export const messageImageGallery = tv({
  slots: {
    // 360px, or the column if it is narrower: a share of the column, not the
    // window less a guess at the message's chrome. The gallery is the
    // container its rows switch on, so a thread beside a conversation lays
    // out like a phone (design/patterns/responsive.md#switch-on-the-regions-width).
    root: ["@container/gallery w-full max-w-[min(360px,100%)] stack-y-1"],
    row: ["grid", "gap-1"],
    item: [
      "group/img relative overflow-hidden text-left",
      "rounded-control border border-line-hairline bg-fill-muted",
    ],
    media: "block size-full ",
    overlay: "absolute inset-0 flex items-center justify-center bg-layer-veil",
    preview: [
      "absolute inset-0",
      "transition-colors duration-75 hover:bg-ink-8",
      "outline-none focus-visible:keyboard:inset-ring-2 focus-visible:keyboard:inset-ring-foreground",
    ],
    action: [
      "absolute z-10 hidden items-center justify-center",
      "focus:flex",
      "group-hover/img:flex",
      "right-[calc(var(--control-embedded-inset)-1px)] bottom-[calc(var(--control-embedded-inset)-1px)] size-8 rounded-chip border-[1.5px] border-line-strong",
      "bg-layer-card text-foreground hover:overlay-medium active:overlay-medium",
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
    // into two columns in a narrow gallery keeps per-image heights instead of
    // squeezing both grid rows into one fixed height. A gallery at its full
    // 360px takes the taller rows: px, not rem, so it matches the cap above
    // whatever the root font size.
    {
      count: 1,
      single: false,
      class: { row: "auto-rows-32 @min-[360px]/gallery:auto-rows-36" },
    },
    {
      count: 2,
      single: false,
      class: { row: "auto-rows-32 @min-[360px]/gallery:auto-rows-36" },
    },
    {
      count: 3,
      single: false,
      class: { row: "auto-rows-28 @min-[360px]/gallery:auto-rows-32" },
    },
  ],
  variants: {
    count: {
      1: { row: "grid-cols-1" },
      2: { row: "grid-cols-2" },
      // Three images: two across and one under them, at every width (the
      // look used to reach this by overriding a three-across md: row).
      3: { row: "grid-cols-2" },
    },
    /** A single-image gallery keeps the image's proportions instead of a row height. */
    single: {
      true: { item: ["inline-block w-fit max-w-104 justify-self-start", "rounded-container"] },
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
