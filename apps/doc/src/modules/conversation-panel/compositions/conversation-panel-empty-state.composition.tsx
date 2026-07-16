import { MessageSquare } from "lucide-react";
import {
  ConversationPanelEmptyState,
  ConversationPanelEmptyStateBrand,
  ConversationPanelEmptyStateBrandMark,
  ConversationPanelRoot,
} from "raft-ui/wip";

export function ConversationPanelEmptyStateComposition() {
  return (
    <ConversationPanelRoot>
      <ConversationPanelEmptyState>
        <ConversationPanelEmptyStateBrand>
          <ConversationPanelEmptyStateBrandMark>
            <MessageSquare aria-hidden />
          </ConversationPanelEmptyStateBrandMark>
        </ConversationPanelEmptyStateBrand>
        <span>Select a conversation</span>
      </ConversationPanelEmptyState>
    </ConversationPanelRoot>
  );
}
