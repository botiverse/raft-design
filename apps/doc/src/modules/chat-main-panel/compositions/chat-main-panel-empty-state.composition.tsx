import { MessageSquare } from "lucide-react";
import {
  ChatMainPanelEmptyState,
  ChatMainPanelEmptyStateBrand,
  ChatMainPanelEmptyStateBrandMark,
  ChatMainPanelRoot,
} from "raft-ui/wip";

export function ChatMainPanelEmptyStateComposition() {
  return (
    <ChatMainPanelRoot>
      <ChatMainPanelEmptyState>
        <ChatMainPanelEmptyStateBrand>
          <ChatMainPanelEmptyStateBrandMark>
            <MessageSquare aria-hidden />
          </ChatMainPanelEmptyStateBrandMark>
        </ChatMainPanelEmptyStateBrand>
        <span>Select a conversation</span>
      </ChatMainPanelEmptyState>
    </ChatMainPanelRoot>
  );
}
