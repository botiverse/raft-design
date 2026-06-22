import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@raft/ui";
import { IconInboxOutline18, IconPlusOutline18 } from "nucleo-ui-outline-18";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function EmptyStateWithActionContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <IconInboxOutline18 />
        </EmptyStateIcon>
        <EmptyStateTitle>No channels yet</EmptyStateTitle>
        <EmptyStateDescription>
          Create your first channel to start organizing work.
        </EmptyStateDescription>
      </EmptyStateContent>
      <EmptyStateActions>
        <Button variant="primary" size="sm">
          <IconPlusOutline18 data-icon="inline-start" />
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
