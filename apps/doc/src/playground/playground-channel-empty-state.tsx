import {
  ChatMainPanelEmptyState,
  ChatMainPanelEmptyStateBrand,
  ChatMainPanelEmptyStateBrandMark,
  RaftLogo,
} from "raft-ui/wip";

export function PlaygroundChannelEmptyState() {
  return (
    <ChatMainPanelEmptyState>
      <ChatMainPanelEmptyStateBrand>
        <ChatMainPanelEmptyStateBrandMark>
          <RaftLogo aria-hidden />
        </ChatMainPanelEmptyStateBrandMark>
      </ChatMainPanelEmptyStateBrand>
      <span>Select a channel</span>
    </ChatMainPanelEmptyState>
  );
}
