import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
  Tabs,
  TabsBackground,
  TabsLabel,
  TabsList,
  TabsTab,
  TasksPanelRoot,
  TasksPanelToolbar,
  TasksPanelToolbarFilters,
  TasksPanelToolbarView,
  TasksPanelViewport,
} from "raft-ui";
import { ListTodo, SquareKanban } from "lucide-react";

import {
  getTaskStatusLabel,
  moveTaskFixture,
  TASK_FIXTURES,
} from "#/modules/task-card/task-card.fixtures.ts";
import type { TaskFixture, TaskStatus } from "#/modules/task-card/task-card.fixtures.ts";
import { TasksPanelBoardView } from "../tasks-panel-board-view.tsx";
import { TasksPanelEmptyState } from "../tasks-panel-empty-state.tsx";
import { TasksPanelListView } from "../tasks-panel-list-view.tsx";
import { TasksIdentityFiltersComposition } from "./tasks-identity-filters.composition.tsx";

type TaskView = "board" | "list";

export type TasksPanelCompositionProps = {
  tasks?: readonly TaskFixture[];
  toolbarFilters?: ReactNode;
  filterTask?: (task: TaskFixture) => boolean;
  view?: TaskView;
  initialView?: TaskView;
  onViewChange?: (view: TaskView) => void;
  onTasksChange?: (tasks: readonly TaskFixture[]) => void;
  onOpenTask?: (task: TaskFixture) => void;
  blockedDropStatus?: TaskStatus;
  showChannelName?: boolean;
  /** When false, hide the toolbar Board/List control (e.g. mobile page header owns it). */
  showToolbarView?: boolean;
};

export function TasksPanelComposition({
  tasks: controlledTasks,
  toolbarFilters,
  filterTask,
  view: controlledView,
  initialView = "board",
  onViewChange,
  onTasksChange,
  onOpenTask,
  blockedDropStatus,
  showChannelName = false,
  showToolbarView = true,
}: TasksPanelCompositionProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [localTasks, setLocalTasks] = useState<readonly TaskFixture[]>(TASK_FIXTURES);
  const [localView, setLocalView] = useState<TaskView>(initialView);
  const [collapsed, setCollapsed] = useState<Record<TaskStatus, boolean>>({
    todo: false,
    "in-progress": false,
    "in-review": false,
    done: true,
    closed: true,
  });
  const [announcement, setAnnouncement] = useState("Ready");

  const tasks = controlledTasks ?? localTasks;
  const visibleTasks = filterTask ? tasks.filter(filterTask) : tasks;
  const view = controlledView ?? localView;
  const updateTasks = (nextTasks: readonly TaskFixture[]) => {
    if (controlledTasks === undefined) setLocalTasks(nextTasks);
    onTasksChange?.(nextTasks);
  };
  const setView = (nextView: TaskView) => {
    if (controlledView === undefined) setLocalView(nextView);
    onViewChange?.(nextView);
    setAnnouncement(`${nextView === "board" ? "Board" : "List"} view selected`);
  };

  const updateStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    updateTasks(moveTaskFixture(tasks, taskId, { status }));
    setAnnouncement(`Task #${task.taskNumber} moved to ${getTaskStatusLabel(status)}`);
  };
  const moveTask = (
    taskId: string,
    target: { status: TaskStatus; taskId?: string; placement?: "before" | "after" | null },
  ) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    updateTasks(moveTaskFixture(tasks, taskId, target));
    setAnnouncement(`Task #${task.taskNumber} moved to ${getTaskStatusLabel(target.status)}`);
  };
  const openTask = (task: TaskFixture) => {
    onOpenTask?.(task);
    setAnnouncement(`Opened task #${task.taskNumber}: ${task.title}`);
  };

  return (
    <div ref={portalRef} className="relative flex size-full min-h-0  min-w-0">
      <TasksPanelRoot aria-label="Tasks panel">
        <TasksPanelToolbar>
          <TasksPanelToolbarFilters>
            {toolbarFilters ?? <TasksIdentityFiltersComposition />}
          </TasksPanelToolbarFilters>
          {showToolbarView ? (
            <TasksPanelToolbarView>
              <Tabs value={view} onValueChange={setView} aria-label="Task view">
                <TabsList>
                  <TabsBackground />
                  <TabsTab value="board" aria-label="Board" className="max-md:px-2.5">
                    <SquareKanban aria-hidden />
                    <TabsLabel className="max-md:hidden">Board</TabsLabel>
                  </TabsTab>
                  <TabsTab value="list" aria-label="List" className="max-md:px-2.5">
                    <ListTodo aria-hidden />
                    <TabsLabel className="max-md:hidden">List</TabsLabel>
                  </TabsTab>
                </TabsList>
              </Tabs>
            </TasksPanelToolbarView>
          ) : null}
        </TasksPanelToolbar>

        <TasksPanelViewport>
          {tasks.length === 0 ? (
            <TasksPanelEmptyState filtered={false} />
          ) : visibleTasks.length === 0 ? (
            <TasksPanelEmptyState filtered />
          ) : view === "board" ? (
            <TasksPanelBoardView
              tasks={visibleTasks}
              collapsed={collapsed}
              onCollapsedChange={(status, nextOpen) =>
                setCollapsed((current) => ({ ...current, [status]: !nextOpen }))
              }
              onOpenTask={openTask}
              onStatusChange={updateStatus}
              onMoveTask={moveTask}
              portalRef={portalRef}
              blockedDropStatus={blockedDropStatus}
              showChannelName={showChannelName}
            />
          ) : (
            <TasksPanelListView
              tasks={visibleTasks}
              collapsed={collapsed}
              onCollapsedChange={(status, nextOpen) =>
                setCollapsed((current) => ({ ...current, [status]: !nextOpen }))
              }
              onOpenTask={openTask}
              onStatusChange={updateStatus}
              portalRef={portalRef}
              showChannelName={showChannelName}
            />
          )}
        </TasksPanelViewport>
      </TasksPanelRoot>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
