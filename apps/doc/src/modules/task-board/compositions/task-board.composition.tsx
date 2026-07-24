import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
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
} from "raft-ui";
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

const BOARD_DEMO_EXTRA_TASKS: readonly TaskFixture[] = [
  {
    id: "task-151",
    taskNumber: 151,
    channelName: "proj-uiux",
    title: "Tighten board column header density",
    description: "Keep badge, count, and chevron aligned under dense status labels.",
    status: "todo",
    creatorId: "me",
    assigneeId: "atlas",
  },
  {
    id: "task-150",
    taskNumber: 150,
    channelName: "proj-task",
    title: "Show overflow when a column exceeds the viewport",
    description: "ScrollArea must own vertical overflow for tall status stacks.",
    status: "todo",
    creatorId: "atlas",
    assigneeId: "me",
  },
  {
    id: "task-149",
    taskNumber: 149,
    channelName: "proj-uiux",
    title: "Preserve drop placeholders while cards are dragging",
    status: "todo",
    creatorId: "me",
    assigneeId: "me",
  },
  {
    id: "task-148",
    taskNumber: 148,
    channelName: "proj-task",
    title: "Clamp long descriptions inside board cards",
    description: "Two lines max so columns stay scannable at the source width.",
    status: "todo",
    creatorId: "atlas",
    assigneeId: "unassigned",
  },
  {
    id: "task-147",
    taskNumber: 147,
    channelName: "proj-uiux",
    title: "Keep status icon and label paired in brutal badges",
    status: "todo",
    creatorId: "me",
    assigneeId: "atlas",
  },
  {
    id: "task-146",
    taskNumber: 146,
    channelName: "proj-task",
    title: "Verify horizontal scroll across five status columns",
    description: "Board root stays min-content wide inside one shared viewport.",
    status: "in_progress",
    creatorId: "atlas",
    assigneeId: "me",
  },
  {
    id: "task-145",
    taskNumber: 145,
    channelName: "proj-uiux",
    title: "Wire collapse state without remounting cards",
    status: "in_progress",
    creatorId: "me",
    assigneeId: "me",
  },
  {
    id: "task-144",
    taskNumber: 144,
    channelName: "proj-task",
    title: "Announce blocked drops for closed columns",
    description: "Empty blocked copy should stay visible while dragging.",
    status: "in_progress",
    creatorId: "atlas",
    assigneeId: "atlas",
  },
  {
    id: "task-143",
    taskNumber: 143,
    channelName: "proj-uiux",
    title: "Sync board counts after keyboard reorders",
    status: "in_progress",
    creatorId: "me",
    assigneeId: "unassigned",
  },
];

const BOARD_DEMO_TASKS: readonly TaskFixture[] = [...TASK_FIXTURES, ...BOARD_DEMO_EXTRA_TASKS];

const DEFAULT_COLLAPSED: Record<TaskStatus, boolean> = {
  todo: false,
  in_progress: false,
  in_review: false,
  done: false,
  closed: false,
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
  const [localTasks, setLocalTasks] = useState<readonly TaskFixture[]>(BOARD_DEMO_TASKS);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<TaskStatus, boolean>>(
    expandAll ? EXPANDED : DEFAULT_COLLAPSED,
  );
  const [announcement, setAnnouncement] = useState("Ready");

  const tasks = controlledTasks ?? localTasks;
  const draggableTaskIds = useMemo(
    () => new Set(tasks.filter((task) => !task.dragDisabled).map((task) => task.id)),
    [tasks],
  );
  const isDropAllowed = useCallback(
    (
      activeId: string | number,
      _overId: string | number,
      overData: Record<string, unknown> | undefined,
    ) =>
      isTaskDropTarget(overData) &&
      overData.status !== blockedDropStatus &&
      draggableTaskIds.has(String(activeId)),
    [blockedDropStatus, draggableTaskIds],
  );
  const updateStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task || task.status === status) return;
      const next = moveTaskFixture(tasks, taskId, { status });
      if (controlledTasks === undefined) setLocalTasks(next);
      setAnnouncement(`Task #${task.taskNumber} moved to ${getTaskStatusLabel(status)}`);
    },
    [controlledTasks, tasks],
  );
  const openTask = useCallback((task: TaskFixture) => {
    setAnnouncement(`Opened task #${task.taskNumber}: ${task.title}`);
  }, []);
  const activeTask =
    activeTaskId == null ? undefined : tasks.find((task) => task.id === activeTaskId);

  return (
    <ScrollArea ref={portalRef} className="relative h-full min-h-0 w-full min-w-0">
      <ScrollAreaViewport className="p-4">
        <ScrollAreaContent className="min-w-max">
          <TaskDndProvider
            isDropAllowed={isDropAllowed}
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
                        <TaskBoardColumnBadge status={status.id}>
                          {status.label}
                        </TaskBoardColumnBadge>
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
                                      onOpen={openTask}
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
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollArea>
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
