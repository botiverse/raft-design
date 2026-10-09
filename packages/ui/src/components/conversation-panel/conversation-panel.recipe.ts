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
          "*:data-[slot=tabs-list]:max-w-none *:data-[slot=tabs-list]:border-y-0 *:data-[slot=tabs-list]:border-l-0 *:data-[slot=tabs-list]:border-r-2 *:data-[slot=tabs-list]:border-black *:data-[slot=tabs-list]:bg-white",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:bg-white [&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:text-black",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]]:bg-primary [&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]:hover]:bg-primary",
          "[&>[data-slot=tabs-list]>[data-slot=tabs-tab]+[data-slot=tabs-tab]]:before:bg-black",
        ],
        footer: "border-t-2 border-black bg-white",
      },
      elegant: {
        root: "relative bg-layer-canvas-muted font-sans text-foreground-strong",
        content: [
          "relative overflow-clip",
          "bg-layer-panel",
          "dark:bg-layer-card",
          "group-data-[edge=inset]/panel-frame:md:ml-2 group-data-[edge=inset]/panel-frame:md:rounded-tl-[10px]",
          "group-data-[edge=inset]/panel-frame:md:shadow-raft-xl",
          "dark:group-data-[edge=inset]/panel-frame:md:shadow-[0_0_0_1px_var(--line-muted),0_16px_32px_-8px_oklch(0_0_0_/_0.45)]",
        ],
        tabs: [
          "border-b-0 bg-layer-panel max-md:bg-layer-canvas-muted",
          "dark:bg-transparent dark:max-md:bg-layer-canvas-muted",
          "max-md:border-b max-md:border-line-muted",
          "*:data-[slot=tabs-list]:border-b-0",
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
