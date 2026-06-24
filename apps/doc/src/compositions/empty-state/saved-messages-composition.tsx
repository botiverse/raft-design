import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@raft/ui";
import { Bookmark } from "lucide-react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function EmptyStateSavedMessagesContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <Bookmark />
        </EmptyStateIcon>
        <EmptyStateTitle>No saved messages yet</EmptyStateTitle>
        <EmptyStateDescription>
          Save messages by clicking the bookmark icon on any message.
        </EmptyStateDescription>
      </EmptyStateContent>
    </EmptyState>
  );
}

// @docs-source-strip-start
export function EmptyStateSavedMessagesComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <EmptyStateSavedMessagesContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
