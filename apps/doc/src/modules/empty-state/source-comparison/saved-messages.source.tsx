import { Bookmark } from "lucide-react";

import LegacyEmptyState from "../../../../../../packages/ui/src/legacy/EmptyState.tsx";
import { EmptyStateSourcePreview } from "./empty-state-source-preview.tsx";

export function EmptyStateSavedMessagesSourcePreview({ className }: { className?: string }) {
  return (
    <EmptyStateSourcePreview className={className}>
      <LegacyEmptyState
        icon={<Bookmark size={36} />}
        title="No saved messages yet"
        description="Save messages by clicking the bookmark icon on any message."
      />
    </EmptyStateSourcePreview>
  );
}
