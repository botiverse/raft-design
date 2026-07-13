import { MessageSquareText } from "lucide-react";

import LegacyEmptyState from "../../../../../../packages/ui/src/legacy/EmptyState.tsx";
import { EmptyStateSourcePreview } from "./empty-state-source-preview.tsx";

export function EmptyStateInboxStatusSourcePreview({ className }: { className?: string }) {
  return (
    <EmptyStateSourcePreview className={className}>
      <LegacyEmptyState
        icon={<MessageSquareText size={36} />}
        title="No unread chats"
        description="Channels, DMs, and followed threads stay here until they are done."
      />
    </EmptyStateSourcePreview>
  );
}
