import type { ReactNode, RefObject } from "react";
import { Fragment, useCallback, useMemo, useRef, useState } from "react";
import {
  Banner,
  BannerDescription,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Input,
  Tabs,
  TabsLabel,
  TabsList,
  TabsTab,
} from "raft-ui";
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
  TaskListRoot,
  TaskSection,
  TaskSectionBadge,
  TaskSectionChevron,
  TaskSectionCount,
  TaskSectionEmpty,
  TaskSectionHeading,
  TaskSectionItems,
  TaskSectionPanel,
  TaskSectionTrigger,
  TasksPanelRoot,
  TasksPanelEmpty,
  TasksPanelToolbar,
  TasksPanelToolbarGroup,
  TasksPanelToolbarLabel,
  TasksPanelViewport,
} from "raft-ui/wip";
import { CheckSquare, ChevronDown, ListTodo, Plus, SquareKanban, Trash2, X } from "lucide-react";

import {
  getTaskStatusLabel,
  moveTaskFixture,
  TASK_FIXTURES,
  TASK_STATUSES,
  type TaskFixture,
  type TaskStatus,
} from "#/modules/task-card/task-card.fixtures.ts";
import { TaskCardComposition } from "#/modules/task-card/compositions/task-card.composition.tsx";
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
};

/** Static filter chrome for loading / empty demos. Interactive filters: TasksIdentityFiltersComposition. */
export function TasksToolbarFilterPlaceholder({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <TasksPanelToolbarLabel aria-hidden>
      {icon}
      {label}
      <ChevronDown aria-hidden />
    </TasksPanelToolbarLabel>
  );
}

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
  const [dialogOpen, setDialogOpen] = useState(false);
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
    <div ref={portalRef} className="relative flex h-full min-h-0 w-full min-w-0">
      <TasksPanelRoot aria-label="Tasks panel">
        <TasksPanelToolbar>
          <TasksPanelToolbarGroup>
            <Button variant="accent" size="sm" onClick={() => setDialogOpen(true)}>
              <Plus aria-hidden />
              New Task
            </Button>
            {toolbarFilters ?? <TasksIdentityFiltersComposition />}
          </TasksPanelToolbarGroup>
          <TasksPanelToolbarGroup>
            <Tabs value={view} onValueChange={setView} aria-label="Task view">
              <TabsList>
                <TabsTab value="board">
                  <SquareKanban aria-hidden />
                  <TabsLabel>Board</TabsLabel>
                </TabsTab>
                <TabsTab value="list">
                  <ListTodo aria-hidden />
                  <TabsLabel>List</TabsLabel>
                </TabsTab>
              </TabsList>
            </Tabs>
          </TasksPanelToolbarGroup>
        </TasksPanelToolbar>

        <TasksPanelViewport>
          {tasks.length === 0 ? (
            <TaskEmptyState filtered={false} />
          ) : visibleTasks.length === 0 ? (
            <TaskEmptyState filtered />
          ) : view === "board" ? (
            <TaskBoard
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
            <TaskList
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

function TaskBoard({
  tasks,
  collapsed,
  onCollapsedChange,
  onOpenTask,
  onStatusChange,
  onMoveTask,
  portalRef,
  blockedDropStatus,
  showChannelName,
}: TaskGroupedViewProps & {
  onMoveTask: (
    taskId: string,
    target: { status: TaskStatus; taskId?: string; placement?: "before" | "after" | null },
  ) => void;
  blockedDropStatus?: TaskStatus;
}) {
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

type TaskGroupedViewProps = {
  tasks: readonly TaskFixture[];
  collapsed: Record<TaskStatus, boolean>;
  onCollapsedChange: (status: TaskStatus, open: boolean) => void;
  onOpenTask: (task: TaskFixture) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  portalRef: RefObject<HTMLDivElement | null>;
  showChannelName: boolean;
};

function TaskList(props: TaskGroupedViewProps) {
  return (
    <TaskListRoot>
      {TASK_STATUSES.map((status) => {
        const statusTasks = props.tasks.filter((task) => task.status === status.id);
        return (
          <TaskSection
            key={status.id}
            open={!props.collapsed[status.id]}
            onOpenChange={(open) => props.onCollapsedChange(status.id, open)}
          >
            <TaskSectionTrigger>
              <TaskSectionHeading>
                <TaskSectionBadge status={status.id}>{status.label}</TaskSectionBadge>
                <TaskSectionCount>{statusTasks.length}</TaskSectionCount>
              </TaskSectionHeading>
              <TaskSectionChevron>
                <ChevronDown aria-hidden />
              </TaskSectionChevron>
            </TaskSectionTrigger>
            <TaskSectionPanel>
              {statusTasks.length === 0 ? (
                <TaskSectionEmpty>No {status.label.toLowerCase()} tasks.</TaskSectionEmpty>
              ) : (
                <TaskSectionItems>
                  {statusTasks.map((task) => (
                    <TaskCardComposition
                      key={task.id}
                      task={task}
                      onOpen={props.onOpenTask}
                      onStatusChange={props.onStatusChange}
                      portalRef={props.portalRef}
                      showChannelName={props.showChannelName}
                    />
                  ))}
                </TaskSectionItems>
              )}
            </TaskSectionPanel>
          </TaskSection>
        );
      })}
    </TaskListRoot>
  );
}

function TaskEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <TasksPanelEmpty render={<EmptyState />}>
      <EmptyStateIcon>
        <CheckSquare aria-hidden />
      </EmptyStateIcon>
      <EmptyStateTitle>{filtered ? "No tasks match this filter" : "No tasks yet"}</EmptyStateTitle>
      <EmptyStateDescription>
        {filtered
          ? "Try a different combination or clear the current selection."
          : "Create one with the New Task button."}
      </EmptyStateDescription>
    </TasksPanelEmpty>
  );
}

export function CreateTaskDialogComposition({
  open,
  onOpenChange,
  portalRef,
  onCreate,
  initialTitles = [""],
  forceError,
  forceSubmitting = false,
  preview = false,
  portalProps,
  contentClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portalRef?: RefObject<HTMLDivElement | null>;
  onCreate?: (titles: readonly string[]) => void | Promise<void>;
  initialTitles?: readonly string[];
  forceError?: string;
  forceSubmitting?: boolean;
  preview?: boolean;
  portalProps?: DialogContentProps["portalProps"];
  contentClassName?: string;
}) {
  const nextRowId = useRef(initialTitles.length);
  const [rows, setRows] = useState(() =>
    initialTitles.map((title, index) => ({ id: `initial-${index}`, title })),
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = forceSubmitting || submitting;
  const isBatch = rows.length > 1;
  const resetForm = () => {
    nextRowId.current = initialTitles.length;
    setRows(initialTitles.map((title, index) => ({ id: `initial-${index}`, title })));
    setError("");
    setSubmitting(false);
  };
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} modal={!preview} disablePointerDismissal onOpenChange={handleOpenChange}>
      <DialogContent
        overlay={preview ? false : undefined}
        initialFocus={preview ? false : undefined}
        finalFocus={preview ? false : undefined}
        className={contentClassName ?? "max-w-md"}
        portalProps={
          portalProps ??
          (portalRef ? { container: portalRef as RefObject<HTMLElement | null> } : undefined)
        }
      >
        <DialogHeader>
          <DialogTitle>{isBatch ? "Create Tasks" : "Create Task"}</DialogTitle>
          <DialogClose aria-label="Close Create Task dialog">
            <X aria-hidden />
          </DialogClose>
        </DialogHeader>
        <form
          className="contents"
          onSubmit={async (event) => {
            event.preventDefault();
            const nonEmpty = rows.flatMap((row) => {
              const title = row.title.trim();
              return title ? [title] : [];
            });
            if (nonEmpty.length === 0) {
              setError("At least one task title is required");
              return;
            }
            setError("");
            setSubmitting(true);
            try {
              await onCreate?.(nonEmpty);
              handleOpenChange(false);
            } catch {
              setError("Failed to create task");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <DialogBody className="grid gap-4">
            {forceError || error ? (
              <Banner status="warning" size="sm" role="alert">
                <BannerDescription className="font-bold">{forceError || error}</BannerDescription>
              </Banner>
            ) : null}
            <div>
              {rows.map((row, index) => (
                <div key={row.id} className="mb-1 flex min-w-0 items-center gap-1">
                  <Input
                    aria-label={`Task ${index + 1} title`}
                    value={row.title}
                    placeholder={`Task ${index + 1}`}
                    autoFocus={index === 0}
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((item) =>
                          item.id === row.id ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  {rows.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Remove task ${index + 1}`}
                      onClick={() =>
                        setRows((current) => current.filter((item) => item.id !== row.id))
                      }
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  setRows((current) => [
                    ...current,
                    { id: `row-${nextRowId.current++}`, title: "" },
                  ])
                }
              >
                <Plus aria-hidden />
                Add Another
              </Button>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="accent" disabled={isSubmitting}>
              {isSubmitting
                ? "Creating…"
                : isBatch
                  ? `Create ${rows.filter((row) => row.title.trim()).length} Tasks`
                  : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
