import { AtSign, BellOff, Pencil } from "lucide-react";
import { SidebarItemIndicator, SidebarItemMetaIcon } from "raft-ui";

export function PlaygroundMutedIndicator() {
  return (
    <SidebarItemMetaIcon
      role="img"
      aria-label="Activity muted"
      title="Activity muted. Direct mentions can still notify you."
    >
      <BellOff aria-hidden />
    </SidebarItemMetaIcon>
  );
}

export function PlaygroundMentionIndicator() {
  return (
    <SidebarItemIndicator role="img" aria-label="Mentioned you">
      <AtSign aria-hidden />
    </SidebarItemIndicator>
  );
}

export function PlaygroundDraftIndicator() {
  return (
    <SidebarItemMetaIcon role="img" aria-label="Draft">
      <Pencil aria-hidden />
    </SidebarItemMetaIcon>
  );
}
