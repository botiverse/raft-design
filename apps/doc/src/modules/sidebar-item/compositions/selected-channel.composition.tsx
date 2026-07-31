import { Hash } from "lucide-react";
import {
  SidebarItem,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemSubtitle,
  SidebarItemTitle,
} from "raft-ui";

export function SidebarItemSelectedChannelComposition() {
  return (
    <div className="w-72">
      <SidebarItem active>
        <SidebarItemChannelIcon aria-hidden>
          <Hash />
        </SidebarItemChannelIcon>
        <SidebarItemContent>
          <SidebarItemTitle>proj-uiux</SidebarItemTitle>
          <SidebarItemSubtitle>Cindy replied</SidebarItemSubtitle>
        </SidebarItemContent>
      </SidebarItem>
    </div>
  );
}
