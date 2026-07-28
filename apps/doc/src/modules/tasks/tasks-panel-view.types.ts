import type { RefObject } from "react";

import type { TaskFixture, TaskStatus } from "#/modules/task-card/task-card.fixtures.ts";

/** Shared shape for the board and list views the tasks panel switches between. */
export type TasksPanelViewProps = {
  tasks: readonly TaskFixture[];
  collapsed: Record<TaskStatus, boolean>;
  onCollapsedChange: (status: TaskStatus, open: boolean) => void;
  onOpenTask: (task: TaskFixture) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  portalRef: RefObject<HTMLDivElement | null>;
  showChannelName: boolean;
};
