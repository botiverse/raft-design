import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@raft/ui";
import { IconTaskSearchOutline18 } from "nucleo-ui-outline-18";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function EmptyStateTaskFilterContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <IconTaskSearchOutline18 />
        </EmptyStateIcon>
        <EmptyStateTitle>No tasks match this filter</EmptyStateTitle>
        <EmptyStateDescription>
          Try a different combination or clear the current selection.
        </EmptyStateDescription>
      </EmptyStateContent>
    </EmptyState>
  );
}

// @docs-source-strip-start
export function EmptyStateTaskFilterComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <EmptyStateTaskFilterContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
