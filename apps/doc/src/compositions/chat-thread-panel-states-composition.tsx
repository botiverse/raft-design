import type { ReactNode } from "react";
import { MessageSquare, X } from "lucide-react";
import {
  Avatar,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Spinner,
} from "raft-ui";
import {
  ChatThreadPanelActions,
  ChatThreadPanelBody,
  ChatThreadPanelFooter,
  ChatThreadPanelHeader,
  ChatThreadPanelParent,
  ChatThreadPanelRoot,
  ChatThreadPanelTitle,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  PanelButton,
  PanelButtonIcon,
} from "raft-ui/wip";

function ThreadStateShell({ children }: { children: ReactNode }) {
  return (
    <ChatThreadPanelRoot>
      <ChatThreadPanelHeader>
        <ChatThreadPanelTitle>Thread</ChatThreadPanelTitle>
        <ChatThreadPanelActions>
          <PanelButton aria-label="Close thread">
            <PanelButtonIcon>
              <X />
            </PanelButtonIcon>
          </PanelButton>
        </ChatThreadPanelActions>
      </ChatThreadPanelHeader>
      <ChatThreadPanelParent>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human" />
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Cindy</MessageItemSender>
              <MessageItemTime>10:08</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>Should ThreadPanel own the right-panel chrome?</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </ChatThreadPanelParent>
      <ChatThreadPanelBody>{children}</ChatThreadPanelBody>
      <ChatThreadPanelFooter>Reply composer slot</ChatThreadPanelFooter>
    </ChatThreadPanelRoot>
  );
}

export function ChatThreadPanelEmptyComposition() {
  return (
    <ThreadStateShell>
      <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10">
        <EmptyState>
          <EmptyStateContent>
            <EmptyStateIcon>
              <MessageSquare />
            </EmptyStateIcon>
            <EmptyStateTitle>No replies yet</EmptyStateTitle>
            <EmptyStateDescription>
              Start the conversation by replying in this thread.
            </EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </div>
    </ThreadStateShell>
  );
}

export function ChatThreadPanelLoadingComposition() {
  return (
    <ThreadStateShell>
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-10">
        <Spinner />
        <span className="font-mono text-xs text-foreground-muted">Loading replies…</span>
      </div>
    </ThreadStateShell>
  );
}
