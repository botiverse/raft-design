import { useState } from "react";
import { Bell, BellOff, Hash, Search, Settings, Square, Users } from "lucide-react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  ChatMainPanelActions,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
  ChatMainPanelTitleBadge,
  ChatMainPanelRoot,
  ChatMainPanelSubtitle,
  ChatMainPanelTitle,
  ChatMainPanelTitleBlock,
  ChatMainPanelTitleRow,
  PanelIconButton,
  PanelIconButtonCount,
  PanelToggleButton,
} from "raft-ui/wip";

export function ChatMainPanelChannelHeaderComposition() {
  const [muted, setMuted] = useState(true);

  return (
    <ChatMainPanelRoot>
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
                Muted
              </ChatMainPanelTitleBadge>
            ) : null}
          </ChatMainPanelTitleRow>
          <ChatMainPanelSubtitle>Design system migration</ChatMainPanelSubtitle>
        </ChatMainPanelTitleBlock>
        <ChatMainPanelActions>
          <PanelIconButton aria-label="Search conversation">
            <Search />
          </PanelIconButton>
          <PanelToggleButton
            pressed={muted}
            onPressedChange={setMuted}
            aria-label={muted ? "Unmute channel activity" : "Mute channel activity"}
          >
            {muted ? <BellOff /> : <Bell />}
          </PanelToggleButton>
          <PanelIconButton aria-label="Stop all agents in this channel">
            <Square />
          </PanelIconButton>
          <PanelIconButton aria-label="View participants" layout="label">
            <Users />
            <PanelIconButtonCount>13</PanelIconButtonCount>
          </PanelIconButton>
          <PanelIconButton aria-label="Channel options">
            <Settings />
          </PanelIconButton>
        </ChatMainPanelActions>
      </ChatMainPanelHeader>
    </ChatMainPanelRoot>
  );
}

export function ChatMainPanelDmHeaderComposition() {
  const [muted, setMuted] = useState(false);

  return (
    <ChatMainPanelRoot>
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
            onPressedChange={setMuted}
            aria-label={muted ? "Unmute activity for this DM" : "Mute activity for this DM"}
          >
            {muted ? <BellOff /> : <Bell />}
          </PanelToggleButton>
        </ChatMainPanelActions>
      </ChatMainPanelHeader>
    </ChatMainPanelRoot>
  );
}
