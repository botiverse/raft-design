import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@botiverse/raft-ui";
import { Layers } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function EmptyStateActivityInboxContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <Layers />
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
    <CompositionPreview className={className}>
      <EmptyStateActivityInboxContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
