import { useState } from "react";
import { Bell, BellOff, CheckSquare, Hash, Search, Settings, Square, Users } from "lucide-react";
import { Avatar, AvatarFallback, BrutalOnly, Status } from "raft-ui";
import {
  ChatMainPanelActions,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
  ChatMainPanelSectionHeader,
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

export type ChatMainPanelHeaderCompositionProps = {
  conversation: "channel" | "dm";
  muted: boolean;
  onMutedChange?: (muted: boolean) => void;
};

export function ChatMainPanelHeaderComposition({
  conversation,
  muted,
  onMutedChange,
}: ChatMainPanelHeaderCompositionProps) {
  if (conversation === "dm") {
    return (
      <ChatMainPanelHeader>
        <Avatar size="md" type="agent">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
        <ChatMainPanelTitleBlock>
          <ChatMainPanelTitleRow>
            <ChatMainPanelTitle>Atlas</ChatMainPanelTitle>
            <Status aria-hidden size="md" variant="success" pulse />
            <ChatMainPanelSubtitle size="md">Working · replies in ~1m</ChatMainPanelSubtitle>
          </ChatMainPanelTitleRow>
        </ChatMainPanelTitleBlock>
        <ChatMainPanelActions>
          <PanelToggleButton
            pressed={muted}
            onPressedChange={onMutedChange}
            aria-label={muted ? "Unmute activity for this DM" : "Mute activity for this DM"}
          >
            <PanelButtonIcon>{muted ? <BellOff /> : <Bell />}</PanelButtonIcon>
          </PanelToggleButton>
        </ChatMainPanelActions>
      </ChatMainPanelHeader>
    );
  }

  return (
    <ChatMainPanelHeader>
      <ChatMainPanelHeaderIcon>
        <Hash />
      </ChatMainPanelHeaderIcon>
      <ChatMainPanelTitleBlock>
        <ChatMainPanelTitleRow>
          <ChatMainPanelTitle>proj-uiux</ChatMainPanelTitle>
          {muted ? (
            <ChatMainPanelTitleBadge title="Activity muted. Direct mentions can still notify you.">
              <BellOff />
              <BrutalOnly>Muted</BrutalOnly>
            </ChatMainPanelTitleBadge>
          ) : null}
        </ChatMainPanelTitleRow>
        <ChatMainPanelSubtitle>Design system migration</ChatMainPanelSubtitle>
      </ChatMainPanelTitleBlock>
      <ChatMainPanelActions>
        <PanelButton aria-label="Search conversation">
          <PanelButtonIcon>
            <Search />
          </PanelButtonIcon>
        </PanelButton>
        <PanelToggleButton
          pressed={muted}
          onPressedChange={onMutedChange}
          aria-label={muted ? "Unmute channel activity" : "Mute channel activity"}
        >
          <PanelButtonIcon>{muted ? <BellOff /> : <Bell />}</PanelButtonIcon>
        </PanelToggleButton>
        <PanelButton aria-label="Stop all agents in this channel">
          <PanelButtonIcon>
            <Square />
          </PanelButtonIcon>
        </PanelButton>
        <PanelButton aria-label="View participants">
          <PanelButtonIcon>
            <Users />
          </PanelButtonIcon>
          <PanelButtonCount>13</PanelButtonCount>
        </PanelButton>
        <PanelButton aria-label="Channel options">
          <PanelButtonIcon>
            <Settings />
          </PanelButtonIcon>
        </PanelButton>
      </ChatMainPanelActions>
    </ChatMainPanelHeader>
  );
}

export function ChatMainPanelChannelHeaderComposition() {
  const [muted, setMuted] = useState(true);

  return (
    <ChatMainPanelHeaderComposition conversation="channel" muted={muted} onMutedChange={setMuted} />
  );
}

export function ChatMainPanelDmHeaderComposition() {
  const [muted, setMuted] = useState(false);

  return (
    <ChatMainPanelHeaderComposition conversation="dm" muted={muted} onMutedChange={setMuted} />
  );
}

export function ChatMainPanelSectionHeaderComposition() {
  return (
    <ChatMainPanelSectionHeader>
      <ChatMainPanelHeaderIcon>
        <CheckSquare aria-hidden />
      </ChatMainPanelHeaderIcon>
      <ChatMainPanelTitleBlock>
        <ChatMainPanelTitle render={<h2 aria-label="Tasks" />}>Tasks</ChatMainPanelTitle>
        <ChatMainPanelSubtitle render={<p />}>12 channel tasks</ChatMainPanelSubtitle>
      </ChatMainPanelTitleBlock>
    </ChatMainPanelSectionHeader>
  );
}
