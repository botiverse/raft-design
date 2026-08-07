import { tv } from "../../lib/tv";

export const profilePanel = tv({
  slots: {
    root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col", "[--panel-footer-clearance:0rem]"],
    header: [],
    headerContent: [],
    section: [],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-layer-panel",
      },
      elegant: {
        root: "relative bg-layer-canvas-muted font-sans text-foreground-strong",
        header: "max-md:flex max-md:px-6 md:px-6",
        headerContent: "md:flex-col md:items-stretch md:gap-0",
        section: "border-line-muted px-6 py-5",
      },
    },
  },
});
