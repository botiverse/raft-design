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
          <SidebarItemCount variant="accent" aria-label="2 threads with new replies">
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
          <SidebarItemCount
            variant="accent"
            aria-label="8 unread messages, 3 threads with new replies"
          >
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
          <SidebarItemMeta aria-label="12 unread messages, 2 threads with new replies">
            12
            <SidebarItemCountSeparator />
            <SidebarItemThreadCount>2</SidebarItemThreadCount>
          </SidebarItemMeta>
        </SidebarItemAside>
      </SidebarItem>
    </div>
  );
}
