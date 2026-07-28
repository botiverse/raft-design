import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
  Button,
  Tabs,
  TabsLabel,
  TabsList,
  TabsTab,
  TasksPanelRoot,
  TasksPanelToolbar,
  TasksPanelToolbarFilters,
  TasksPanelToolbarNewTask,
  TasksPanelToolbarView,
  TasksPanelViewport,
} from "raft-ui";
import { ListTodo, Plus, SquareKanban } from "lucide-react";

import {
  getTaskStatusLabel,
  moveTaskFixture,
  TASK_FIXTURES,
  type TaskFixture,
  type TaskStatus,
} from "#/modules/task-card/task-card.fixtures.ts";
import { TasksPanelBoardView } from "../tasks-panel-board-view.tsx";
import { TasksPanelEmptyState } from "../tasks-panel-empty-state.tsx";
import { TasksPanelListView } from "../tasks-panel-list-view.tsx";
import { CreateTaskDialogComposition } from "./create-task-dialog.composition.tsx";
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
  onCreateTasks?: (titles: readonly string[]) => void | Promise<void>;
  blockedDropStatus?: TaskStatus;
  showChannelName?: boolean;
  /** When false, hide the toolbar New Task control (e.g. mobile page header owns it). */
  showToolbarNewTask?: boolean;
  /** When false, hide the toolbar Board/List control (e.g. mobile page header owns it). */
  showToolbarView?: boolean;
  createOpen?: boolean;
  onCreateOpenChange?: (open: boolean) => void;
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
  onCreateTasks,
  blockedDropStatus,
  showChannelName = false,
  showToolbarNewTask = true,
  showToolbarView = true,
  createOpen,
  onCreateOpenChange,
}: TasksPanelCompositionProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [localTasks, setLocalTasks] = useState<readonly TaskFixture[]>(TASK_FIXTURES);
  const [localView, setLocalView] = useState<TaskView>(initialView);
  const [collapsed, setCollapsed] = useState<Record<TaskStatus, boolean>>({
    todo: false,
    in_progress: false,
    in_review: false,
    done: true,
    closed: true,
  });
  const [localCreateOpen, setLocalCreateOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("Ready");

  const tasks = controlledTasks ?? localTasks;
  const visibleTasks = filterTask ? tasks.filter(filterTask) : tasks;
  const view = controlledView ?? localView;
  const dialogOpen = createOpen ?? localCreateOpen;
  const setDialogOpen = (open: boolean) => {
    if (createOpen === undefined) setLocalCreateOpen(open);
    onCreateOpenChange?.(open);
  };
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
    <div ref={portalRef} className="relative flex h-full min-h-0 w-full min-w-0">
      <TasksPanelRoot aria-label="Tasks panel">
        <TasksPanelToolbar>
          {showToolbarNewTask ? (
            <TasksPanelToolbarNewTask>
              <Button variant="accent" size="sm" onClick={() => setDialogOpen(true)}>
                <Plus aria-hidden />
                New Task
              </Button>
            </TasksPanelToolbarNewTask>
          ) : null}
          <TasksPanelToolbarFilters>
            {toolbarFilters ?? <TasksIdentityFiltersComposition />}
          </TasksPanelToolbarFilters>
          {showToolbarView ? (
            <TasksPanelToolbarView>
              <Tabs value={view} onValueChange={setView} aria-label="Task view">
                <TabsList>
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
      <CreateTaskDialogComposition
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        portalRef={portalRef}
        onCreate={async (titles) => {
          await onCreateTasks?.(titles);
          const nextNumber = Math.max(0, ...tasks.map((task) => task.taskNumber)) + 1;
          const created = titles.map<TaskFixture>((title, index) => ({
            id: `created-${nextNumber + index}`,
            taskNumber: nextNumber + index,
            channelName: "proj-uiux",
            title,
            status: "todo",
            creatorId: "me",
            assigneeId: "unassigned",
          }));
          updateTasks([...created, ...tasks]);
          setAnnouncement(`${created.length} ${created.length === 1 ? "task" : "tasks"} created`);
        }}
      />
    </div>
  );
}
