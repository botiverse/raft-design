import { tv } from "../../lib/tv";

export const profilePanel = tv({
  slots: {
    root: [
      "flex h-full min-h-0 min-w-0 flex-1 flex-col",
      "bg-layer-panel [--panel-footer-clearance:0rem]",
    ],
    header: [],
    headerContent: [],
    section: [],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {
        root: "relative font-sans text-foreground",
        header: "border-b border-line-subtle max-md:flex max-md:px-6 md:px-6",
        headerContent: "md:flex-col md:items-stretch md:gap-0",
        section: "border-line-subtle px-6 py-5",
      },
    },
  },
});
