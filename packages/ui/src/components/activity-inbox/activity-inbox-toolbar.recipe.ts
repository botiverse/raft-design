import { tv } from "../../lib/tv";

export const activityInboxToolbar = tv({
  slots: {
    controls: [
      "flex shrink-0 flex-nowrap items-center gap-2",
      "bg-layer-canvas px-(--column-margin) py-3",
      // On a desktop a 44px row: the 32px controls 6px from either edge.
      "md:pointer-fine:py-[calc((var(--header-height)-var(--control-height))/2)]",
    ],
    selectionToolbar: [
      // One 44px row while the controls fit, whatever the window; they wrap
      // onto a second line in a narrow column, so no width switch is needed
      // (design/patterns/responsive.md#switch-on-the-regions-width). 6px
      // above a 32px control and 5px below it plus the 1px hairline make the
      // 44px row, on whole pixels, with the control 6px from either edge.
      "flex min-h-11 shrink-0 flex-wrap items-center gap-2 pt-1.5 pb-[5px]",
      // With a mouse the controls are 34px: 4px above and 5px below with the hairline keep 44.
      "md:pointer-fine:pt-1 md:pointer-fine:pb-[5px]",
      "border-b border-line-hairline bg-layer-canvas px-(--column-margin)",
      "**:data-[activity-inbox-action=sort]:text-foreground-muted",
      "**:data-[activity-inbox-action=sort]:hover:text-foreground",
    ],
    selectionCount: ["mr-1", "text-footnote font-bold text-foreground"],
  },
});
