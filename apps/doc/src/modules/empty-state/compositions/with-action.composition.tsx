import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "raft-ui";
import { Inbox, Plus } from "lucide-react";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function EmptyStateWithActionContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <Inbox />
        </EmptyStateIcon>
        <EmptyStateTitle>No channels yet</EmptyStateTitle>
        <EmptyStateDescription>
          Create your first channel to start organizing work.
        </EmptyStateDescription>
      </EmptyStateContent>
      <EmptyStateActions>
        <Button variant="primary" size="sm">
          <Plus data-icon="inline-start" />
          New channel
        </Button>
      </EmptyStateActions>
    </EmptyState>
  );
}

// @docs-source-strip-start
export function EmptyStateWithActionComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <EmptyStateWithActionContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
