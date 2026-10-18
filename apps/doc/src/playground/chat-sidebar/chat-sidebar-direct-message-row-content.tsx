import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Status,
  SidebarItemAside,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIcon,
  SidebarItemStatus,
  SidebarItemSubtitle,
  SidebarItemTitle,
} from "@botiverse/raft-ui";

import { getPlaygroundDmActor } from "../mock/index.ts";
import type { PlaygroundDirectMessage, PlaygroundPresence } from "../mock/index.ts";
import { PLAYGROUND_PRESENCE_STATUS } from "../message/playground-presence.ts";
import {
  PlaygroundDraftIndicator,
  PlaygroundMentionIndicator,
  PlaygroundMutedIndicator,
} from "./chat-sidebar-indicators.tsx";

function DirectMessageStatus({ status }: { status: PlaygroundPresence }) {
  const config = PLAYGROUND_PRESENCE_STATUS[status];
  return <Status aria-hidden variant={config.variant} />;
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
      <SidebarItemIcon>
        <Avatar size="2xs" type={actor.type}>
          {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
          {actor.fallback ? (
            <AvatarFallback>{actor.fallback}</AvatarFallback>
          ) : actor.avatarSrc ? (
            <AvatarFallback />
          ) : null}
        </Avatar>
      </SidebarItemIcon>
      <SidebarItemContent>
        <SidebarItemTitle>{row.name}</SidebarItemTitle>
        {navigation.muted ? <PlaygroundMutedIndicator /> : null}
        <SidebarItemSubtitle>{row.subtitle}</SidebarItemSubtitle>
      </SidebarItemContent>
      {showAside ? (
        <SidebarItemAside>
          {navigation.mention ? <PlaygroundMentionIndicator /> : null}
          {actor.presence ? (
            <SidebarItemStatus>
              <DirectMessageStatus status={actor.presence} />
            </SidebarItemStatus>
          ) : null}
          {showBadge ? <SidebarItemCount>{navigation.badge}</SidebarItemCount> : null}
          {navigation.draft ? <PlaygroundDraftIndicator /> : null}
        </SidebarItemAside>
      ) : null}
    </>
  );
}
