import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@raft/ui";
import { IconInboxOutline18 } from "nucleo-ui-outline-18";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function EmptyStateDefaultContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <IconInboxOutline18 />
        </EmptyStateIcon>
        <EmptyStateTitle>No messages yet</EmptyStateTitle>
        <EmptyStateDescription>Conversations you start will show up here.</EmptyStateDescription>
      </EmptyStateContent>
    </EmptyState>
  );
}

// @docs-source-strip-start
export function EmptyStateDefaultComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <EmptyStateDefaultContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
