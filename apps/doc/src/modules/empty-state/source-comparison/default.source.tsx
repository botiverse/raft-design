import { Inbox } from "lucide-react";

import LegacyEmptyState from "../../../../../../packages/ui/src/legacy/EmptyState.tsx";
import { EmptyStateSourcePreview } from "./empty-state-source-preview.tsx";

export function EmptyStateDefaultSourcePreview({ className }: { className?: string }) {
  return (
    <EmptyStateSourcePreview className={className}>
      <LegacyEmptyState
        icon={<Inbox size={36} />}
        title="No messages yet"
        description="Conversations you start will show up here."
      />
    </EmptyStateSourcePreview>
  );
}
