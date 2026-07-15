import { useState } from "react";
import {
  Bell,
  BellOff,
  CheckSquare,
  EllipsisVertical,
  Hash,
  Search,
  Settings,
  Square,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, BrutalOnly, ElegantOnly, Status } from "raft-ui";
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
  ChatPanelAction,
  ChatPanelToggleAction,
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
          <ChatPanelToggleAction
            pressed={muted}
            onPressedChange={onMutedChange}
            aria-label={muted ? "Unmute activity for this DM" : "Mute activity for this DM"}
          >
            {muted ? <BellOff /> : <Bell />}
          </ChatPanelToggleAction>
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
        <ChatPanelAction aria-label="Search conversation" disabled>
          <Search />
        </ChatPanelAction>
        <ChatPanelToggleAction
          className="max-md:hidden"
          pressed={muted}
          onPressedChange={onMutedChange}
          aria-label={muted ? "Unmute channel activity" : "Mute channel activity"}
        >
          {muted ? <BellOff /> : <Bell />}
        </ChatPanelToggleAction>
        <ChatPanelAction
          className="max-md:hidden"
          aria-label="Stop all agents in this channel"
          disabled
        >
          <Square />
        </ChatPanelAction>
        <ChatPanelAction className="max-md:hidden" aria-label="View participants" disabled>
          <Users />
          13
        </ChatPanelAction>
        <ChatPanelAction className="max-md:hidden" aria-label="Channel options" disabled>
          <Settings />
        </ChatPanelAction>
        <ChatPanelAction className="md:hidden" aria-label="More options">
          <EllipsisVertical />
        </ChatPanelAction>
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
      {/* Brutal hides the section icon on mobile; elegant keeps it at every size. */}
      <BrutalOnly>
        <ChatMainPanelHeaderIcon className="max-md:hidden">
          <CheckSquare aria-hidden />
        </ChatMainPanelHeaderIcon>
      </BrutalOnly>
      <ElegantOnly>
        <ChatMainPanelHeaderIcon>
          <CheckSquare aria-hidden />
        </ChatMainPanelHeaderIcon>
      </ElegantOnly>
      <ChatMainPanelTitleBlock>
        <ChatMainPanelTitle render={<h2 aria-label="Tasks" />}>Tasks</ChatMainPanelTitle>
        <ChatMainPanelSubtitle render={<p />}>12 channel tasks</ChatMainPanelSubtitle>
      </ChatMainPanelTitleBlock>
    </ChatMainPanelSectionHeader>
  );
}
