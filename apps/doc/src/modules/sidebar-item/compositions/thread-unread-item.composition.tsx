import { AtSign, BellOff, Hash } from "lucide-react";
import {
  SidebarItem,
  SidebarItemAside,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemCountSeparator,
  SidebarItemIcon,
  SidebarItemIndicator,
  SidebarItemMeta,
  SidebarItemMetaIcon,
  SidebarItemThreadCount,
  SidebarItemTitle,
} from "raft-ui";

export function SidebarItemThreadUnreadComposition() {
  return (
    <div>
      <SidebarItem>
        <SidebarItemIcon aria-hidden>
          <SidebarItemChannelIcon>
            <Hash />
          </SidebarItemChannelIcon>
        </SidebarItemIcon>
        <SidebarItemContent>
          <SidebarItemTitle className="font-bold">proj-rui</SidebarItemTitle>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemCount variant="accent">
            <SidebarItemThreadCount>2</SidebarItemThreadCount>
          </SidebarItemCount>
        </SidebarItemAside>
      </SidebarItem>

      <SidebarItem>
        <SidebarItemIcon aria-hidden>
          <SidebarItemChannelIcon>
            <Hash />
          </SidebarItemChannelIcon>
        </SidebarItemIcon>
        <SidebarItemContent>
          <SidebarItemTitle className="font-bold">infra</SidebarItemTitle>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemIndicator role="img" aria-label="Mentioned you">
            <AtSign aria-hidden />
          </SidebarItemIndicator>
          <SidebarItemCount variant="accent">
            8
            <SidebarItemCountSeparator />
            <SidebarItemThreadCount>3</SidebarItemThreadCount>
          </SidebarItemCount>
        </SidebarItemAside>
      </SidebarItem>

      <SidebarItem>
        <SidebarItemIcon aria-hidden>
          <SidebarItemChannelIcon>
            <Hash />
          </SidebarItemChannelIcon>
        </SidebarItemIcon>
        <SidebarItemContent>
          <SidebarItemTitle>random</SidebarItemTitle>
          <SidebarItemMetaIcon role="img" aria-label="Activity muted">
            <BellOff aria-hidden />
          </SidebarItemMetaIcon>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemMeta>
            12
            <SidebarItemCountSeparator />
            <SidebarItemThreadCount>2</SidebarItemThreadCount>
          </SidebarItemMeta>
        </SidebarItemAside>
      </SidebarItem>
    </div>
  );
}
