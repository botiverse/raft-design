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
import { Avatar, AvatarFallback, AvatarImage, Status } from "raft-ui";
import {
  ChatMainPanelActions,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
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
            <span
              title="Activity muted. Direct mentions can still notify you."
              className="inline-flex shrink-0 items-center gap-1 border-2 border-black bg-brutal-orange/25 px-1.5 py-1 text-[11px] font-bold uppercase leading-none text-black"
            >
              <BellOff size={11} />
              Muted
            </span>
          ) : null}
        </div>
        <ChatMainPanelSubtitle>{channel.subtitle}</ChatMainPanelSubtitle>
      </ChatMainPanelTitleBlock>
      <ChatMainPanelActions>
        <PanelIconButton aria-label="Search this channel">
          <Search />
        </PanelIconButton>
        {isMuted ? (
          <PanelIconButton
            aria-label="Unmute activity for this channel"
            className="bg-brutal-orange text-black"
          >
            <BellOff />
          </PanelIconButton>
        ) : (
          <PanelIconButton aria-label="Mute activity for this channel">
            <Bell />
          </PanelIconButton>
        )}
        <PanelIconButton aria-label="Stop all agents in this channel">
          <Square />
        </PanelIconButton>
        <PanelIconButton aria-label="Edit channel">
          <Settings />
        </PanelIconButton>
        <PanelIconButton aria-label="View participants" className="w-auto min-w-7 gap-1.5 px-2.5">
          <Users />
          <span className="min-w-[1ch] text-center font-sans text-[12px] font-medium leading-none tabular-nums text-foreground-muted/68">
            {channel.memberCount}
          </span>
        </PanelIconButton>
      </ChatMainPanelActions>
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
      <Avatar
        size="md"
        type={actor.type}
        className="[[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-brutal-cyan [[data-preview-theme=brutal]_&]:text-black"
      >
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
      <ChatMainPanelActions>
        <PanelIconButton aria-label="Mute activity for this DM">
          <Bell />
        </PanelIconButton>
      </ChatMainPanelActions>
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
