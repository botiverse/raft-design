import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "raft-ui";
import { MessagesSquare } from "lucide-react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function EmptyStateInboxStatusContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <MessagesSquare />
        </EmptyStateIcon>
        <EmptyStateTitle>No unread chats</EmptyStateTitle>
        <EmptyStateDescription>
          Channels, DMs, and followed threads stay here until they are done.
        </EmptyStateDescription>
      </EmptyStateContent>
    </EmptyState>
  );
}

// @docs-source-strip-start
export function EmptyStateInboxStatusComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <EmptyStateInboxStatusContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
