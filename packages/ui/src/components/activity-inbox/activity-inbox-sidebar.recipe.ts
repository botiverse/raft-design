import { tv } from "../../lib/tv";

export const activityInboxSidebar = tv({
  slots: {
    sidebar: ["w-48 shrink-0", "max-md:hidden", "md:flex"],
    sidebarBody: [],
    sidebarContent: ["p-3"],
  },
  variants: {
    theme: {
      brutal: {
        sidebar: ["border-r-2 border-black"],
        sidebarBody: ["bg-white"],
        sidebarContent: [
          "[&_[data-slot=sidebar-group-label]]:mt-5 [&_[data-slot=sidebar-group-label]]:mb-1",
          "**:data-[slot=sidebar-group-label]:flex **:data-[slot=sidebar-group-label]:items-center [&_[data-slot=sidebar-group-label]]:gap-2",
          "[&_[data-slot=sidebar-group-label]]:px-2 [&_[data-slot=sidebar-group-label]]:py-0",
          "**:data-[slot=sidebar-group-label]:font-sans [&_[data-slot=sidebar-group-label]]:font-black [&_[data-slot=sidebar-group-label]]:tracking-widest **:data-[slot=sidebar-group-label]:text-black/40 **:data-[slot=sidebar-group-label]:uppercase",
          "**:data-activity-inbox-show-all:font-sans **:data-activity-inbox-show-all:text-[10px] [&_[data-activity-inbox-show-all]]:font-black",
          "[&_[data-activity-inbox-show-all]]:tracking-normal **:data-activity-inbox-show-all:whitespace-nowrap **:data-activity-inbox-show-all:normal-case",
          "**:data-activity-inbox-show-all:text-black/50 **:data-activity-inbox-show-all:underline **:data-activity-inbox-show-all:decoration-2 **:data-activity-inbox-show-all:underline-offset-2",
          "[&_[data-activity-inbox-show-all]:hover]:text-black",
        ],
      },
      elegant: {
        sidebar: ["w-56", "dark:bg-layer-canvas-muted"],
        sidebarContent: [
          "[&_[data-slot=sidebar-group-label]]:mt-5 [&_[data-slot=sidebar-group-label]]:mb-1",
          "**:data-[slot=sidebar-group-label]:flex **:data-[slot=sidebar-group-label]:items-center [&_[data-slot=sidebar-group-label]]:gap-2",
          "[&_[data-slot=sidebar-group-label]]:px-2 [&_[data-slot=sidebar-group-label]]:py-0",
          "**:data-[slot=sidebar-group-label]:font-sans [&_[data-slot=sidebar-group-label]]:font-medium **:data-[slot=sidebar-group-label]:text-foreground-placeholder **:data-[slot=sidebar-group-label]:normal-case",
          "**:data-activity-inbox-show-all:font-sans **:data-activity-inbox-show-all:text-[10px] [&_[data-activity-inbox-show-all]]:font-medium",
          "[&_[data-activity-inbox-show-all]]:tracking-normal **:data-activity-inbox-show-all:whitespace-nowrap **:data-activity-inbox-show-all:normal-case",
          "**:data-activity-inbox-show-all:text-foreground-placeholder **:data-activity-inbox-show-all:underline-offset-2 **:data-activity-inbox-show-all:outline-none",
          "[&_[data-activity-inbox-show-all]:hover]:text-foreground-muted [&_[data-activity-inbox-show-all]:hover]:underline",
          "[&_[data-activity-inbox-show-all]:focus-visible]:text-foreground-muted [&_[data-activity-inbox-show-all]:focus-visible]:underline",
        ],
      },
    },
  },
});
