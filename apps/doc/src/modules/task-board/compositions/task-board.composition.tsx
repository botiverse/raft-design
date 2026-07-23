import { Fragment, useRef, useState } from "react";
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
  TaskDragOverlay,
  TaskDraggable,
  TaskDropPlaceholder,
  TaskDropZone,
} from "raft-ui/wip";
import { ChevronDown } from "lucide-react";

import {
  getTaskStatusLabel,
  moveTaskFixture,
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
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<TaskStatus, boolean>>(
    expandAll ? EXPANDED : DEFAULT_COLLAPSED,
  );
  const [announcement, setAnnouncement] = useState("Ready");

  const tasks = controlledTasks ?? localTasks;
  const updateStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    const next = moveTaskFixture(tasks, taskId, { status });
    if (controlledTasks === undefined) setLocalTasks(next);
    setAnnouncement(`Task #${task.taskNumber} moved to ${getTaskStatusLabel(status)}`);
  };
  const activeTask =
    activeTaskId == null ? undefined : tasks.find((task) => task.id === activeTaskId);

  return (
    <div ref={portalRef} className="relative h-full min-h-0 w-full min-w-0 overflow-auto p-4">
      <TaskDndProvider
        isDropAllowed={(activeId, _overId, overData) =>
          isTaskDropTarget(overData) &&
          overData.status !== blockedDropStatus &&
          tasks.some((task) => task.id === activeId && !task.dragDisabled)
        }
        onDragStart={({ active }) => setActiveTaskId(String(active.id))}
        onDragCancel={() => setActiveTaskId(null)}
        onDragEnd={() => setActiveTaskId(null)}
        onMove={({ activeId, overData, placement }) => {
          if (!isTaskDropTarget(overData)) return;
          const task = tasks.find((item) => item.id === activeId);
          if (!task) return;
          const next = moveTaskFixture(tasks, String(activeId), {
            status: overData.status,
            taskId: overData.taskId,
            placement,
          });
          if (controlledTasks === undefined) setLocalTasks(next);
          setAnnouncement(
            `Task #${task.taskNumber} moved to ${getTaskStatusLabel(overData.status)}`,
          );
        }}
      >
        <TaskBoardRoot>
          {TASK_STATUSES.map((status) => {
            const statusTasks = tasks.filter((task) => task.status === status.id);
            const visibleTasks = statusTasks.filter((task) => task.id !== activeTaskId);
            const columnDropId = `task-status:${status.id}`;
            return (
              <TaskBoardColumn
                key={status.id}
                render={
                  <TaskDropZone
                    id={columnDropId}
                    data={{ status: status.id }}
                    data-drop-collapsed={collapsed[status.id] ? "true" : undefined}
                    disabled={!collapsed[status.id] && visibleTasks.length > 0}
                  />
                }
                open={!collapsed[status.id]}
                onOpenChange={(open) =>
                  setCollapsed((current) => ({ ...current, [status.id]: !open }))
                }
              >
                <TaskBoardColumnTrigger>
                  <TaskBoardColumnHeading>
                    <TaskBoardColumnBadge status={status.id}>{status.label}</TaskBoardColumnBadge>
                    <TaskBoardColumnCount>{statusTasks.length}</TaskBoardColumnCount>
                  </TaskBoardColumnHeading>
                  <TaskBoardColumnChevron>
                    <ChevronDown aria-hidden />
                  </TaskBoardColumnChevron>
                </TaskBoardColumnTrigger>
                <TaskBoardColumnPanel>
                  <TaskBoardColumnItems>
                    {visibleTasks.length === 0 ? (
                      <>
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
                        <TaskDropPlaceholder id={columnDropId} />
                      </>
                    ) : (
                      <>
                        {visibleTasks.map((task) => {
                          const dropId = `task-item:${task.id}`;
                          return (
                            <Fragment key={task.id}>
                              <TaskDropPlaceholder id={dropId} placement="before" />
                              <TaskDraggable
                                id={task.id}
                                dropId={dropId}
                                dropData={{ status: status.id, taskId: task.id }}
                                disabled={task.dragDisabled}
                              >
                                <TaskCardComposition
                                  task={task}
                                  onOpen={(item) =>
                                    setAnnouncement(
                                      `Opened task #${item.taskNumber}: ${item.title}`,
                                    )
                                  }
                                  onStatusChange={updateStatus}
                                  portalRef={portalRef}
                                  showChannelName={showChannelName}
                                />
                              </TaskDraggable>
                              <TaskDropPlaceholder id={dropId} placement="after" />
                            </Fragment>
                          );
                        })}
                      </>
                    )}
                  </TaskBoardColumnItems>
                </TaskBoardColumnPanel>
              </TaskBoardColumn>
            );
          })}
        </TaskBoardRoot>
        <TaskDragOverlay>
          {activeTask == null ? null : (
            <TaskCardComposition
              task={activeTask}
              onStatusChange={updateStatus}
              portalRef={portalRef}
              showChannelName={showChannelName}
            />
          )}
        </TaskDragOverlay>
      </TaskDndProvider>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}

function isTaskDropTarget(value: Record<string, unknown> | undefined): value is {
  status: TaskStatus;
  taskId?: string;
} {
  return (
    value != null &&
    typeof value.status === "string" &&
    TASK_STATUSES.some((status) => status.id === value.status) &&
    (value.taskId == null || typeof value.taskId === "string")
  );
}
