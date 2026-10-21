import { headEdgePull } from "../../lib/head-edges";
import { tv } from "../../lib/tv";

export const sidebarRecipe = tv({
  slots: {
    sidebarRoot: [
      "relative flex size-full min-h-0  select-none flex-col",
      "has-[>[data-slot=sidebar-live-activity]_[data-slot=live-agent-activity-bar]]:overflow-clip",
      "bg-layer-sidebar text-foreground max-md:bg-layer-canvas",
      "border-line-seam md:border-r",
      "md:has-[>[data-slot=sidebar-live-activity]_[data-slot=live-agent-activity-bar]]:[--sidebar-content-bottom:52px]",
    ],
    sidebarHeader: [
      "flex items-center",
      "h-(--shell-header-height,56px) shrink-0 gap-2 border-b border-line-seam px-5",
      "bg-layer-sidebar text-foreground",
      "max-md:bg-layer-frame max-md:px-4 max-md:text-foreground-on-frame",
      headEdgePull,
      "[@media(max-height:600px)]:h-12",
    ],
    sidebarHeaderMask: ["pointer-events-none absolute inset-x-0 top-0 -z-10 hidden"],
    sidebarHeaderMaskLayer: ["absolute inset-x-0 top-0"],
    sidebarHeaderTitle: [
      "truncate font-bold",
      "font-sans text-headline text-foreground max-md:text-foreground-on-frame",
    ],
    sidebarGroupLabel: [
      "px-2 pt-4 pb-1.5",
      "font-sans text-footnote font-bold normal-case tracking-normal text-foreground-hint",
    ],
    sidebarBody: [
      "relative flex min-h-0 flex-1 overflow-hidden",
      "bg-layer-sidebar max-md:bg-layer-canvas",
    ],
    sidebarContent: ["relative flex min-h-0 min-w-0 flex-1"],
    sidebarViewport: ["size-full min-h-0  flex-1 overflow-x-hidden overflow-y-auto"],
    sidebarContentInner: [
      "min-h-full min-w-0 w-full px-2",
      "pt-2 pb-(--sidebar-content-bottom,8px)",
    ],
    sidebarScrollbar: [
      "z-30 flex w-3 justify-center py-1 opacity-0 transition-opacity duration-150",
      "pointer-events-none",
      "data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0",
    ],
    sidebarLiveActivity: ["pointer-events-none absolute inset-x-0 max-md:hidden", "bottom-0 z-40"],
  },
});
