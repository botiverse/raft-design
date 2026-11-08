import { BellOff, Hash, Search, Settings } from "lucide-react";
import {
  Avatar,
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
  Status,
} from "@botiverse/raft-ui";

export type ConversationPanelHeaderCompositionProps = {
  conversation?: "channel" | "dm";
  muted?: boolean;
};

export function ConversationPanelHeaderComposition({
  conversation = "channel",
  muted = false,
}: ConversationPanelHeaderCompositionProps) {
  if (conversation === "dm") {
    return (
      <PanelHeader>
        <PanelHeaderContent>
          <Avatar data-slot="panel-header-icon" size="md" type="agent" />
          <PanelHeading>
            <PanelTitle>Bugen</PanelTitle>
            <PanelActivity title="Working…">
              <Status aria-hidden size="sm" presence="busy" />
              Working…
            </PanelActivity>
          </PanelHeading>
        </PanelHeaderContent>
        <PanelActions>
          <PanelAction aria-label="Search this conversation">
            <Search />
          </PanelAction>
          <PanelAction aria-label="Conversation details and settings">
            <Settings />
          </PanelAction>
        </PanelActions>
      </PanelHeader>
    );
  }

  return (
    <PanelHeader>
      <PanelHeaderIcon>
        <Hash />
      </PanelHeaderIcon>
      <PanelHeaderContent>
        <PanelHeading>
          <PanelTitle>launch-week</PanelTitle>
          {muted ? (
            <PanelStatus title="Activity muted. Direct mentions can still notify you.">
              <BellOff />
            </PanelStatus>
          ) : null}
        </PanelHeading>
        <PanelMeta>
          <span className="truncate">Ship the launch week</span>
        </PanelMeta>
      </PanelHeaderContent>
      <PanelActions>
        <PanelAction aria-label="Search this channel">
          <Search />
        </PanelAction>
        <PanelAction aria-label="Channel details and settings">
          <Settings />
        </PanelAction>
      </PanelActions>
    </PanelHeader>
  );
}
