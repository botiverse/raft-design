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
import type { TaskMoveDetails } from "@botiverse/raft-ui";
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
  const handleDragStart = useCallback(({ active }: { active: { id: string | number } }) => {
    setActiveTaskId(String(active.id));
  }, []);
  const clearActiveTask = useCallback(() => setActiveTaskId(null), []);
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
      if (controlledTasks === undefined) setLocalTasks(next);
      setAnnouncement(`Task #${task.taskNumber} moved to ${getTaskStatusLabel(overData.status)}`);
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
            isDropAllowed={isDropAllowed}
            onDragStart={handleDragStart}
            onDragCancel={clearActiveTask}
            onDragEnd={clearActiveTask}
            onMove={handleMove}
          >
            <TaskBoardRoot>
              {TASK_STATUSES.map((status) => {
                const statusTasks = tasks.filter((task) => task.status === status.id);
                const visibleTasks = statusTasks.filter((task) => task.id !== activeTaskId);
                const columnDropId = `task-status:${status.id}`;
                return (
                  <TaskBoardStatusColumn
                    key={status.id}
                    status={status.id}
                    dropId={columnDropId}
                    collapsed={collapsed[status.id]}
                    dropDisabled={!collapsed[status.id] && visibleTasks.length > 0}
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
                            {visibleTasks.map((task) => (
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
