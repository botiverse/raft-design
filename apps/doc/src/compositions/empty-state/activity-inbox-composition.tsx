import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@raft/ui";
import { IconInboxStackOutline18 } from "nucleo-ui-outline-18";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function EmptyStateActivityInboxContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <IconInboxStackOutline18 />
        </EmptyStateIcon>
        <EmptyStateTitle>Activity is empty</EmptyStateTitle>
        <EmptyStateDescription>
          Channels, DMs, and followed threads stay here until they are done.
        </EmptyStateDescription>
      </EmptyStateContent>
    </EmptyState>
  );
}

// @docs-source-strip-start
export function EmptyStateActivityInboxComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <EmptyStateActivityInboxContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
