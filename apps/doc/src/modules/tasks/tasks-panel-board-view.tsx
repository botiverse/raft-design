import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
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
} from "@botiverse/raft-ui";
import type { TaskMoveDetails } from "@botiverse/raft-ui";
import { ChevronDown } from "lucide-react";

import { TASK_STATUSES } from "#/modules/task-card/task-card.fixtures.ts";
import type { TaskFixture, TaskStatus } from "#/modules/task-card/task-card.fixtures.ts";
import { TaskCardComposition } from "#/modules/task-card/compositions/task-card.composition.tsx";
import { isTaskDropTarget } from "./is-task-drop-target.ts";
import type { TasksPanelViewProps } from "./tasks-panel-view.types.ts";

export type TasksPanelBoardViewProps = TasksPanelViewProps & {
  onMoveTask: (
    taskId: string,
    target: { status: TaskStatus; taskId?: string; placement?: "before" | "after" | null },
  ) => void;
};

function TasksPanelBoardColumn({
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
  onCollapsedChange: (status: TaskStatus, open: boolean) => void;
}) {
  const dropData = useMemo(() => ({ status }), [status]);
  const handleOpenChange = useCallback(
    (open: boolean) => onCollapsedChange(status, open),
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

function TasksPanelDraggableItem({
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

/** Board view of the tasks panel: one drag-and-drop column per status. */
export function TasksPanelBoardView({
  tasks,
  collapsed,
  onCollapsedChange,
  onOpenTask,
  onStatusChange,
  onMoveTask,
  portalRef,
  showChannelName,
}: TasksPanelBoardViewProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTask =
    activeTaskId == null ? undefined : tasks.find((task) => task.id === activeTaskId);
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
    ) => isTaskDropTarget(overData) && draggableTaskIds.has(String(activeId)),
    [draggableTaskIds],
  );
  const handleDragStart = useCallback(({ active }: { active: { id: string | number } }) => {
    setActiveTaskId(String(active.id));
  }, []);
  const clearActiveTask = useCallback(() => setActiveTaskId(null), []);
  const handleMove = useCallback(
    ({ activeId, overData, placement }: TaskMoveDetails) => {
      if (!isTaskDropTarget(overData)) return;
      onMoveTask(String(activeId), {
        status: overData.status,
        taskId: overData.taskId,
        placement,
      });
    },
    [onMoveTask],
  );

  return (
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
            <TasksPanelBoardColumn
              key={status.id}
              status={status.id}
              dropId={columnDropId}
              collapsed={collapsed[status.id]}
              dropDisabled={!collapsed[status.id] && visibleTasks.length > 0}
              onCollapsedChange={onCollapsedChange}
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
                          You can&apos;t change this task&apos;s status
                        </TaskBoardColumnEmptyBlocked>
                      </TaskBoardColumnEmpty>
                      <TaskDropPlaceholder id={columnDropId} />
                    </>
                  ) : (
                    <>
                      {visibleTasks.map((task) => (
                        <TasksPanelDraggableItem key={task.id} status={status.id} task={task}>
                          <TaskCardComposition
                            task={task}
                            onOpen={onOpenTask}
                            onStatusChange={onStatusChange}
                            portalRef={portalRef}
                            showChannelName={showChannelName}
                          />
                        </TasksPanelDraggableItem>
                      ))}
                    </>
                  )}
                </TaskBoardColumnItems>
              </TaskBoardColumnPanel>
            </TasksPanelBoardColumn>
          );
        })}
      </TaskBoardRoot>
      <TaskDragOverlay>
        {activeTask == null ? null : (
          <TaskCardComposition
            task={activeTask}
            onStatusChange={onStatusChange}
            portalRef={portalRef}
            showChannelName={showChannelName}
          />
        )}
      </TaskDragOverlay>
    </TaskDndProvider>
  );
}
