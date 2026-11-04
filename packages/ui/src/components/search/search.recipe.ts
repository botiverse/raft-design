import { listColumnMargin } from "../../lib/head-edges";
import { tv } from "../../lib/tv";

export const search = tv({
  slots: {
    frame: [
      "flex h-full min-h-0 flex-1 flex-col",
      "bg-layer-canvas text-foreground",
      listColumnMargin,
    ],
    // On a desktop the filters row is a header under the field: its 32px
    // pickers and the seam fill 44, as the Tasks and Activity toolbars do.
    filtersRow: [
      "shrink-0",
      "border-b border-line-seam bg-layer-canvas px-(--column-margin) py-3",
      "md:pointer-fine:py-[calc((var(--header-height)-1px-var(--control-height))/2)]",
    ],
    viewport: [
      "min-h-0 flex-1 overflow-y-auto scrollbar-list p-4",
      "bg-layer-canvas px-0 pt-0 pb-4",
    ],
    summary: ["block", "mb-0 px-5 pt-2 font-sans text-footnote text-foreground-hint"],
    section: ["mb-0"],
    sectionHeading: [
      "py-2",
      "flex items-center gap-2 px-5 pt-3 pb-0",
      "font-sans text-footnote font-bold text-foreground-hint",
    ],
    list: ["flex flex-col", "gap-0.5 py-2"],
  },
});
