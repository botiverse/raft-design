import { useMemo, useRef, useState } from "react";
import {
  TaskBoardColumn,
  TaskBoardColumnBadge,
  TaskBoardColumnChevron,
  TaskBoardColumnCount,
  TaskBoardColumnEmpty,
  TaskBoardColumnEmptyAllowed,
  TaskBoardColumnEmptyBlocked,
  TaskBoardColumnEmptyIdle,
  TaskBoardColumnHeading,
  TaskBoardColumnItems,
  TaskBoardColumnPanel,
  TaskBoardColumnTrigger,
  TaskBoardRoot,
  TaskDndProvider,
  TaskDraggable,
  TaskDropZone,
} from "raft-ui/wip";
import { ChevronDown } from "lucide-react";

import {
  getTaskStatusLabel,
  TASK_FIXTURES,
  TASK_STATUSES,
  type TaskFixture,
  type TaskStatus,
} from "#/modules/task-card/task-card.fixtures.ts";
import { TaskCardComposition } from "#/modules/task-card/compositions/task-card.composition.tsx";

const DEFAULT_COLLAPSED: Record<TaskStatus, boolean> = {
  todo: false,
  in_progress: false,
  in_review: false,
  done: true,
  closed: true,
};

const EXPANDED: Record<TaskStatus, boolean> = {
  todo: false,
  in_progress: false,
  in_review: false,
  done: false,
  closed: false,
};

/** Sparse set so In Review / Done / Closed render column empty hosts. */
const EMPTY_COLUMN_TASKS = [TASK_FIXTURES[0], TASK_FIXTURES[2]] as const;

export type TaskBoardCompositionProps = {
  tasks?: readonly TaskFixture[];
  blockedDropStatus?: TaskStatus;
  showChannelName?: boolean;
  /** When true, every status column starts expanded (useful for empty-column demos). */
  expandAll?: boolean;
};

export function TaskBoardComposition({
  tasks: controlledTasks,
  blockedDropStatus,
  showChannelName = false,
  expandAll = false,
}: TaskBoardCompositionProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [localTasks, setLocalTasks] = useState<readonly TaskFixture[]>(TASK_FIXTURES);
  const [collapsed, setCollapsed] = useState<Record<TaskStatus, boolean>>(
    expandAll ? EXPANDED : DEFAULT_COLLAPSED,
  );
  const [announcement, setAnnouncement] = useState("Ready");

  const tasks = controlledTasks ?? localTasks;
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => b.taskNumber - a.taskNumber),
    [tasks],
  );

  const updateStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    const next = tasks.map((item) => (item.id === taskId ? { ...item, status } : item));
    if (controlledTasks === undefined) setLocalTasks(next);
    setAnnouncement(`Task #${task.taskNumber} moved to ${getTaskStatusLabel(status)}`);
  };

  return (
    <div ref={portalRef} className="relative h-full min-h-0 w-full min-w-0 overflow-auto p-4">
      <TaskDndProvider
        isDropAllowed={(activeId, overId) =>
          overId !== blockedDropStatus &&
          sortedTasks.some((task) => task.id === activeId && !task.dragDisabled)
        }
        onMove={({ activeId, overId }) => updateStatus(String(activeId), overId as TaskStatus)}
      >
        <TaskBoardRoot>
          {TASK_STATUSES.map((status) => {
            const statusTasks = sortedTasks.filter((task) => task.status === status.id);
            return (
              <TaskBoardColumn
                key={status.id}
                render={<TaskDropZone id={status.id} />}
                open={!collapsed[status.id]}
                onOpenChange={(open) =>
                  setCollapsed((current) => ({ ...current, [status.id]: !open }))
                }
              >
                <TaskBoardColumnTrigger>
                  <TaskBoardColumnHeading>
                    <TaskBoardColumnBadge status={status.id}>
                      {status.label.toUpperCase()}
                    </TaskBoardColumnBadge>
                    <TaskBoardColumnCount>{statusTasks.length}</TaskBoardColumnCount>
                  </TaskBoardColumnHeading>
                  <TaskBoardColumnChevron>
                    <ChevronDown aria-hidden />
                  </TaskBoardColumnChevron>
                </TaskBoardColumnTrigger>
                <TaskBoardColumnPanel>
                  <TaskBoardColumnItems>
                    {statusTasks.length === 0 ? (
                      <TaskBoardColumnEmpty>
                        <TaskBoardColumnEmptyIdle>
                          No {status.label.toLowerCase()} tasks.
                        </TaskBoardColumnEmptyIdle>
                        <TaskBoardColumnEmptyAllowed>
                          Drop to set {status.label}
                        </TaskBoardColumnEmptyAllowed>
                        <TaskBoardColumnEmptyBlocked>
                          Cannot move to {status.label}
                        </TaskBoardColumnEmptyBlocked>
                      </TaskBoardColumnEmpty>
                    ) : (
                      statusTasks.map((task) => (
                        <TaskDraggable key={task.id} id={task.id} disabled={task.dragDisabled}>
                          <TaskCardComposition
                            task={task}
                            onOpen={(item) =>
                              setAnnouncement(`Opened task #${item.taskNumber}: ${item.title}`)
                            }
                            onStatusChange={updateStatus}
                            portalRef={portalRef}
                            showChannelName={showChannelName}
                          />
                        </TaskDraggable>
                      ))
                    )}
                  </TaskBoardColumnItems>
                </TaskBoardColumnPanel>
              </TaskBoardColumn>
            );
          })}
        </TaskBoardRoot>
      </TaskDndProvider>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}

/** Idle column empties for In Review / Done / Closed. Drag onto empty columns for Allowed/Blocked. */
export function TaskBoardEmptyColumnsComposition() {
  return <TaskBoardComposition tasks={EMPTY_COLUMN_TASKS} expandAll />;
}
