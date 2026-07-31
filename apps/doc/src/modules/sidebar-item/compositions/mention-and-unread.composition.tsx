import { AtSign, BellOff, Hash } from "lucide-react";
import {
  SidebarItem,
  SidebarItemAside,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIndicator,
  SidebarItemMetaIcon,
  SidebarItemSubtitle,
  SidebarItemTitle,
} from "raft-ui";

export function SidebarItemMentionAndUnreadComposition() {
  return (
    <div className="w-72">
      <SidebarItem>
        <SidebarItemChannelIcon aria-hidden>
          <Hash />
        </SidebarItemChannelIcon>
        <SidebarItemContent>
          <SidebarItemTitle>design</SidebarItemTitle>
          <SidebarItemSubtitle>Mentioned you</SidebarItemSubtitle>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemIndicator role="img" aria-label="Mentioned you">
            <AtSign aria-hidden />
          </SidebarItemIndicator>
          <SidebarItemCount>12</SidebarItemCount>
          <SidebarItemMetaIcon role="img" aria-label="Activity muted">
            <BellOff aria-hidden />
          </SidebarItemMetaIcon>
        </SidebarItemAside>
      </SidebarItem>
    </div>
  );
}
