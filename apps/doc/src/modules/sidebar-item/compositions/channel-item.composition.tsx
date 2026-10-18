import { AtSign, BellOff, Hash, Pencil } from "lucide-react";
import {
  SidebarItem,
  SidebarItemAside,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIcon,
  SidebarItemIndicator,
  SidebarItemMetaIcon,
  SidebarItemTitle,
} from "@botiverse/raft-ui";

export function SidebarItemChannelComposition() {
  return (
    <div>
      <SidebarItem active>
        <SidebarItemIcon aria-hidden>
          <SidebarItemChannelIcon>
            <Hash />
          </SidebarItemChannelIcon>
        </SidebarItemIcon>
        <SidebarItemContent>
          <SidebarItemTitle>general</SidebarItemTitle>
        </SidebarItemContent>
      </SidebarItem>

      <SidebarItem>
        <SidebarItemIcon aria-hidden>
          <SidebarItemChannelIcon>
            <Hash />
          </SidebarItemChannelIcon>
        </SidebarItemIcon>
        <SidebarItemContent>
          <SidebarItemTitle>design</SidebarItemTitle>
          <SidebarItemMetaIcon role="img" aria-label="Activity muted">
            <BellOff aria-hidden />
          </SidebarItemMetaIcon>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemIndicator role="img" aria-label="Mentioned you">
            <AtSign aria-hidden />
          </SidebarItemIndicator>
          <SidebarItemCount>12</SidebarItemCount>
          <SidebarItemMetaIcon role="img" aria-label="Draft">
            <Pencil aria-hidden />
          </SidebarItemMetaIcon>
        </SidebarItemAside>
      </SidebarItem>
    </div>
  );
}
