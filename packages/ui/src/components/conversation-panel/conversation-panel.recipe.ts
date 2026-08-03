import { tv } from "../../lib/tv";

export const conversationPanel = tv({
  slots: {
    root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col"],
    content: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    tabs: ["shrink-0"],
    footer: [],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white font-sans text-black",
        content: "bg-white",
        tabs: [
          "border-b-2 border-black bg-white",
          "[&>[data-slot=tabs-list]]:max-w-none [&>[data-slot=tabs-list]]:border-y-0 [&>[data-slot=tabs-list]]:border-l-0 [&>[data-slot=tabs-list]]:border-r-2 [&>[data-slot=tabs-list]]:border-black [&>[data-slot=tabs-list]]:bg-white",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:bg-white [&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:text-black",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]:first-child]:pl-[22px]",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]]:bg-soft-signal [&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]:hover]:bg-soft-signal",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]+[data-slot=tabs-tab]]:before:bg-black",
        ],
        footer: "border-t-2 border-black bg-white",
      },
      elegant: {
        root: "relative bg-layer-page font-sans text-foreground",
        content: [
          "relative overflow-clip",
          "bg-layer-panel md:shadow-xl",
          "md:ml-2 md:rounded-tl-[10px]",
        ],
        tabs: [
          "border-b-0 bg-layer-panel max-md:bg-layer-page",
          "max-md:border-b max-md:border-line-subtle",
          "[&>[data-slot=tabs-list]]:border-b-0",
          "[&>[data-slot=tabs-list]]:max-md:h-10",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:max-md:h-10",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:max-md:py-2",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-indicator]]:bg-primary-400",
          "max-md:[&>[data-slot=tabs-list]>[data-slot=tabs-indicator]]:h-px",
        ],
      },
    },
  },
});
