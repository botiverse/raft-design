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
  ConversationPanelActions,
  ConversationPanelHeader,
  ConversationPanelHeaderIcon,
  ConversationPanelSectionHeader,
  ConversationPanelStatus,
  ConversationPanelMeta,
  ConversationPanelTitle,
  ConversationPanelHeaderContent,
  ConversationPanelHeading,
  PanelAction,
  PanelToggleAction,
} from "raft-ui/wip";

export type ConversationPanelHeaderCompositionProps = {
  conversation: "channel" | "dm";
  muted: boolean;
  onMutedChange?: (muted: boolean) => void;
};

export function ConversationPanelHeaderComposition({
  conversation,
  muted,
  onMutedChange,
}: ConversationPanelHeaderCompositionProps) {
  if (conversation === "dm") {
    return (
      <ConversationPanelHeader>
        <Avatar size="md" type="agent">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
        <ConversationPanelHeaderContent>
          <ConversationPanelHeading>
            <ConversationPanelTitle>Atlas</ConversationPanelTitle>
            <ConversationPanelStatus mobileVisible title="Working…">
              <Status aria-hidden size="md" variant="success" pulse />
              Working…
            </ConversationPanelStatus>
          </ConversationPanelHeading>
        </ConversationPanelHeaderContent>
      </ConversationPanelHeader>
    );
  }

  return (
    <ConversationPanelHeader>
      <ConversationPanelHeaderIcon>
        <Hash />
      </ConversationPanelHeaderIcon>
      <ConversationPanelHeaderContent>
        <ConversationPanelHeading>
          <ConversationPanelTitle>proj-uiux</ConversationPanelTitle>
          {muted ? (
            <ConversationPanelStatus title="Activity muted. Direct mentions can still notify you.">
              <BellOff />
              <BrutalOnly>Muted</BrutalOnly>
            </ConversationPanelStatus>
          ) : null}
        </ConversationPanelHeading>
        <ConversationPanelMeta>Design system migration</ConversationPanelMeta>
      </ConversationPanelHeaderContent>
      <ConversationPanelActions>
        <PanelAction aria-label="Search conversation" disabled>
          <Search />
        </PanelAction>
        <PanelToggleAction
          className="max-md:hidden"
          pressed={muted}
          onPressedChange={onMutedChange}
          aria-label={muted ? "Unmute channel activity" : "Mute channel activity"}
        >
          {muted ? <BellOff /> : <Bell />}
        </PanelToggleAction>
        <PanelAction
          className="max-md:hidden"
          aria-label="Stop all agents in this channel"
          disabled
        >
          <Square />
        </PanelAction>
        <PanelAction className="max-md:hidden" aria-label="View participants" disabled>
          <Users />
          13
        </PanelAction>
        <PanelAction className="max-md:hidden" aria-label="Channel options" disabled>
          <Settings />
        </PanelAction>
        <PanelAction className="md:hidden" aria-label="More options">
          <EllipsisVertical />
        </PanelAction>
      </ConversationPanelActions>
    </ConversationPanelHeader>
  );
}

export function ConversationPanelChannelHeaderComposition() {
  const [muted, setMuted] = useState(true);

  return (
    <ConversationPanelHeaderComposition
      conversation="channel"
      muted={muted}
      onMutedChange={setMuted}
    />
  );
}

export function ConversationPanelDmHeaderComposition() {
  const [muted, setMuted] = useState(false);

  return (
    <ConversationPanelHeaderComposition conversation="dm" muted={muted} onMutedChange={setMuted} />
  );
}

export function ConversationPanelSectionHeaderComposition() {
  return (
    <ConversationPanelSectionHeader>
      {/* Brutal hides the section icon on mobile; elegant keeps it at every size. */}
      <BrutalOnly>
        <ConversationPanelHeaderIcon className="max-md:hidden">
          <CheckSquare aria-hidden />
        </ConversationPanelHeaderIcon>
      </BrutalOnly>
      <ElegantOnly>
        <ConversationPanelHeaderIcon>
          <CheckSquare aria-hidden />
        </ConversationPanelHeaderIcon>
      </ElegantOnly>
      <ConversationPanelHeaderContent>
        <ConversationPanelTitle render={<h2 aria-label="Tasks" />}>Tasks</ConversationPanelTitle>
        <ConversationPanelMeta render={<p />}>12 channel tasks</ConversationPanelMeta>
      </ConversationPanelHeaderContent>
    </ConversationPanelSectionHeader>
  );
}
