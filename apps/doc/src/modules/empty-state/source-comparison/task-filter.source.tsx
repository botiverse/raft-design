import { CheckSquare } from "lucide-react";

import LegacyEmptyState from "../../../../../../packages/ui/src/legacy/EmptyState.tsx";
import { EmptyStateSourcePreview } from "./empty-state-source-preview.tsx";

export function EmptyStateTaskFilterSourcePreview({ className }: { className?: string }) {
  return (
    <EmptyStateSourcePreview className={className}>
      <LegacyEmptyState
        icon={<CheckSquare size={36} />}
        title="No tasks match this filter"
        description="Try a different combination or clear the current selection."
      />
    </EmptyStateSourcePreview>
  );
}
