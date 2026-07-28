import { Fragment, useCallback, useMemo, useState } from "react";
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
} from "raft-ui";
import { ChevronDown } from "lucide-react";

import { TASK_STATUSES, type TaskStatus } from "#/modules/task-card/task-card.fixtures.ts";
import { TaskCardComposition } from "#/modules/task-card/compositions/task-card.composition.tsx";
import { isTaskDropTarget } from "./is-task-drop-target.ts";
import type { TasksPanelViewProps } from "./tasks-panel-view.types.ts";

export type TasksPanelBoardViewProps = TasksPanelViewProps & {
  onMoveTask: (
    taskId: string,
    target: { status: TaskStatus; taskId?: string; placement?: "before" | "after" | null },
  ) => void;
  blockedDropStatus?: TaskStatus;
};

/** Board view of the tasks panel: one drag-and-drop column per status. */
export function TasksPanelBoardView({
  tasks,
  collapsed,
  onCollapsedChange,
  onOpenTask,
  onStatusChange,
  onMoveTask,
  portalRef,
  blockedDropStatus,
  showChannelName,
}: TasksPanelBoardViewProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTask =
    activeTaskId == null ? undefined : tasks.find((task) => task.id === activeTaskId);
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

  return (
    <TaskDndProvider
      isDropAllowed={isDropAllowed}
      onDragStart={({ active }) => setActiveTaskId(String(active.id))}
      onDragCancel={() => setActiveTaskId(null)}
      onDragEnd={() => setActiveTaskId(null)}
      onMove={({ activeId, overData, placement }) => {
        if (!isTaskDropTarget(overData)) return;
        onMoveTask(String(activeId), {
          status: overData.status,
          taskId: overData.taskId,
          placement,
        });
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
              onOpenChange={(open) => onCollapsedChange(status.id, open)}
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
                                onOpen={onOpenTask}
                                onStatusChange={onStatusChange}
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
            onStatusChange={onStatusChange}
            portalRef={portalRef}
            showChannelName={showChannelName}
          />
        )}
      </TaskDragOverlay>
    </TaskDndProvider>
  );
}
