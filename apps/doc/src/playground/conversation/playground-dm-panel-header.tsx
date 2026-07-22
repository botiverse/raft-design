import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ConversationPanelHeader,
  ConversationPanelHeaderContent,
  ConversationPanelHeading,
  ConversationPanelStatus,
  ConversationPanelTitle,
  Status,
} from "raft-ui";

import { PlaygroundSidebarTrigger } from "../app-shell/playground-sidebar-trigger.tsx";
import { getPlaygroundDmActor, type PlaygroundDirectMessage } from "../mock/index.ts";
import { PlaygroundConversationBackButton } from "../navigation/conversation-back-button.tsx";
import { PLAYGROUND_PRESENCE_STATUS } from "../message/playground-presence.ts";
import { usePlaygroundConversationHeaderClassName } from "./playground-conversation-header-class-name.ts";

export function PlaygroundDmPanelHeader({ dm }: { dm: PlaygroundDirectMessage }) {
  const actor = getPlaygroundDmActor(dm);
  const isAgent = actor.type === "agent";
  const presence = actor.presence
    ? PLAYGROUND_PRESENCE_STATUS[actor.presence]
    : PLAYGROUND_PRESENCE_STATUS.offline;
  const headerClassName = usePlaygroundConversationHeaderClassName();

  return (
    <ConversationPanelHeader className={headerClassName}>
      <PlaygroundConversationBackButton />
      <PlaygroundSidebarTrigger />
      <ConversationPanelHeaderContent>
        <Avatar
          data-slot="conversation-panel-header-icon"
          size={isAgent ? "sm" : "md"}
          type={actor.type}
        >
          {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
          <AvatarFallback>{actor.fallback}</AvatarFallback>
        </Avatar>
        <ConversationPanelHeading>
          <ConversationPanelTitle className={isAgent ? "max-md:text-[15px]" : undefined}>
            {dm.name}
          </ConversationPanelTitle>
          {isAgent ? (
            <ConversationPanelStatus title={presence.label}>
              <Status aria-hidden size="sm" variant={presence.variant} pulse={presence.pulse} />
              {presence.label}
            </ConversationPanelStatus>
          ) : null}
        </ConversationPanelHeading>
      </ConversationPanelHeaderContent>
    </ConversationPanelHeader>
  );
}
