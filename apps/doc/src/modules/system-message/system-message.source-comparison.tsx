import { SystemMessageChannelArchiveComposition } from "./compositions/channel-archive.composition.tsx";
import { SystemMessageGroupedUpdatesComposition } from "./compositions/grouped-updates.composition.tsx";
import { SystemMessageTaskMovedDoneComposition } from "./compositions/task-moved-done.composition.tsx";

export const SYSTEM_MESSAGE_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  ChannelArchive:
    "apps/doc/src/modules/system-message/compositions/channel-archive.composition.tsx",
  TaskMovedDone: "apps/doc/src/modules/system-message/compositions/task-moved-done.composition.tsx",
  GroupedUpdates:
    "apps/doc/src/modules/system-message/compositions/grouped-updates.composition.tsx",
} as const;

export const SYSTEM_MESSAGE_SOURCE_COMPARISON_COMPOSITION = {
  ChannelArchive: SystemMessageChannelArchiveComposition,
  TaskMovedDone: SystemMessageTaskMovedDoneComposition,
  GroupedUpdates: SystemMessageGroupedUpdatesComposition,
} as const;
