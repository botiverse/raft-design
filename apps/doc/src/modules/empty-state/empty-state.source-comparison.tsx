import { EmptyStateActivityInboxComposition } from "./compositions/activity-inbox.composition.tsx";
import { EmptyStateDefaultComposition } from "./compositions/default.composition.tsx";
import { EmptyStateFilesComposition } from "./compositions/files.composition.tsx";
import { EmptyStateInboxStatusComposition } from "./compositions/inbox-status.composition.tsx";
import { EmptyStateSavedMessagesComposition } from "./compositions/saved-messages.composition.tsx";
import { EmptyStateTaskFilterComposition } from "./compositions/task-filter.composition.tsx";
import { EmptyStateWithActionComposition } from "./compositions/with-action.composition.tsx";
import { EmptyStateActivityInboxSourcePreview } from "./source-comparison/activity-inbox.source.tsx";
import { EmptyStateDefaultSourcePreview } from "./source-comparison/default.source.tsx";
import { EmptyStateFilesSourcePreview } from "./source-comparison/files.source.tsx";
import { EmptyStateInboxStatusSourcePreview } from "./source-comparison/inbox-status.source.tsx";
import { EmptyStateSavedMessagesSourcePreview } from "./source-comparison/saved-messages.source.tsx";
import { EmptyStateTaskFilterSourcePreview } from "./source-comparison/task-filter.source.tsx";
import { EmptyStateWithActionSourcePreview } from "./source-comparison/with-action.source.tsx";

export {
  EmptyStateActivityInboxSourcePreview,
  EmptyStateDefaultSourcePreview,
  EmptyStateFilesSourcePreview,
  EmptyStateInboxStatusSourcePreview,
  EmptyStateSavedMessagesSourcePreview,
  EmptyStateTaskFilterSourcePreview,
  EmptyStateWithActionSourcePreview,
};

export const EMPTY_STATE_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Default: "apps/doc/src/modules/empty-state/compositions/default.composition.tsx",
  WithAction: "apps/doc/src/modules/empty-state/compositions/with-action.composition.tsx",
  Files: "apps/doc/src/modules/empty-state/compositions/files.composition.tsx",
  SavedMessages: "apps/doc/src/modules/empty-state/compositions/saved-messages.composition.tsx",
  TaskFilter: "apps/doc/src/modules/empty-state/compositions/task-filter.composition.tsx",
  InboxStatus: "apps/doc/src/modules/empty-state/compositions/inbox-status.composition.tsx",
  ActivityInbox: "apps/doc/src/modules/empty-state/compositions/activity-inbox.composition.tsx",
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

export const EMPTY_STATE_SOURCE_COMPARISON_SOURCE = {
  Default: EmptyStateDefaultSourcePreview,
  WithAction: EmptyStateWithActionSourcePreview,
  Files: EmptyStateFilesSourcePreview,
  SavedMessages: EmptyStateSavedMessagesSourcePreview,
  TaskFilter: EmptyStateTaskFilterSourcePreview,
  InboxStatus: EmptyStateInboxStatusSourcePreview,
  ActivityInbox: EmptyStateActivityInboxSourcePreview,
} as const;
