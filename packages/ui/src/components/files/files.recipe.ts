import { tv } from "../../lib/tv";

export const files = tv({
  slots: {
    panel: ["flex min-h-0 flex-1 flex-col", "bg-layer-canvas text-foreground"],
    viewport: ["min-h-0 flex-1 overflow-y-auto"],
    list: ["flex flex-col gap-2 px-5 py-3", "max-md:px-4"],
    row: [
      "group/file-row flex w-full min-w-0 gap-3 px-3",
      "transition-colors",
      "items-center rounded-container border border-line-hairline bg-layer-card py-2.5 pr-1.5 pl-2.5 shadow-none",
      // The hover is on a child (the open button), so `hover:` cannot express it;
      // the explicit media query keeps it off touch screens, like `hover:` does.
      "[@media(hover:hover)]:has-[[data-slot=file-row-open]:hover]:row-hover-overlay has-[[data-slot=file-row-open]:active]:press-overlay",
      "has-[[data-slot=file-row-open]:focus-visible]:shadow-focus",
    ],
    rowOpen: [
      "flex min-w-0 flex-1 gap-3 text-left",
      "focus-visible:outline-2 focus-visible:outline-offset-2",
      "items-center outline-none",
      "focus-visible:outline-none",
    ],
    thumbnail: [
      "flex shrink-0 items-center justify-center overflow-hidden",
      "[&_svg]:size-4.5 [&_svg]:shrink-0",
      "has-data-[slot=file-preview]:overflow-visible has-data-[slot=file-preview]:border-0 has-data-[slot=file-preview]:bg-transparent",
      "size-9 rounded-chip border-0 bg-fill-muted text-foreground-muted",
      "has-[[data-slot=file-preview]]:size-9",
    ],
    image: [
      "block size-full",
      "data-[fit=contain]:object-contain data-[fit=cover]:object-cover",
      "bg-layer-card",
    ],
    content: ["flex min-w-0 flex-1 flex-col", "justify-center gap-0.5"],
    name: ["block truncate", "font-sans text-callout font-semibold text-foreground"],
    meta: [
      "flex min-w-0 flex-wrap items-center gap-y-1",
      "mt-0 gap-x-1.5 font-mono text-mono-meta text-foreground-hint",
    ],
    metaItem: ["inline-flex items-center gap-1 [&_svg]:size-3 [&_svg]:shrink-0"],
    actions: ["flex shrink-0 self-center items-center gap-1.5"],
  },
});
