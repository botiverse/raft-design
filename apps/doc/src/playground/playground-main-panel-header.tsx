import {
  Bell,
  BellOff,
  ChevronLeft,
  EllipsisVertical,
  GitBranch,
  Hash,
  Lock,
  Search,
  Settings,
  Square,
  Users,
} from "lucide-react";
import { Link, useMatch } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  BrutalOnly,
  Button,
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
  ChatMainPanelTitleBadge,
  ChatMainPanelSubtitle,
  ChatMainPanelTitle,
  ChatMainPanelTitleBlock,
  ChatMainPanelTitleRow,
  PanelButton,
  PanelButtonCount,
  PanelButtonIcon,
  PanelToggleButton,
} from "raft-ui/wip";
import { useState } from "react";

import {
  getPlaygroundDmActor,
  type PlaygroundChannel,
  type PlaygroundDirectMessage,
  type PlaygroundRoomChannel,
} from "./mock/index.ts";
import { PLAYGROUND_PRESENCE_STATUS } from "./playground-presence.ts";

function MobileBackButton() {
  const channelMatch = useMatch({
    from: "/playground/_channel/$channelId",
    shouldThrow: false,
  });
  if (!channelMatch) return null;

  return (
    <Button
      render={
        <Link
          to="/playground/$channelId"
          params={{ channelId: channelMatch.params.channelId }}
          search={{ panel: "list" }}
        />
      }
      nativeButton={false}
      variant="outline"
      size="icon-sm"
      className="mr-1 max-md:col-start-1 max-md:row-start-1 md:hidden"
      aria-label="Back to conversations"
    >
      <ChevronLeft aria-hidden />
    </Button>
  );
}

function ChannelHeader({ channel }: { channel: PlaygroundRoomChannel }) {
  const Icon = channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
  const [isMuted, setIsMuted] = useState(channel.navigation.muted);

  return (
    <ChatMainPanelHeader>
      <MobileBackButton />
      <ChatMainPanelHeaderIcon>
        <Icon />
      </ChatMainPanelHeaderIcon>
      <ChatMainPanelTitleBlock>
        <ChatMainPanelTitleRow>
          <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
          {isMuted ? (
            <ChatMainPanelTitleBadge title="Activity muted. Direct mentions can still notify you.">
              <BellOff />
              <BrutalOnly>Muted</BrutalOnly>
            </ChatMainPanelTitleBadge>
          ) : null}
        </ChatMainPanelTitleRow>
        <ChatMainPanelSubtitle>{channel.subtitle}</ChatMainPanelSubtitle>
      </ChatMainPanelTitleBlock>
      <TooltipProvider delay={650}>
        <ChatMainPanelActions>
          <Tooltip>
            <TooltipTrigger render={<PanelButton aria-label="Search this channel" />}>
              <PanelButtonIcon>
                <Search />
              </PanelButtonIcon>
            </TooltipTrigger>
            <TooltipContent side="bottom">Search this channel</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <PanelToggleButton
                  className="max-md:hidden"
                  pressed={isMuted}
                  onPressedChange={setIsMuted}
                  aria-label={
                    isMuted ? "Unmute activity for this channel" : "Mute activity for this channel"
                  }
                />
              }
            >
              <PanelButtonIcon>{isMuted ? <BellOff /> : <Bell />}</PanelButtonIcon>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isMuted ? "Unmute activity for this channel" : "Mute activity for this channel"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <PanelButton
                  className="max-md:hidden"
                  aria-label="Stop all agents in this channel"
                />
              }
            >
              <PanelButtonIcon>
                <Square />
              </PanelButtonIcon>
            </TooltipTrigger>
            <TooltipContent side="bottom">Stop all agents in this channel</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={<PanelButton className="max-md:hidden" aria-label="View participants" />}
            >
              <PanelButtonIcon>
                <Users />
              </PanelButtonIcon>
              <PanelButtonCount>{channel.memberCount}</PanelButtonCount>
            </TooltipTrigger>
            <TooltipContent side="bottom">View participants</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={<PanelButton className="max-md:hidden" aria-label="Edit channel" />}
            >
              <PanelButtonIcon>
                <Settings />
              </PanelButtonIcon>
            </TooltipTrigger>
            <TooltipContent side="bottom">Edit channel</TooltipContent>
          </Tooltip>
          <PanelButton className="md:hidden" aria-label="More options">
            <PanelButtonIcon>
              <EllipsisVertical />
            </PanelButtonIcon>
          </PanelButton>
        </ChatMainPanelActions>
      </TooltipProvider>
    </ChatMainPanelHeader>
  );
}

function DmHeader({ channel }: { channel: PlaygroundDirectMessage }) {
  const actor = getPlaygroundDmActor(channel);
  const [isMuted, setIsMuted] = useState(channel.navigation.muted);
  const presence = actor.presence
    ? PLAYGROUND_PRESENCE_STATUS[actor.presence]
    : PLAYGROUND_PRESENCE_STATUS.offline;

  return (
    <ChatMainPanelHeader>
      <MobileBackButton />
      <Avatar size="md" type={actor.type}>
        {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
        <AvatarFallback>{actor.fallback}</AvatarFallback>
      </Avatar>
      <ChatMainPanelTitleBlock>
        <ChatMainPanelTitleRow>
          <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
          {actor.presence ? (
            <Status aria-hidden size="md" variant={presence.variant} pulse={presence.pulse} />
          ) : null}
          <ChatMainPanelSubtitle size="md">{channel.subtitle}</ChatMainPanelSubtitle>
        </ChatMainPanelTitleRow>
      </ChatMainPanelTitleBlock>
      <TooltipProvider delay={650}>
        <ChatMainPanelActions>
          <Tooltip>
            <TooltipTrigger
              render={
                <PanelToggleButton
                  aria-label={isMuted ? "Unmute activity for this DM" : "Mute activity for this DM"}
                  pressed={isMuted}
                  onPressedChange={setIsMuted}
                />
              }
            >
              <PanelButtonIcon>{isMuted ? <BellOff /> : <Bell />}</PanelButtonIcon>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isMuted ? "Unmute activity for this DM" : "Mute activity for this DM"}
            </TooltipContent>
          </Tooltip>
        </ChatMainPanelActions>
      </TooltipProvider>
    </ChatMainPanelHeader>
  );
}

export function PlaygroundMainPanelHeader({ channel }: { channel: PlaygroundChannel }) {
  return channel.kind === "dm" ? (
    <DmHeader key={channel.id} channel={channel} />
  ) : (
    <ChannelHeader key={channel.id} channel={channel} />
  );
}
