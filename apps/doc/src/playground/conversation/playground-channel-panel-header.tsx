import {
  Bell,
  BellOff,
  EllipsisVertical,
  GitBranch,
  Hash,
  Lock,
  Search,
  Settings,
  Square,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  BrutalOnly,
  ConversationPanelActions,
  ConversationPanelHeader,
  ConversationPanelHeaderContent,
  ConversationPanelHeaderIcon,
  ConversationPanelHeading,
  ConversationPanelMeta,
  ConversationPanelStatus,
  ConversationPanelTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
import { PanelAction, PanelToggleAction } from "raft-ui/wip";

import type { PlaygroundRoomChannel } from "../mock/index.ts";
import { PlaygroundConversationBackButton } from "../navigation/conversation-back-button.tsx";

export function PlaygroundChannelPanelHeader({ channel }: { channel: PlaygroundRoomChannel }) {
  const Icon = channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
  const [isMuted, setIsMuted] = useState(channel.navigation.muted);

  return (
    <ConversationPanelHeader>
      <PlaygroundConversationBackButton />
      <ConversationPanelHeaderIcon>
        <Icon />
      </ConversationPanelHeaderIcon>
      <ConversationPanelHeaderContent>
        <ConversationPanelHeading>
          <ConversationPanelTitle>{channel.name}</ConversationPanelTitle>
          {isMuted ? (
            <ConversationPanelStatus title="Activity muted. Direct mentions can still notify you.">
              <BellOff />
              <BrutalOnly>Muted</BrutalOnly>
            </ConversationPanelStatus>
          ) : null}
        </ConversationPanelHeading>
        <ConversationPanelMeta>{channel.subtitle}</ConversationPanelMeta>
      </ConversationPanelHeaderContent>
      <TooltipProvider delay={650}>
        <ConversationPanelActions>
          <Tooltip>
            <TooltipTrigger render={<PanelAction aria-label="Search this channel" />}>
              <Search />
            </TooltipTrigger>
            <TooltipContent side="bottom">Search this channel</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <PanelToggleAction
                  className="max-md:hidden"
                  pressed={isMuted}
                  onPressedChange={setIsMuted}
                  aria-label={
                    isMuted ? "Unmute activity for this channel" : "Mute activity for this channel"
                  }
                />
              }
            >
              {isMuted ? <BellOff /> : <Bell />}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isMuted ? "Unmute activity for this channel" : "Mute activity for this channel"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <PanelAction
                  className="max-md:hidden"
                  aria-label="Stop all agents in this channel"
                />
              }
            >
              <Square />
            </TooltipTrigger>
            <TooltipContent side="bottom">Stop all agents in this channel</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={<PanelAction className="max-md:hidden" aria-label="View participants" />}
            >
              <Users />
              {channel.memberCount}
            </TooltipTrigger>
            <TooltipContent side="bottom">View participants</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={<PanelAction className="max-md:hidden" aria-label="Edit channel" />}
            >
              <Settings />
            </TooltipTrigger>
            <TooltipContent side="bottom">Edit channel</TooltipContent>
          </Tooltip>
          <PanelAction className="md:hidden" aria-label="More options">
            <EllipsisVertical />
          </PanelAction>
        </ConversationPanelActions>
      </TooltipProvider>
    </ConversationPanelHeader>
  );
}
