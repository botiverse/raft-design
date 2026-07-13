import { Paperclip } from "lucide-react";

import LegacyEmptyState from "../../../../../../packages/ui/src/legacy/EmptyState.tsx";
import { EmptyStateSourcePreview } from "./empty-state-source-preview.tsx";

export function EmptyStateFilesSourcePreview({ className }: { className?: string }) {
  return (
    <EmptyStateSourcePreview className={className}>
      <LegacyEmptyState
        icon={<Paperclip size={36} />}
        title="No files yet"
        description="Attach files in Chat, or drag files into the message composer. They will appear here after the message is sent."
      />
    </EmptyStateSourcePreview>
  );
}
