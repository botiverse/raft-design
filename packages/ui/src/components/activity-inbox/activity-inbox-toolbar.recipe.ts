import { tv } from "../../lib/tv";

export const activityInboxToolbar = tv({
  slots: {
    controls: [
      "flex shrink-0 flex-nowrap items-center gap-2",
      // The toolbar over a list: its small controls with 8px above and below,
      // 49px with the seam under it on a phone and a touch screen.
      "bg-layer-canvas px-(--column-margin) py-list-toolbar-air",
      // web-only: on a desktop the row is a 44px header, its 34px controls 5px from either edge
      "md:pointer-fine:py-[calc((var(--header-height)-var(--control-height))/2)]",
    ],
  },
});
