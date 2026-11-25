import { tv } from "../../lib/tv";

/**
 * In a sheet, a panel paints the sheet's surface, not its column's. A bottom
 * sheet (DrawerContent, or DialogSheetContent on a phone) is one
 * `layer-popover` surface from the grab handle down, with only a `line-seam`
 * under its head (drawer.md, "DrawerContent"). Beside the page a panel's root,
 * PanelHeader and PanelFooter paint `layer-canvas`, which in dark mode is a
 * darker band between the handle and the list (artin, 2026-11-25,
 * #proj-workspace:f6de4a2b; slock #16883). Popover, not transparent: a
 * sticky PanelHeader still covers the rows scrolling under it.
 */
export const onSheetSurface = [
  "in-data-[slot=drawer-content]:bg-layer-popover",
  "in-[[data-slot=dialog-content][data-sheet]]:bg-layer-popover",
];

export const panel = tv({
  slots: {
    root: [
      "[--panel-footer-clearance:10rem]",
      "bg-layer-canvas text-foreground",
      ...onSheetSurface,
    ],
    header: ["[@media(max-height:600px)]:h-(--header-height-short)"],
    body: ["relative min-h-0 flex-1 overflow-hidden"],
    scrollViewport: ["h-full min-h-0", "[overflow-anchor:auto]"],
    // MessageList's phone path only: it scrolls natively below 768px
    // (message-list.md#behavior), so it keeps the panel's native scroller.
    nativeScrollViewport: [
      "h-full min-h-0 overflow-y-auto overscroll-contain",
      "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]",
    ],
    scrollContent: ["min-h-full"],
    section: ["border-t px-(--surface-inset) py-4", "border-line-hairline"],
    footer: [
      "relative flex shrink-0 items-center pt-3",
      "bg-layer-canvas",
      ...onSheetSurface,
      "px-(--column-margin)",
      "pb-[calc(env(safe-area-inset-bottom)+1rem)] max-md:pb-[calc(env(safe-area-inset-bottom)+0.5rem)]",
    ],
  },
  variants: {
    edge: {
      inset: {
        root: "group/panel-frame",
      },
      attached: {
        root: ["group/panel-frame", "border-l border-line-seam max-md:border-l-0"],
      },
    },
  },
});
