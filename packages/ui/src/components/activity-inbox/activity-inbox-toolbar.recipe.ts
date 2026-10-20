import { tv } from "../../lib/tv";

export const activityInboxToolbar = tv({
  slots: {
    controls: ["flex shrink-0 flex-nowrap items-center gap-2", "bg-layer-canvas px-4 py-3"],
    selectionToolbar: [
      "flex min-h-11 shrink-0 items-center gap-2",
      "max-md:flex-wrap max-md:py-2",
      "md:h-11 md:flex-nowrap md:py-0",
      "border-b border-line-hairline bg-layer-canvas px-4",
      "**:data-[activity-inbox-action=sort]:text-foreground-muted",
      "**:data-[activity-inbox-action=sort]:hover:text-foreground",
    ],
    selectionCount: ["mr-1", "text-footnote font-bold text-foreground"],
  },
});
