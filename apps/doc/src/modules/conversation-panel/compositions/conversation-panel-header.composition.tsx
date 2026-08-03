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
import {
  Avatar,
  AvatarFallback,
  BrutalOnly,
  PanelAction,
  PanelActions,
  PanelHeader,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeading,
  PanelMeta,
  PanelActivity,
  PanelStatus,
  PanelTitle,
  PanelToggleAction,
  Status,
} from "raft-ui";

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
      <PanelHeader>
        <PanelHeaderContent>
          <Avatar data-slot="panel-header-icon" size="md" type="agent">
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
          <PanelHeading>
            <PanelTitle>Atlas</PanelTitle>
            <PanelActivity title="Working…">
              <Status aria-hidden size="sm" variant="success" pulse />
              Working…
            </PanelActivity>
          </PanelHeading>
        </PanelHeaderContent>
      </PanelHeader>
    );
  }

  return (
    <PanelHeader>
      <PanelHeaderContent>
        <PanelHeaderIcon>
          <Hash />
        </PanelHeaderIcon>
        <PanelHeading>
          <PanelTitle>proj-uiux</PanelTitle>
          {muted ? (
            <PanelStatus title="Activity muted. Direct mentions can still notify you.">
              <BellOff />
              <BrutalOnly>Muted</BrutalOnly>
            </PanelStatus>
          ) : null}
        </PanelHeading>
        <PanelMeta>Design system migration</PanelMeta>
      </PanelHeaderContent>
      <PanelActions>
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
      </PanelActions>
    </PanelHeader>
  );
}
