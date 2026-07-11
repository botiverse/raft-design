import type { ReactNode, RefObject } from "react";
import { useMemo, useRef, useState } from "react";
import {
  Avatar,
  Combobox,
  ComboboxTrigger,
  ComboboxTriggerIndicator,
  DialogClose,
  type DialogContentProps,
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
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
  TaskCard,
  TaskCardBody,
  TaskCardChannel,
  TaskCardDescription,
  TaskCardFooter,
  TaskCardLegacy,
  TaskCardMeta,
  TaskCardNumber,
  TaskCardOpen,
  TaskCardRow,
  TaskCardStatus,
  TaskCardStatusTrigger,
  TaskCardTitle,
  TaskCreateAction,
  TaskCreateAddAction,
  TaskCreateBody,
  TaskCreateCloseAction,
  TaskCreateDialog,
  TaskCreateDialogContent,
  TaskCreateDialogError,
  TaskCreateDialogForm,
  TaskCreateDialogHeader,
  TaskCreateDialogTitle,
  TaskCreateFieldRow,
  TaskCreateFields,
  TaskCreateFooter,
  TaskCreateRemoveAction,
  TaskDndProvider,
  TaskDraggable,
  TaskDropZone,
  TaskFilterCount,
  TaskFilterClear,
  TaskFilterContent,
  TaskFilterEmpty,
  TaskFilterHeader,
  TaskFilterInput,
  TaskFilterLabel,
  TaskFilterList,
  TaskFilterOption,
  TaskFilterOptionContent,
  TaskFilterOptionIndicator,
  TaskFilterOptionLabel,
  TaskFilterOptionLeading,
  TaskFilterPopoverClear,
  TaskFilterSearch,
  TaskFilterTrigger,
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
  TasksPanelViewport,
  TaskStatusMenuContent,
  TaskStatusMenuItem,
  TaskToolbarAction,
} from "raft-ui/wip";
import {
  CheckSquare,
  ChevronDown,
  Columns3,
  LayoutList,
  Plus,
  Pencil,
  Trash2,
  User,
  UserCircle2,
  X,
} from "lucide-react";

import {
  getTaskStatusLabel,
  TASK_FIXTURES,
  TASK_STATUSES,
  type TaskFixture,
  type TaskStatus,
} from "./task-fixtures";

type TaskView = "board" | "list";
export type TaskIdentity = {
  id: string;
  label: string;
  searchText?: string;
  avatar?: ReactNode;
  isSentinel?: boolean;
};

const STATUS_TONES = {
  todo: "warning",
  in_progress: "information",
  in_review: "accent-muted",
  done: "success",
  closed: "muted",
} as const;
const STATUS_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  todo: ["in_progress", "closed"],
  in_progress: ["in_review", "done", "closed"],
  in_review: ["done", "in_progress", "closed"],
  done: ["todo", "in_progress", "in_review", "closed"],
  closed: ["todo"],
};
const STATUS_OPTIONS: Record<TaskStatus, ReadonlySet<TaskStatus>> = {
  todo: new Set(["todo", ...STATUS_TRANSITIONS.todo]),
  in_progress: new Set(["in_progress", ...STATUS_TRANSITIONS.in_progress]),
  in_review: new Set(["in_review", ...STATUS_TRANSITIONS.in_review]),
  done: new Set(["done", ...STATUS_TRANSITIONS.done]),
  closed: new Set(["closed", ...STATUS_TRANSITIONS.closed]),
};

const CREATOR_OPTIONS: readonly TaskIdentity[] = [
  { id: "me", label: "Created by me", isSentinel: true },
  { id: "atlas", label: "Atlas" },
];
const ASSIGNEE_OPTIONS: readonly TaskIdentity[] = [
  { id: "me", label: "Assigned to me", isSentinel: true },
  { id: "unassigned", label: "Unassigned", isSentinel: true },
  { id: "atlas", label: "Atlas" },
];

export type TasksPanelCompositionProps = {
  tasks?: readonly TaskFixture[];
  view?: TaskView;
  initialView?: TaskView;
  onViewChange?: (view: TaskView) => void;
  onTasksChange?: (tasks: readonly TaskFixture[]) => void;
  onOpenTask?: (task: TaskFixture) => void;
  onCreateTasks?: (titles: readonly string[]) => void | Promise<void>;
  blockedDropStatus?: TaskStatus;
  showChannelName?: boolean;
  creatorOptions?: readonly TaskIdentity[];
  assigneeOptions?: readonly TaskIdentity[];
};

export function TasksPanelComposition({
  tasks: controlledTasks,
  view: controlledView,
  initialView = "board",
  onViewChange,
  onTasksChange,
  onOpenTask,
  onCreateTasks,
  blockedDropStatus,
  showChannelName = false,
  creatorOptions = CREATOR_OPTIONS,
  assigneeOptions = ASSIGNEE_OPTIONS,
}: TasksPanelCompositionProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [localTasks, setLocalTasks] = useState<readonly TaskFixture[]>(TASK_FIXTURES);
  const [localView, setLocalView] = useState<TaskView>(initialView);
  const [creator, setCreator] = useState<TaskIdentity[]>([]);
  const [assignee, setAssignee] = useState<TaskIdentity[]>([]);
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

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (creator.length === 0 || creator.some((item) => item.id === task.creatorId)) &&
          (assignee.length === 0 || assignee.some((item) => item.id === task.assigneeId)),
      ),
    [assignee, creator, tasks],
  );
  const sortedTasks = useMemo(
    () => [...filteredTasks].sort((a, b) => b.taskNumber - a.taskNumber),
    [filteredTasks],
  );

  const updateStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    updateTasks(tasks.map((item) => (item.id === taskId ? { ...item, status } : item)));
    setAnnouncement(`Task #${task.taskNumber} moved to ${getTaskStatusLabel(status)}`);
  };
  const openTask = (task: TaskFixture) => {
    onOpenTask?.(task);
    setAnnouncement(`Opened task #${task.taskNumber}: ${task.title}`);
  };
  const hasFilters = creator.length > 0 || assignee.length > 0;

  return (
    <div ref={portalRef} className="relative flex h-full min-h-0 w-full min-w-0">
      <TasksPanelRoot aria-label="Tasks panel">
        <TasksPanelToolbar>
          <TasksPanelToolbarGroup>
            <TaskIdentityFilterComposition
              label="Creator"
              icon={<UserCircle2 aria-hidden />}
              options={creatorOptions}
              value={creator}
              onValueChange={setCreator}
              portalRef={portalRef}
            />
            <TaskIdentityFilterComposition
              label="Assignee"
              icon={<User aria-hidden />}
              options={assigneeOptions}
              value={assignee}
              onValueChange={setAssignee}
              portalRef={portalRef}
            />
            {hasFilters ? (
              <TaskFilterClear
                onClick={() => {
                  setCreator([]);
                  setAssignee([]);
                  setAnnouncement("All task filters cleared");
                }}
              >
                Clear All
              </TaskFilterClear>
            ) : null}
            <TaskToolbarAction onClick={() => setDialogOpen(true)}>
              <Plus aria-hidden />
              New Task
            </TaskToolbarAction>
            <SegmentedControl
              value={view}
              onValueChange={setView}
              ariaLabel="Task view"
              className="ml-auto"
            >
              <SegmentedControlItem value="board">
                <Columns3 aria-hidden />
                <SegmentedControlLabel>Board</SegmentedControlLabel>
              </SegmentedControlItem>
              <SegmentedControlItem value="list">
                <LayoutList aria-hidden />
                <SegmentedControlLabel>List</SegmentedControlLabel>
              </SegmentedControlItem>
            </SegmentedControl>
          </TasksPanelToolbarGroup>
        </TasksPanelToolbar>

        <TasksPanelViewport>
          {sortedTasks.length === 0 ? (
            <TaskEmptyState filtered={hasFilters} />
          ) : view === "board" ? (
            <TaskBoard
              tasks={sortedTasks}
              collapsed={collapsed}
              onCollapsedChange={(status, nextOpen) =>
                setCollapsed((current) => ({ ...current, [status]: !nextOpen }))
              }
              onOpenTask={openTask}
              onStatusChange={updateStatus}
              onMoveTask={updateStatus}
              portalRef={portalRef}
              blockedDropStatus={blockedDropStatus}
              showChannelName={showChannelName}
            />
          ) : (
            <TaskList
              tasks={sortedTasks}
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
            creatorId: creatorOptions[0]?.id,
            assigneeId: assigneeOptions.find((option) => option.id === "unassigned")?.id,
          }));
          updateTasks([...created, ...tasks]);
          setAnnouncement(`${created.length} ${created.length === 1 ? "task" : "tasks"} created`);
        }}
      />
    </div>
  );
}

export function TaskIdentityFilterComposition({
  label,
  icon,
  options,
  value,
  onValueChange,
  portalRef,
  open,
  onOpenChange,
  initialQuery = "",
  busy = false,
  disabled = false,
}: {
  label: string;
  icon: React.ReactNode;
  options: readonly TaskIdentity[];
  value: TaskIdentity[];
  onValueChange: (value: TaskIdentity[]) => void;
  portalRef: RefObject<HTMLDivElement | null>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialQuery?: string;
  busy?: boolean;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  return (
    <Combobox<TaskIdentity, true>
      multiple
      open={open}
      disabled={disabled}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setQuery("");
        onOpenChange?.(nextOpen);
      }}
      items={options}
      value={value}
      inputValue={query}
      itemToStringLabel={(item) => `${item.label} ${item.searchText ?? ""}`.trim()}
      isItemEqualToValue={(item, selected) => item.id === selected.id}
      onValueChange={onValueChange}
      onInputValueChange={(nextQuery, details) => {
        if (details.reason !== "item-press") setQuery(nextQuery);
      }}
    >
      <ComboboxTrigger
        render={
          <TaskFilterTrigger
            aria-pressed={value.length > 0}
            busy={busy}
            disabled={disabled || busy}
          />
        }
      >
        {icon}
        <span>{label}</span>
        {value.length > 0 ? <TaskFilterCount>{value.length}</TaskFilterCount> : null}
        <ComboboxTriggerIndicator>
          <ChevronDown aria-hidden />
        </ComboboxTriggerIndicator>
      </ComboboxTrigger>
      <TaskFilterContent
        side="bottom"
        align="start"
        sideOffset={8}
        initialFocus
        portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
      >
        <TaskFilterHeader>
          <TaskFilterLabel>{label}</TaskFilterLabel>
          {value.length > 0 ? <TaskFilterPopoverClear>Clear</TaskFilterPopoverClear> : null}
        </TaskFilterHeader>
        <TaskFilterSearch>
          <TaskFilterInput aria-label={`Search ${label.toLowerCase()}`} placeholder="Search…" />
        </TaskFilterSearch>
        <TaskFilterEmpty>No matches</TaskFilterEmpty>
        <TaskFilterList>
          {(identity: TaskIdentity) => (
            <TaskFilterOption key={identity.id} value={identity}>
              <TaskFilterOptionContent>
                <TaskFilterOptionLeading>
                  {identity.isSentinel
                    ? null
                    : (identity.avatar ?? <Avatar size="xs" type="agent" />)}
                </TaskFilterOptionLeading>
                <TaskFilterOptionLabel italic={identity.isSentinel}>
                  {identity.label}
                </TaskFilterOptionLabel>
              </TaskFilterOptionContent>
              <TaskFilterOptionIndicator />
            </TaskFilterOption>
          )}
        </TaskFilterList>
      </TaskFilterContent>
    </Combobox>
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
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  blockedDropStatus?: TaskStatus;
}) {
  return (
    <TaskDndProvider
      isDropAllowed={(activeId, overId) =>
        overId !== blockedDropStatus &&
        tasks.some((task) => task.id === activeId && !task.dragDisabled)
      }
      onMove={({ activeId, overId }) => onMoveTask(String(activeId), overId as TaskStatus)}
    >
      <TaskBoardRoot>
        {TASK_STATUSES.map((status) => {
          const statusTasks = tasks.filter((task) => task.status === status.id);
          return (
            <TaskBoardColumn
              key={status.id}
              render={<TaskDropZone id={status.id} />}
              open={!collapsed[status.id]}
              onOpenChange={(open) => onCollapsedChange(status.id, open)}
            >
              <TaskBoardColumnTrigger>
                <TaskBoardColumnHeading>
                  <TaskBoardColumnBadge tone={STATUS_TONES[status.id]}>
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
                          onOpen={onOpenTask}
                          onStatusChange={onStatusChange}
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
                <TaskSectionBadge tone={STATUS_TONES[status.id]}>
                  {status.label.toUpperCase()}
                </TaskSectionBadge>
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

export function TaskCardComposition({
  task,
  busy = false,
  disabled = task.disabled,
  readOnly = false,
  menuOpen,
  onOpen,
  onStatusChange,
  portalRef,
  showChannelName = false,
}: {
  task: TaskFixture;
  busy?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  menuOpen?: boolean;
  onOpen?: (task: TaskFixture) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  portalRef?: RefObject<HTMLDivElement | null>;
  showChannelName?: boolean;
}) {
  return (
    <TaskCard disabled={disabled}>
      <TaskCardOpen disabled={disabled || readOnly || !onOpen} onClick={() => onOpen?.(task)}>
        <TaskCardRow>
          <TaskCardBody>
            <TaskCardMeta>
              {showChannelName ? <TaskCardChannel>#{task.channelName}</TaskCardChannel> : null}
              <TaskCardNumber>#{task.taskNumber}</TaskCardNumber>
              {task.isLegacy ? <TaskCardLegacy>LEGACY</TaskCardLegacy> : null}
            </TaskCardMeta>
            <TaskCardTitle>{task.title}</TaskCardTitle>
            {task.description ? (
              <TaskCardDescription>{task.description}</TaskCardDescription>
            ) : null}
          </TaskCardBody>
        </TaskCardRow>
      </TaskCardOpen>
      <TaskCardFooter>
        {readOnly ? (
          <TaskCardStatus busy={busy}>
            <TaskCardStatusTrigger tone={STATUS_TONES[task.status]} render={<span />}>
              {getTaskStatusLabel(task.status)} <Pencil aria-hidden />
            </TaskCardStatusTrigger>
          </TaskCardStatus>
        ) : (
          <DropdownMenu defaultOpen={menuOpen}>
            <TaskCardStatus busy={busy}>
              <DropdownMenuTrigger
                disabled={disabled || busy || !onStatusChange}
                render={
                  <TaskCardStatusTrigger
                    tone={STATUS_TONES[task.status]}
                    busy={busy}
                    disabled={disabled || busy || !onStatusChange}
                  />
                }
              >
                {getTaskStatusLabel(task.status)}
                <Pencil aria-hidden />
              </DropdownMenuTrigger>
            </TaskCardStatus>
            <TaskStatusMenuContent
              align="end"
              portalProps={
                portalRef ? { container: portalRef as RefObject<HTMLElement | null> } : undefined
              }
            >
              <DropdownMenuRadioGroup
                value={task.status}
                onValueChange={(status) => onStatusChange?.(task.id, status as TaskStatus)}
              >
                {TASK_STATUSES.flatMap((status) =>
                  STATUS_OPTIONS[task.status].has(status.id)
                    ? [
                        <TaskStatusMenuItem key={status.id} value={status.id}>
                          {status.label}
                        </TaskStatusMenuItem>,
                      ]
                    : [],
                )}
              </DropdownMenuRadioGroup>
            </TaskStatusMenuContent>
          </DropdownMenu>
        )}
      </TaskCardFooter>
    </TaskCard>
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
    <TaskCreateDialog open={open} modal={!preview} onOpenChange={handleOpenChange}>
      <TaskCreateDialogContent
        overlay={preview ? false : undefined}
        initialFocus={preview ? false : undefined}
        finalFocus={preview ? false : undefined}
        className={contentClassName}
        portalProps={
          portalProps ??
          (portalRef ? { container: portalRef as RefObject<HTMLElement | null> } : undefined)
        }
      >
        <TaskCreateDialogHeader>
          <TaskCreateDialogTitle>{isBatch ? "Create Tasks" : "Create Task"}</TaskCreateDialogTitle>
          <DialogClose render={<TaskCreateCloseAction aria-label="Close Create Task dialog" />}>
            <X aria-hidden />
          </DialogClose>
        </TaskCreateDialogHeader>
        <TaskCreateDialogForm
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
          {forceError || error ? (
            <TaskCreateDialogError>{forceError || error}</TaskCreateDialogError>
          ) : null}
          <TaskCreateBody>
            <TaskCreateFields>
              {rows.map((row, index) => (
                <TaskCreateFieldRow key={row.id}>
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
                    <TaskCreateRemoveAction
                      aria-label={`Remove task ${index + 1}`}
                      onClick={() =>
                        setRows((current) => current.filter((item) => item.id !== row.id))
                      }
                    >
                      <Trash2 aria-hidden />
                    </TaskCreateRemoveAction>
                  ) : null}
                </TaskCreateFieldRow>
              ))}
            </TaskCreateFields>
            <TaskCreateAddAction
              onClick={() =>
                setRows((current) => [...current, { id: `row-${nextRowId.current++}`, title: "" }])
              }
            >
              <Plus aria-hidden />
              Add Another
            </TaskCreateAddAction>
          </TaskCreateBody>
          <TaskCreateFooter>
            <DialogClose render={<TaskCreateAction tone="default" />}>Cancel</DialogClose>
            <TaskCreateAction type="submit" tone="accent" disabled={isSubmitting}>
              {isSubmitting
                ? "Creating…"
                : isBatch
                  ? `Create ${rows.filter((row) => row.title.trim()).length} Tasks`
                  : "Create Task"}
            </TaskCreateAction>
          </TaskCreateFooter>
        </TaskCreateDialogForm>
      </TaskCreateDialogContent>
    </TaskCreateDialog>
  );
}
