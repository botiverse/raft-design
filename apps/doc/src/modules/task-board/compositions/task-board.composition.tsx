import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
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
} from "@botiverse/raft-ui";
import { DragRefusalHint, createDragAnnouncements, dragInstructions } from "@botiverse/raft-ui/wip";
import type { TaskDndAccessibility, TaskMoveDetails } from "@botiverse/raft-ui";
import { ChevronDown } from "lucide-react";

import {
  getTaskStatusLabel,
  moveTaskFixture,
  TASK_STATUSES,
} from "#/modules/task-card/task-card.fixtures.ts";
import type { TaskFixture, TaskStatus } from "#/modules/task-card/task-card.fixtures.ts";
import { TaskCardComposition } from "#/modules/task-card/compositions/task-card.composition.tsx";
import { BOARD_DEMO_TASKS } from "#/modules/task-board/task-board.fixtures.ts";

const DEFAULT_COLLAPSED: Record<TaskStatus, boolean> = {
  todo: false,
  "in-progress": false,
  "in-review": false,
  done: false,
  closed: false,
};

const EXPANDED: Record<TaskStatus, boolean> = {
  todo: false,
  "in-progress": false,
  "in-review": false,
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

function TaskBoardStatusColumn({
  children,
  collapsed,
  dropDisabled,
  dropId,
  status,
  onCollapsedChange,
}: {
  children: ReactNode;
  collapsed: boolean;
  dropDisabled: boolean;
  dropId: string;
  status: TaskStatus;
  onCollapsedChange: (status: TaskStatus, collapsed: boolean) => void;
}) {
  const dropData = useMemo(() => ({ status }), [status]);
  const handleOpenChange = useCallback(
    (open: boolean) => onCollapsedChange(status, !open),
    [onCollapsedChange, status],
  );

  return (
    <TaskBoardColumn
      render={
        <TaskDropZone
          id={dropId}
          data={dropData}
          data-drop-collapsed={collapsed ? "true" : undefined}
          disabled={dropDisabled}
        />
      }
      open={!collapsed}
      onOpenChange={handleOpenChange}
    >
      {children}
    </TaskBoardColumn>
  );
}

function TaskBoardDraggableItem({
  children,
  status,
  task,
}: {
  children: ReactNode;
  status: TaskStatus;
  task: TaskFixture;
}) {
  const dropId = `task-item:${task.id}`;
  const dropData = useMemo(() => ({ status, taskId: task.id }), [status, task.id]);

  return (
    <>
      <TaskDropPlaceholder id={dropId} placement="before" />
      <TaskDraggable id={task.id} dropId={dropId} dropData={dropData} disabled={task.dragDisabled}>
        {children}
      </TaskDraggable>
      <TaskDropPlaceholder id={dropId} placement="after" />
    </>
  );
}

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
  const draggableTaskIds = useMemo(() => {
    const ids = new Set<string>();
    for (const task of tasks) {
      if (!task.dragDisabled) ids.add(task.id);
    }
    return ids;
  }, [tasks]);
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
  const [refusal, setRefusal] = useState<string | null>(null);
  const handleDragStart = useCallback(({ active }: { active: { id: string | number } }) => {
    setActiveTaskId(String(active.id));
  }, []);
  const clearActiveTask = useCallback(() => {
    setActiveTaskId(null);
    setRefusal(null);
  }, []);
  // A column that won't take the card says why by the hand, as its empty state does.
  const handleDragOver = useCallback(
    ({
      active,
      over,
    }: {
      active: { id: string | number };
      over: { id: string | number; data: { current?: Record<string, unknown> } } | null;
    }) => {
      const overData = over?.data.current;
      setRefusal(
        over && isTaskDropTarget(overData) && !isDropAllowed(active.id, over.id, overData)
          ? `Cannot move to ${getTaskStatusLabel(overData.status)}`
          : null,
      );
    },
    [isDropAllowed],
  );
  // Screen readers hear the task and the status by name, never an id.
  const accessibility = useMemo<TaskDndAccessibility>(
    () => ({
      screenReaderInstructions: dragInstructions(),
      announcements: createDragAnnouncements({
        name: (id) => `Task #${tasks.find((task) => task.id === String(id))?.taskNumber ?? ""}`,
        place: (id, overId) => {
          const status =
            overId == null
              ? tasks.find((task) => task.id === String(id))?.status
              : statusOfDropId(tasks, String(overId));
          return status ? { place: getTaskStatusLabel(status) } : null;
        },
        refusal: (id, overId) => {
          const status = statusOfDropId(tasks, String(overId));
          return status && !isDropAllowed(id, overId, { status })
            ? { place: getTaskStatusLabel(status), reason: "Cannot move there." }
            : null;
        },
      }),
    }),
    [isDropAllowed, tasks],
  );
  const handleMove = useCallback(
    ({ activeId, overData, placement }: TaskMoveDetails) => {
      if (!isTaskDropTarget(overData)) return;
      const task = tasks.find((item) => item.id === activeId);
      if (!task) return;
      const next = moveTaskFixture(tasks, String(activeId), {
        status: overData.status,
        taskId: overData.taskId,
        placement,
      });
      // The drop itself is announced by the drag's announcements.
      if (controlledTasks === undefined) setLocalTasks(next);
    },
    [controlledTasks, tasks],
  );
  const handleCollapsedChange = useCallback((status: TaskStatus, nextCollapsed: boolean) => {
    setCollapsed((current) => ({ ...current, [status]: nextCollapsed }));
  }, []);
  const activeTask =
    activeTaskId == null ? undefined : tasks.find((task) => task.id === activeTaskId);

  return (
    <ScrollArea ref={portalRef} className="relative size-full min-h-0  min-w-0">
      <ScrollAreaViewport className="p-4">
        <ScrollAreaContent className="min-w-max">
          <TaskDndProvider
            accessibility={accessibility}
            isDropAllowed={isDropAllowed}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragCancel={clearActiveTask}
            onDragEnd={clearActiveTask}
            onMove={handleMove}
          >
            <TaskBoardRoot>
              {TASK_STATUSES.map((status) => {
                const statusTasks = tasks.filter((task) => task.status === status.id);
                const columnDropId = `task-status:${status.id}`;
                return (
                  <TaskBoardStatusColumn
                    key={status.id}
                    status={status.id}
                    dropId={columnDropId}
                    collapsed={collapsed[status.id]}
                    dropDisabled={!collapsed[status.id] && statusTasks.length > 0}
                    onCollapsedChange={handleCollapsedChange}
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
                        {statusTasks.length === 0 ? (
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
                            {statusTasks.map((task) => (
                              <TaskBoardDraggableItem key={task.id} status={status.id} task={task}>
                                <TaskCardComposition
                                  task={task}
                                  onOpen={openTask}
                                  onStatusChange={updateStatus}
                                  portalRef={portalRef}
                                  showChannelName={showChannelName}
                                />
                              </TaskBoardDraggableItem>
                            ))}
                          </>
                        )}
                      </TaskBoardColumnItems>
                    </TaskBoardColumnPanel>
                  </TaskBoardStatusColumn>
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
            {refusal ? <DragRefusalHint>{refusal}</DragRefusalHint> : null}
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

/** The status a drop target stands for: a column (`task-status:<status>`) or a card's (`task-item:<id>`). */
function statusOfDropId(tasks: readonly TaskFixture[], dropId: string): TaskStatus | undefined {
  if (dropId.startsWith("task-status:")) return dropId.slice("task-status:".length) as TaskStatus;
  if (dropId.startsWith("task-item:")) {
    const taskId = dropId.slice("task-item:".length);
    return tasks.find((task) => task.id === taskId)?.status;
  }
  return undefined;
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
