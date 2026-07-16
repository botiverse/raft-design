import { Avatar, AvatarFallback, AvatarImage, Status } from "raft-ui";
import {
  ConversationPanelHeader,
  ConversationPanelHeaderContent,
  ConversationPanelHeading,
  ConversationPanelStatus,
  ConversationPanelTitle,
} from "raft-ui/wip";

import { getPlaygroundDmActor, type PlaygroundDirectMessage } from "./mock/index.ts";
import { PlaygroundConversationBackButton } from "./playground-conversation-back-button.tsx";
import { PLAYGROUND_PRESENCE_STATUS } from "./playground-presence.ts";

const mobileStickyHeaderClassName = "max-md:sticky max-md:top-0 max-md:z-30";

export function PlaygroundDmPanelHeader({ dm }: { dm: PlaygroundDirectMessage }) {
  const actor = getPlaygroundDmActor(dm);
  const isAgent = actor.type === "agent";
  const presence = actor.presence
    ? PLAYGROUND_PRESENCE_STATUS[actor.presence]
    : PLAYGROUND_PRESENCE_STATUS.offline;

  return (
    <ConversationPanelHeader className={`${mobileStickyHeaderClassName} max-md:items-center`}>
      <PlaygroundConversationBackButton />
      <Avatar size={isAgent ? "sm" : "md"} type={actor.type}>
        {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
        <AvatarFallback>{actor.fallback}</AvatarFallback>
      </Avatar>
      <ConversationPanelHeaderContent>
        <ConversationPanelHeading
          className={isAgent ? "max-md:flex-col max-md:items-start max-md:gap-0.5" : undefined}
        >
          <ConversationPanelTitle className={isAgent ? "max-md:text-[15px]" : undefined}>
            {dm.name}
          </ConversationPanelTitle>
          {isAgent ? (
            <ConversationPanelStatus
              className="normal-case font-normal"
              mobileVisible
              title={presence.label}
            >
              <Status aria-hidden size="sm" variant={presence.variant} pulse={presence.pulse} />
              {presence.label}
            </ConversationPanelStatus>
          ) : null}
        </ConversationPanelHeading>
      </ConversationPanelHeaderContent>
    </ConversationPanelHeader>
  );
}
