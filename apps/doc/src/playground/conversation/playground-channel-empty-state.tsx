import {
  ConversationPanelEmptyState,
  ConversationPanelEmptyStateBrand,
  ConversationPanelEmptyStateBrandMark,
  RaftLogo,
} from "raft-ui/wip";

export function PlaygroundChannelEmptyState() {
  return (
    <ConversationPanelEmptyState>
      <ConversationPanelEmptyStateBrand>
        <ConversationPanelEmptyStateBrandMark>
          <RaftLogo aria-hidden />
        </ConversationPanelEmptyStateBrandMark>
      </ConversationPanelEmptyStateBrand>
      <span>Select a channel</span>
    </ConversationPanelEmptyState>
  );
}
