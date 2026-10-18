import { BellOff, Hash, Monitor } from "lucide-react";
import {
  Button,
  SidebarItem,
  SidebarItemAside,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIcon,
  SidebarItemMeta,
  SidebarItemMetaIcon,
  SidebarItemSubtitle,
  SidebarItemTitle,
} from "raft-ui";

export function SidebarItemTonesComposition() {
  return (
    <div>
      <SidebarItem tone="unread" render={<a href="#composition-tones" />}>
        <SidebarItemChannelIcon>
          <Hash />
        </SidebarItemChannelIcon>
        <SidebarItemContent>
          <SidebarItemTitle>release-review</SidebarItemTitle>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemCount>2</SidebarItemCount>
        </SidebarItemAside>
      </SidebarItem>
      <SidebarItem tone="muted" render={<a href="#composition-tones" />}>
        <SidebarItemChannelIcon>
          <Hash />
        </SidebarItemChannelIcon>
        <SidebarItemContent>
          <SidebarItemTitle>random</SidebarItemTitle>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemMetaIcon role="img" aria-label="Muted">
            <BellOff aria-hidden />
          </SidebarItemMetaIcon>
          <SidebarItemMeta>12</SidebarItemMeta>
        </SidebarItemAside>
      </SidebarItem>
      <SidebarItem tone="away" render={<a href="#composition-tones" />}>
        <SidebarItemChannelIcon>
          <Hash />
        </SidebarItemChannelIcon>
        <SidebarItemContent>
          <SidebarItemTitle>design-crit</SidebarItemTitle>
        </SidebarItemContent>
      </SidebarItem>
      <SidebarItem interactive={false} wrap>
        <SidebarItemIcon>
          <Monitor />
        </SidebarItemIcon>
        <SidebarItemContent stacked>
          <SidebarItemTitle>This Mac</SidebarItemTitle>
          <SidebarItemSubtitle>Not running agents yet</SidebarItemSubtitle>
        </SidebarItemContent>
        <Button variant="outline" size="md" render={<a href="#composition-tones" />}>
          Enable
        </Button>
      </SidebarItem>
    </div>
  );
}
