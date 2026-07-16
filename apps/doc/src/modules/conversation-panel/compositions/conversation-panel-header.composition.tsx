import {
  Bell,
  BellOff,
  EllipsisVertical,
  Hash,
  Search,
  Settings,
  Square,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, BrutalOnly, Status } from "raft-ui";
import {
  ConversationPanelActions,
  ConversationPanelHeader,
  ConversationPanelHeaderIcon,
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
            <ConversationPanelStatus title="Working…">
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
        <PanelAction aria-label="Search conversation">
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
        <PanelAction className="max-md:hidden" aria-label="Stop all agents in this channel">
          <Square />
        </PanelAction>
        <PanelAction className="max-md:hidden" aria-label="View participants">
          <Users />
          13
        </PanelAction>
        <PanelAction className="max-md:hidden" aria-label="Channel options">
          <Settings />
        </PanelAction>
        <PanelAction className="md:hidden" aria-label="More options">
          <EllipsisVertical />
        </PanelAction>
      </ConversationPanelActions>
    </ConversationPanelHeader>
  );
}
