import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  PanelHeader,
  PanelHeaderContent,
  PanelHeading,
  PanelStatus,
  PanelTitle,
  Status,
} from "raft-ui";

import { getPlaygroundDmActor, type PlaygroundDirectMessage } from "../mock/index.ts";
import { PlaygroundConversationBackButton } from "../navigation/conversation-back-button.tsx";
import { PLAYGROUND_PRESENCE_STATUS } from "../message/playground-presence.ts";

export function PlaygroundDmPanelHeader({ dm }: { dm: PlaygroundDirectMessage }) {
  const actor = getPlaygroundDmActor(dm);
  const isAgent = actor.type === "agent";
  const presence = actor.presence
    ? PLAYGROUND_PRESENCE_STATUS[actor.presence]
    : PLAYGROUND_PRESENCE_STATUS.offline;

  return (
    <PanelHeader>
      <PlaygroundConversationBackButton />
      <PanelHeaderContent>
        <Avatar data-slot="panel-header-icon" size={isAgent ? "sm" : "md"} type={actor.type}>
          {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
          <AvatarFallback>{actor.fallback}</AvatarFallback>
        </Avatar>
        <PanelHeading>
          <PanelTitle className={isAgent ? "max-md:text-[15px]" : undefined}>{dm.name}</PanelTitle>
          {isAgent ? (
            <PanelStatus title={presence.label}>
              <Status aria-hidden size="sm" variant={presence.variant} pulse={presence.pulse} />
              {presence.label}
            </PanelStatus>
          ) : null}
        </PanelHeading>
      </PanelHeaderContent>
    </PanelHeader>
  );
}
