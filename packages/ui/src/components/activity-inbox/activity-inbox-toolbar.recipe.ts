import { tv } from "../../lib/tv";

export const activityInboxToolbar = tv({
  slots: {
    controls: ["flex shrink-0 flex-nowrap items-center gap-2 px-3 py-2.5"],
    selectionToolbar: [
      "flex min-h-11 shrink-0 items-center gap-2 px-3",
      "max-md:flex-wrap max-md:py-2",
      "md:h-11 md:flex-nowrap md:py-0",
    ],
    selectionCount: ["mr-1 text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        controls: ["border-b-2 border-black bg-white"],
        selectionToolbar: [
          "border-b-2 border-black bg-black/3",
          "pl-[26px]",
          "**:data-[activity-inbox-action=primary]:bg-brutal-cyan **:data-[activity-inbox-action=primary]:text-foreground-strong [&_[data-activity-inbox-action=primary]:hover]:bg-brutal-cyan",
          "**:data-[activity-inbox-action=sort]:font-mono [&_[data-activity-inbox-action=sort]]:font-bold **:data-[activity-inbox-action=sort]:text-black/60",
          "[&_[data-activity-inbox-action=sort]:hover]:border-transparent [&_[data-activity-inbox-action=sort]:hover]:bg-transparent [&_[data-activity-inbox-action=sort]:hover]:text-black",
        ],
        selectionCount: ["font-black text-black"],
      },
      elegant: {
        controls: [
          "border-b border-line-hairline bg-layer-panel",
          "dark:border-line-hairline dark:bg-transparent",
          "px-7 max-md:pl-5 max-md:pr-3.5 md:py-3",
          "md:[&_[data-slot=tabs-list]]:h-[34px] md:[&_[data-slot=tabs-tab]]:h-8 md:[&_[data-slot=tabs-tab]]:py-1.5",
          "md:[&_[data-slot=input-group]]:h-[34px] md:[&_[data-slot=input-group-control]]:py-1.5",
        ],
        selectionToolbar: [
          "pr-7 pl-[52.5px] max-md:pr-3.5 max-md:pl-[44.5px]",
          "[&_[data-activity-inbox-action=sort]]:font-medium",
          "[&_[data-activity-inbox-action=sort]:hover]:bg-transparent [&_[data-activity-inbox-action=sort]:hover]:text-foreground-strong",
        ],
        selectionCount: ["font-medium text-foreground-strong"],
      },
    },
  },
});
