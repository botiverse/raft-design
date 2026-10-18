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
  PanelAction,
  PanelActions,
  PanelHeader,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeading,
  PanelMeta,
  PanelStatus,
  PanelTitle,
  PanelToggleAction,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@botiverse/raft-ui";

import type { PlaygroundRoomChannel } from "../mock/index.ts";
import { PlaygroundConversationBackButton } from "../navigation/conversation-back-button.tsx";

export function PlaygroundChannelPanelHeader({
  channel,
  onBack,
}: {
  channel: PlaygroundRoomChannel;
  onBack?: () => void;
}) {
  const Icon = channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
  const [isMuted, setIsMuted] = useState(channel.navigation.muted);

  return (
    <PanelHeader>
      <PlaygroundConversationBackButton onBack={onBack} />
      <PanelHeaderIcon className={onBack ? undefined : "max-md:col-start-1"}>
        <Icon className="size-3.5" />
      </PanelHeaderIcon>
      <PanelHeaderContent
        className={onBack ? "max-md:col-start-3" : "max-md:col-start-2 max-md:col-span-2"}
      >
        <PanelHeading>
          <PanelTitle>{channel.name}</PanelTitle>
          {isMuted ? (
            <PanelStatus title="Activity muted. Direct mentions can still notify you.">
              <BellOff />
            </PanelStatus>
          ) : null}
        </PanelHeading>
        <PanelMeta>{channel.subtitle}</PanelMeta>
      </PanelHeaderContent>
      <TooltipProvider delay={650}>
        <PanelActions>
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
        </PanelActions>
      </TooltipProvider>
    </PanelHeader>
  );
}
