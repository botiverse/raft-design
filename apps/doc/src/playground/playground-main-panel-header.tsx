import {
  Bell,
  BellOff,
  GitBranch,
  Hash,
  Lock,
  Search,
  Settings,
  Square,
  Users,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Status,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
import {
  ChatMainPanelActions,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
  ChatMainPanelMutedBadge,
  ChatMainPanelSubtitle,
  ChatMainPanelTitle,
  ChatMainPanelTitleBlock,
  PanelIconButton,
} from "raft-ui/wip";

import {
  getPlaygroundDmActor,
  type PlaygroundChannel,
  type PlaygroundDirectMessage,
  type PlaygroundRoomChannel,
} from "./mock/index.ts";

function ChannelHeader({ channel }: { channel: PlaygroundRoomChannel }) {
  const Icon = channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
  const isMuted = channel.sidebar.muted;

  return (
    <ChatMainPanelHeader>
      <ChatMainPanelHeaderIcon className="[&_svg]:size-[14px]">
        <Icon />
      </ChatMainPanelHeaderIcon>
      <ChatMainPanelTitleBlock>
        <div className="flex min-w-0 items-center gap-2">
          <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
          {isMuted ? (
            <ChatMainPanelMutedBadge>
              <BellOff />
              Muted
            </ChatMainPanelMutedBadge>
          ) : null}
        </div>
        <ChatMainPanelSubtitle>{channel.subtitle}</ChatMainPanelSubtitle>
      </ChatMainPanelTitleBlock>
      <TooltipProvider delay={650}>
        <ChatMainPanelActions>
          <Tooltip>
            <TooltipTrigger render={<PanelIconButton aria-label="Search this channel" />}>
              <Search />
            </TooltipTrigger>
            <TooltipContent side="bottom">Search this channel</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <PanelIconButton
                  pressed={isMuted}
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
              render={<PanelIconButton aria-label="Stop all agents in this channel" />}
            >
              <Square />
            </TooltipTrigger>
            <TooltipContent side="bottom">Stop all agents in this channel</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <PanelIconButton
                  aria-label="View participants"
                  className="w-auto min-w-7 gap-1.5 px-2.5"
                />
              }
            >
              <Users />
              <span className="min-w-[1ch] text-center font-sans text-[12px] font-medium leading-none tabular-nums text-foreground-icon">
                {channel.memberCount}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">View participants</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<PanelIconButton aria-label="Edit channel" />}>
              <Settings />
            </TooltipTrigger>
            <TooltipContent side="bottom">Edit channel</TooltipContent>
          </Tooltip>
        </ChatMainPanelActions>
      </TooltipProvider>
    </ChatMainPanelHeader>
  );
}

function DmHeader({ channel }: { channel: PlaygroundDirectMessage }) {
  const actor = getPlaygroundDmActor(channel);
  const presenceVariant =
    actor.presence === "online" || actor.presence === "working"
      ? "success"
      : actor.presence === "idle"
        ? "warning"
        : "default";

  return (
    <ChatMainPanelHeader>
      <Avatar size="md" type={actor.type}>
        {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
        <AvatarFallback>{actor.fallback}</AvatarFallback>
      </Avatar>
      <ChatMainPanelTitleBlock>
        <div className="flex min-w-0 items-center gap-2">
          <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
          {actor.presence ? (
            <Status
              aria-hidden
              size="md"
              variant={presenceVariant}
              pulse={actor.presence === "working"}
            />
          ) : null}
          <ChatMainPanelSubtitle className="text-sm [[data-preview-theme=brutal]_&]:text-black/60">
            {channel.subtitle}
          </ChatMainPanelSubtitle>
        </div>
      </ChatMainPanelTitleBlock>
      <TooltipProvider delay={650}>
        <ChatMainPanelActions>
          <Tooltip>
            <TooltipTrigger render={<PanelIconButton aria-label="Mute activity for this DM" />}>
              <Bell />
            </TooltipTrigger>
            <TooltipContent side="bottom">Mute activity for this DM</TooltipContent>
          </Tooltip>
        </ChatMainPanelActions>
      </TooltipProvider>
    </ChatMainPanelHeader>
  );
}

export function PlaygroundMainPanelHeader({ channel }: { channel: PlaygroundChannel }) {
  return channel.kind === "dm" ? (
    <DmHeader channel={channel} />
  ) : (
    <ChannelHeader channel={channel} />
  );
}
