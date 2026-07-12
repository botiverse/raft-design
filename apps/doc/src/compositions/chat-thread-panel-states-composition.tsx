import { MessageSquare } from "lucide-react";
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Spinner,
} from "raft-ui";
import { ChatThreadPanelCompositionShell } from "#/compositions/chat-thread-panel-composition.tsx";

export function ChatThreadPanelEmptyComposition() {
  return (
    <ChatThreadPanelCompositionShell>
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
    </ChatThreadPanelCompositionShell>
  );
}

export function ChatThreadPanelLoadingComposition() {
  return (
    <ChatThreadPanelCompositionShell>
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-10">
        <Spinner />
        <span className="font-mono text-xs text-foreground-muted">Loading replies…</span>
      </div>
    </ChatThreadPanelCompositionShell>
  );
}
