import { Bookmark, Inbox, Star } from "lucide-react";
import { SidebarItem, SidebarItemIcon, SidebarItemMeta, SidebarItemTitle } from "raft-ui";

export function SidebarItemNavigationComposition() {
  return (
    <div>
      <SidebarItem active variant="default">
        <SidebarItemIcon aria-hidden>
          <Bookmark />
        </SidebarItemIcon>
        <SidebarItemTitle>Saved</SidebarItemTitle>
        <SidebarItemMeta>7</SidebarItemMeta>
      </SidebarItem>

      <SidebarItem active variant="primary">
        <SidebarItemIcon aria-hidden>
          <Star />
        </SidebarItemIcon>
        <SidebarItemTitle>Priority</SidebarItemTitle>
        <SidebarItemMeta>2</SidebarItemMeta>
      </SidebarItem>

      <SidebarItem active variant="accent">
        <SidebarItemIcon aria-hidden>
          <Inbox />
        </SidebarItemIcon>
        <SidebarItemTitle>Activity</SidebarItemTitle>
        <SidebarItemMeta>5</SidebarItemMeta>
      </SidebarItem>
    </div>
  );
}
