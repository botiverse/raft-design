import { tv } from "../../lib/tv";

export const profilePanel = tv({
  slots: {
    root: [
      "flex h-full min-h-0 min-w-0 flex-1 flex-col",
      "[--panel-footer-clearance:0rem]",
      "relative bg-layer-canvas font-sans text-foreground",
    ],
    header: [],
    headerContent: ["items-stretch gap-0"],
    section: ["border-line-hairline px-5 py-4"],
  },
});
