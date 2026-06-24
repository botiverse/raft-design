import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "raft-ui";
import { Paperclip } from "lucide-react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function EmptyStateFilesContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <Paperclip />
        </EmptyStateIcon>
        <EmptyStateTitle>No files yet</EmptyStateTitle>
        <EmptyStateDescription>
          Attach files in Chat, or drag files into the message composer. They will appear here after
          the message is sent.
        </EmptyStateDescription>
      </EmptyStateContent>
    </EmptyState>
  );
}

// @docs-source-strip-start
export function EmptyStateFilesComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <EmptyStateFilesContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
