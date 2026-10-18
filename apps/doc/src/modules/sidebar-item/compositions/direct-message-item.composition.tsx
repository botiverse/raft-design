import { AtSign, Pencil } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  SidebarItem,
  SidebarItemAside,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIcon,
  SidebarItemIndicator,
  SidebarItemMetaIcon,
  SidebarItemStatus,
  SidebarItemSubtitle,
  SidebarItemTitle,
  Status,
} from "@botiverse/raft-ui";

export function SidebarItemDirectMessageComposition() {
  return (
    <div>
      <SidebarItem active>
        <SidebarItemIcon>
          <Avatar size="2xs" type="human">
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
        </SidebarItemIcon>
        <SidebarItemContent>
          <SidebarItemTitle>Samira Khan</SidebarItemTitle>
          <SidebarItemSubtitle>Sent you a file</SidebarItemSubtitle>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemStatus>
            <Status aria-label="Online" variant="success" />
          </SidebarItemStatus>
        </SidebarItemAside>
      </SidebarItem>

      <SidebarItem>
        <SidebarItemIcon>
          <Avatar size="2xs" type="agent">
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
        </SidebarItemIcon>
        <SidebarItemContent>
          <SidebarItemTitle>Claude Assistant</SidebarItemTitle>
          <SidebarItemSubtitle>Planning…</SidebarItemSubtitle>
        </SidebarItemContent>
        <SidebarItemAside>
          <SidebarItemIndicator role="img" aria-label="Mentioned you">
            <AtSign aria-hidden />
          </SidebarItemIndicator>
          <SidebarItemStatus>
            <Status aria-label="Working" variant="primary" />
          </SidebarItemStatus>
          <SidebarItemCount>1</SidebarItemCount>
          <SidebarItemMetaIcon role="img" aria-label="Draft">
            <Pencil aria-hidden />
          </SidebarItemMetaIcon>
        </SidebarItemAside>
      </SidebarItem>
    </div>
  );
}
