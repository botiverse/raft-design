import { tv } from "../../lib/tv";

export const activityInboxToolbar = tv({
  slots: {
    controls: [
      "flex shrink-0 flex-nowrap items-center gap-2",
      "bg-layer-canvas px-(--column-margin) py-3",
      // On a desktop a 44px row: the 34px controls 5px from either edge.
      "md:pointer-fine:py-[calc((var(--header-height)-var(--control-height))/2)]",
    ],
  },
});
