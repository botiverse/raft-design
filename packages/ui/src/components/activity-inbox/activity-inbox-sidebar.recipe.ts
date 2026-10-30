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
      "py-0",
      "**:data-[slot=sidebar-group-label]:mt-3 **:data-[slot=sidebar-group-label]:mb-0",
      "**:data-[slot=sidebar-group-label]:flex **:data-[slot=sidebar-group-label]:items-center **:data-[slot=sidebar-group-label]:gap-2",
      "**:data-[slot=sidebar-group-label]:px-5 **:data-[slot=sidebar-group-label]:py-0",
      "**:data-[slot=sidebar-group-label]:font-sans **:data-[slot=sidebar-group-label]:text-footnote **:data-[slot=sidebar-group-label]:font-bold",
      "**:data-[slot=sidebar-group-label]:text-foreground-hint **:data-[slot=sidebar-group-label]:normal-case **:data-[slot=sidebar-group-label]:tracking-normal",
      "**:data-activity-inbox-show-all:whitespace-nowrap",
    ],
  },
});
