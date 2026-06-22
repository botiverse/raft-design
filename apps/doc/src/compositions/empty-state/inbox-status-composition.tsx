import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@raft/ui";
import { IconMessagesOutline18 } from "nucleo-ui-outline-18";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function EmptyStateInboxStatusContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <IconMessagesOutline18 />
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
