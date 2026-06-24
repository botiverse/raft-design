import { Button } from "cuvii-rui";
import { Bookmark, CheckSquare, Inbox, MessageSquareText, Paperclip, Plus } from "lucide-react";
import type { ReactNode } from "react";

import LegacyEmptyState from "../../../../packages/ui/src/legacy/EmptyState.tsx";
import { EmptyStateActivityInboxComposition } from "./empty-state/activity-inbox-composition.tsx";
import { EmptyStateDefaultComposition } from "./empty-state/default-composition.tsx";
import { EmptyStateFilesComposition } from "./empty-state/files-composition.tsx";
import { EmptyStateInboxStatusComposition } from "./empty-state/inbox-status-composition.tsx";
import { EmptyStateSavedMessagesComposition } from "./empty-state/saved-messages-composition.tsx";
import { EmptyStateTaskFilterComposition } from "./empty-state/task-filter-composition.tsx";
import { EmptyStateWithActionComposition } from "./empty-state/with-action-composition.tsx";

export const EMPTY_STATE_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Default: "apps/doc/src/compositions/empty-state/default-composition.tsx",
  WithAction: "apps/doc/src/compositions/empty-state/with-action-composition.tsx",
  Files: "apps/doc/src/compositions/empty-state/files-composition.tsx",
  SavedMessages: "apps/doc/src/compositions/empty-state/saved-messages-composition.tsx",
  TaskFilter: "apps/doc/src/compositions/empty-state/task-filter-composition.tsx",
  InboxStatus: "apps/doc/src/compositions/empty-state/inbox-status-composition.tsx",
  ActivityInbox: "apps/doc/src/compositions/empty-state/activity-inbox-composition.tsx",
} as const;

export const EMPTY_STATE_SOURCE_COMPARISON_COMPOSITION = {
  Default: EmptyStateDefaultComposition,
  WithAction: EmptyStateWithActionComposition,
  Files: EmptyStateFilesComposition,
  SavedMessages: EmptyStateSavedMessagesComposition,
  TaskFilter: EmptyStateTaskFilterComposition,
  InboxStatus: EmptyStateInboxStatusComposition,
  ActivityInbox: EmptyStateActivityInboxComposition,
} as const;

function EmptyStateSourcePreview({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={["flex h-full min-h-28 w-full items-center justify-center px-3 py-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

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

export function EmptyStateActivityInboxSourcePreview({ className }: { className?: string }) {
  return (
    <EmptyStateSourcePreview className={className}>
      <LegacyEmptyState
        icon={<MessageSquareText size={36} />}
        title="Activity is empty"
        description="Channels, DMs, and followed threads stay here until they are done."
      />
    </EmptyStateSourcePreview>
  );
}

export const EMPTY_STATE_SOURCE_COMPARISON_SOURCE = {
  Default: EmptyStateDefaultSourcePreview,
  WithAction: EmptyStateWithActionSourcePreview,
  Files: EmptyStateFilesSourcePreview,
  SavedMessages: EmptyStateSavedMessagesSourcePreview,
  TaskFilter: EmptyStateTaskFilterSourcePreview,
  InboxStatus: EmptyStateInboxStatusSourcePreview,
  ActivityInbox: EmptyStateActivityInboxSourcePreview,
} as const;
