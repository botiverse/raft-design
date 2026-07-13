import { Button } from "raft-ui";
import { Inbox, Plus } from "lucide-react";

import LegacyEmptyState from "../../../../../../packages/ui/src/legacy/EmptyState.tsx";
import { EmptyStateSourcePreview } from "./empty-state-source-preview.tsx";

export function EmptyStateWithActionSourcePreview({ className }: { className?: string }) {
  return (
    <EmptyStateSourcePreview className={className}>
      <LegacyEmptyState
        icon={<Inbox size={36} />}
        title="No channels yet"
        description="Create your first channel to start organizing work."
        action={
          <Button variant="primary" size="sm">
            <Plus data-icon="inline-start" />
            New channel
          </Button>
        }
      />
    </EmptyStateSourcePreview>
  );
}
