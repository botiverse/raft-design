import { SystemMessageChannelArchiveComposition } from "./compositions/channel-archive.composition.tsx";
import { SystemMessageGroupedUpdatesComposition } from "./compositions/grouped-updates.composition.tsx";
import { SystemMessageReminderScheduledComposition } from "./compositions/reminder-scheduled.composition.tsx";
import { SystemMessageTaskMovedDoneComposition } from "./compositions/task-moved-done.composition.tsx";

export const SYSTEM_MESSAGE_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  ChannelArchive:
    "apps/doc/src/modules/system-message/compositions/channel-archive.composition.tsx",
  ReminderScheduled:
    "apps/doc/src/modules/system-message/compositions/reminder-scheduled.composition.tsx",
  TaskMovedDone: "apps/doc/src/modules/system-message/compositions/task-moved-done.composition.tsx",
  GroupedUpdates:
    "apps/doc/src/modules/system-message/compositions/grouped-updates.composition.tsx",
  Preview: "apps/doc/src/modules/system-message/compositions/preview.composition.tsx",
} as const;

export const SYSTEM_MESSAGE_SOURCE_COMPARISON_COMPOSITION = {
  ChannelArchive: SystemMessageChannelArchiveComposition,
  ReminderScheduled: SystemMessageReminderScheduledComposition,
  TaskMovedDone: SystemMessageTaskMovedDoneComposition,
  GroupedUpdates: SystemMessageGroupedUpdatesComposition,
} as const;
