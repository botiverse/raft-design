import { tv } from "../../lib/tv";

export const search = tv({
  slots: {
    frame: ["flex h-full min-h-0 flex-1 flex-col", "bg-layer-canvas text-foreground"],
    filtersRow: ["shrink-0", "border-b border-line-seam bg-layer-canvas px-4 py-3"],
    viewport: [
      "min-h-0 flex-1 overflow-y-auto scrollbar-list p-4",
      "bg-layer-canvas px-0 pt-0 pb-4",
    ],
    summary: ["block", "mb-0 px-4 pt-2 font-sans text-footnote text-foreground-hint"],
    section: ["mb-0"],
    sectionHeading: [
      "py-2",
      "flex items-center gap-2 px-4 pt-5 pb-2",
      "font-sans text-footnote font-bold text-foreground-hint",
    ],
    list: ["flex flex-col", "gap-0.5"],
  },
});
