import { tv } from "../../lib/tv";

export const activityInboxSidebar = tv({
  slots: {
    sidebar: [
      "shrink-0",
      "max-md:hidden",
      "md:flex",
      "w-56 border-r border-line-seam bg-layer-canvas",
    ],
    sidebarBody: ["bg-layer-canvas"],
    sidebarContent: [
      "px-1 py-3",
      "[&_[data-slot=sidebar-group-label]]:mt-5 [&_[data-slot=sidebar-group-label]]:mb-1",
      "**:data-[slot=sidebar-group-label]:flex **:data-[slot=sidebar-group-label]:items-center [&_[data-slot=sidebar-group-label]]:gap-2",
      "[&_[data-slot=sidebar-group-label]]:px-4 [&_[data-slot=sidebar-group-label]]:py-0",
      "**:data-[slot=sidebar-group-label]:font-sans **:data-[slot=sidebar-group-label]:text-footnote [&_[data-slot=sidebar-group-label]]:font-bold",
      "**:data-[slot=sidebar-group-label]:text-foreground-hint **:data-[slot=sidebar-group-label]:normal-case [&_[data-slot=sidebar-group-label]]:tracking-normal",
      "**:data-activity-inbox-show-all:whitespace-nowrap",
    ],
  },
});
