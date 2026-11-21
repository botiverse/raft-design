import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@botiverse/raft-ui";
import { Inbox } from "lucide-react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({
  id: "ui.empty-state.default",
  parity: ["mobile:ds.empty-state.gallery"],
});
// @docs-source-strip-end

export function EmptyStateDefaultContent() {
  return (
    <EmptyState>
      <EmptyStateContent>
        <EmptyStateIcon>
          <Inbox />
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
    <CompositionPreview className={className}>
      <EmptyStateDefaultContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
