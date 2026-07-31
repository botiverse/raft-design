import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  SidebarItem,
  SidebarItemAside,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIcon,
  SidebarItemStatus,
  SidebarItemSubtitle,
  SidebarItemTitle,
} from "raft-ui";

export function SidebarItemAgentPresenceComposition() {
  return (
    <div className="w-72">
      <SidebarItem>
        <SidebarItemIcon>
          <Avatar size="2xs" type="agent">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </SidebarItemIcon>
        <SidebarItemContent>
          <SidebarItemTitle>Atlas</SidebarItemTitle>
          <SidebarItemSubtitle>Working on release notes</SidebarItemSubtitle>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemStatus>
            <Status aria-label="Working" variant="primary" />
          </SidebarItemStatus>
          <SidebarItemCount>2</SidebarItemCount>
        </SidebarItemAside>
      </SidebarItem>
    </div>
  );
}
