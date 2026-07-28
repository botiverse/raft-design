import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Status,
  ChatSidebarItemAside,
  ChatSidebarItemContent,
  ChatSidebarItemCount,
  ChatSidebarItemIcon,
  ChatSidebarItemStatus,
  ChatSidebarItemSubtitle,
  ChatSidebarItemTitle,
} from "raft-ui";

import {
  getPlaygroundDmActor,
  type PlaygroundDirectMessage,
  type PlaygroundPresence,
} from "../mock/index.ts";
import { PLAYGROUND_PRESENCE_STATUS } from "../message/playground-presence.ts";
import {
  PlaygroundDraftIndicator,
  PlaygroundMentionIndicator,
  PlaygroundMutedIndicator,
} from "./chat-sidebar-indicators.tsx";

function DirectMessageStatus({
  status,
  size = "sm",
}: {
  status: PlaygroundPresence;
  size?: "sm" | "md";
}) {
  const config = PLAYGROUND_PRESENCE_STATUS[status];
  return <Status aria-hidden variant={config.variant} size={size} pulse={config.pulse} />;
}

export function ChatSidebarDirectMessageRowContent({
  row,
  hideBadge,
}: {
  row: PlaygroundDirectMessage;
  hideBadge?: boolean;
}) {
  const actor = getPlaygroundDmActor(row);
  const navigation = row.navigation;
  const showBadge = Boolean(navigation.badge && !hideBadge);
  const showAside =
    showBadge ||
    Boolean(navigation.draft) ||
    Boolean(navigation.mention) ||
    Boolean(actor.presence);
  return (
    <>
      <ChatSidebarItemIcon>
        <Avatar size="2xs" type={actor.type}>
          {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
          {actor.fallback ? (
            <AvatarFallback>{actor.fallback}</AvatarFallback>
          ) : actor.avatarSrc ? (
            <AvatarFallback />
          ) : null}
        </Avatar>
      </ChatSidebarItemIcon>
      <ChatSidebarItemContent>
        <ChatSidebarItemTitle>{row.name}</ChatSidebarItemTitle>
        {navigation.muted ? <PlaygroundMutedIndicator /> : null}
        <ChatSidebarItemSubtitle>{row.subtitle}</ChatSidebarItemSubtitle>
      </ChatSidebarItemContent>
      {showAside ? (
        <ChatSidebarItemAside>
          {navigation.mention ? <PlaygroundMentionIndicator /> : null}
          {actor.presence ? (
            <ChatSidebarItemStatus>
              <DirectMessageStatus status={actor.presence} />
            </ChatSidebarItemStatus>
          ) : null}
          {showBadge ? <ChatSidebarItemCount>{navigation.badge}</ChatSidebarItemCount> : null}
          {navigation.draft ? <PlaygroundDraftIndicator /> : null}
        </ChatSidebarItemAside>
      ) : null}
    </>
  );
}
