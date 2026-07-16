import { AtSign, BellOff, Pencil } from "lucide-react";
import { ChatSidebarItemIndicator, ChatSidebarItemMetaIcon } from "raft-ui";

export function PlaygroundMutedIndicator() {
  return (
    <ChatSidebarItemMetaIcon
      role="img"
      aria-label="Activity muted"
      title="Activity muted. Direct mentions can still notify you."
    >
      <BellOff aria-hidden />
    </ChatSidebarItemMetaIcon>
  );
}

export function PlaygroundMentionIndicator() {
  return (
    <ChatSidebarItemIndicator role="img" aria-label="Mentioned you">
      <AtSign aria-hidden />
    </ChatSidebarItemIndicator>
  );
}

export function PlaygroundDraftIndicator() {
  return (
    <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
      <Pencil aria-hidden />
    </ChatSidebarItemMetaIcon>
  );
}
