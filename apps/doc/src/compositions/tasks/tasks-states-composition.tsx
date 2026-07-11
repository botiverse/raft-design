import { useRef, useState } from "react";
import {
  Banner,
  BannerAction,
  BannerDescription,
  Button,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Skeleton,
} from "raft-ui";
import {
  TaskFilterClear,
  TaskFilterTrigger,
  TaskLoadingLines,
  TaskLoadingList,
  TaskLoadingRow,
  TaskToolbarAction,
  TasksPanelRoot,
  TasksPanelEmpty,
  TasksPanelToolbar,
  TasksPanelToolbarGroup,
  TasksPanelViewport,
} from "raft-ui/wip";
import {
  CheckSquare,
  Columns3,
  LayoutList,
  Plus,
  RotateCcw,
  User,
  UserCircle2,
} from "lucide-react";

import { SourceComparisonModalPreview } from "../source-comparison-preview.tsx";
import { TASK_FIXTURES } from "./task-fixtures";
import {
  CreateTaskDialogComposition,
  TaskIdentityFilterComposition,
  TaskCardComposition,
  TasksPanelComposition,
  type TaskIdentity,
} from "./tasks-panel-composition";

const FILTER_OPTIONS = [
  { id: "me" as const, label: "Assigned to me", isSentinel: true },
  { id: "unassigned" as const, label: "Unassigned", isSentinel: true },
  { id: "atlas" as const, label: "Atlas" },
] as const;

export function TaskCardStateMatrixComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("Interact with a card or status menu.");
  const handleOpen = (task: (typeof TASK_FIXTURES)[number]) =>
    setNotice(`Opened task #${task.taskNumber}`);
  const handleStatus = (taskId: string, status: string) =>
    setNotice(`${taskId} selected ${status}`);

  return (
    <div
      ref={portalRef}
      className="relative grid w-full max-w-5xl gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <TaskCardComposition
        task={TASK_FIXTURES[0]}
        onOpen={handleOpen}
        onStatusChange={handleStatus}
        portalRef={portalRef}
      />
      <TaskCardComposition
        task={TASK_FIXTURES[1]}
        onOpen={handleOpen}
        onStatusChange={handleStatus}
        portalRef={portalRef}
      />
      <TaskCardComposition
        task={TASK_FIXTURES[3]}
        onOpen={handleOpen}
        onStatusChange={handleStatus}
        portalRef={portalRef}
      />
      <TaskCardComposition task={TASK_FIXTURES[0]} disabled />
      <TaskCardComposition task={TASK_FIXTURES[2]} busy onOpen={handleOpen} />
      <TaskCardComposition
        task={TASK_FIXTURES[4]}
        menuOpen
        onOpen={handleOpen}
        onStatusChange={handleStatus}
        portalRef={portalRef}
      />
      <p className="col-span-full text-sm text-foreground-muted" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}

export function TasksLoadingComposition() {
  const [view, setView] = useState("board");
  const [notice, setNotice] = useState("Tasks are loading");
  return (
    <div className="flex min-h-[34rem] w-full min-w-0">
      <TasksPanelRoot aria-label="Loading tasks">
        <TasksPanelToolbar>
          <TasksPanelToolbarGroup>
            <TaskFilterTrigger onClick={() => setNotice("Creator filter pressed while loading")}>
              <UserCircle2 aria-hidden /> Creator
            </TaskFilterTrigger>
            <TaskFilterTrigger onClick={() => setNotice("Assignee filter pressed while loading")}>
              <User aria-hidden /> Assignee
            </TaskFilterTrigger>
            <TaskToolbarAction onClick={() => setNotice("New Task pressed while loading")}>
              <Plus aria-hidden />
              New Task
            </TaskToolbarAction>
            <SegmentedControl
              value={view}
              onValueChange={(nextView) => {
                setView(nextView);
                setNotice(`${nextView} view selected while loading`);
              }}
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
        <TasksPanelViewport aria-busy="true">
          <TaskLoadingList>
            {Array.from({ length: 5 }, (_, index) => (
              <TaskLoadingRow key={index}>
                <TaskLoadingLines>
                  <Skeleton variant="line" className="w-1/2" />
                  <Skeleton variant="line" className="w-3/4" />
                </TaskLoadingLines>
              </TaskLoadingRow>
            ))}
          </TaskLoadingList>
        </TasksPanelViewport>
        <span className="sr-only" aria-live="polite">
          {notice}
        </span>
      </TasksPanelRoot>
    </div>
  );
}

export function TasksEmptyStatesComposition() {
  const [filtered, setFiltered] = useState(true);
  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <div className="flex min-h-80 border border-line">
        <TasksPanelRoot>
          <TasksPanelViewport>
            <TaskEmptyState filtered={false} />
          </TasksPanelViewport>
        </TasksPanelRoot>
      </div>
      <div className="flex min-h-80 border border-line">
        <TasksPanelRoot>
          <TasksPanelToolbar>
            <TasksPanelToolbarGroup>
              {filtered ? (
                <>
                  <TaskFilterTrigger aria-pressed="true" disabled>
                    <User aria-hidden /> Assignee
                  </TaskFilterTrigger>
                  <TaskFilterClear onClick={() => setFiltered(false)}>Clear All</TaskFilterClear>
                </>
              ) : null}
            </TasksPanelToolbarGroup>
          </TasksPanelToolbar>
          <TasksPanelViewport>
            <TaskEmptyState filtered={filtered} />
          </TasksPanelViewport>
        </TasksPanelRoot>
      </div>
    </div>
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

export function TasksErrorComposition() {
  const [retryCount, setRetryCount] = useState(0);
  return (
    <div className="flex min-h-80 w-full">
      <TasksPanelRoot>
        <TasksPanelViewport>
          <Banner status="warning">
            <RotateCcw aria-hidden />
            <BannerDescription>
              Couldn&apos;t load tasks. Retry attempts: {retryCount}.
            </BannerDescription>
            <BannerAction>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Retry
              </Button>
            </BannerAction>
          </Banner>
        </TasksPanelViewport>
      </TasksPanelRoot>
    </div>
  );
}

export function TasksDragStatesComposition() {
  return (
    <div className="flex min-h-[42rem] w-full min-w-0">
      <TasksPanelComposition
        tasks={[TASK_FIXTURES[0], TASK_FIXTURES[2], TASK_FIXTURES[7]]}
        blockedDropStatus="closed"
      />
    </div>
  );
}

type FilterScenario = "default" | "active" | "open" | "no-results" | "busy" | "disabled";

export function TasksFilterStatesComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [scenario, setScenario] = useState<FilterScenario>("open");
  const [value, setValue] = useState<TaskIdentity[]>([]);
  const scenarioValue = scenario === "active" ? [FILTER_OPTIONS[2]] : value;
  return (
    <div ref={portalRef} className="relative grid min-h-80 w-full content-start gap-6">
      <SegmentedControl value={scenario} onValueChange={setScenario} ariaLabel="Task filter state">
        {(["default", "active", "open", "no-results", "busy", "disabled"] as const).map((item) => (
          <SegmentedControlItem key={item} value={item}>
            <SegmentedControlLabel>{item}</SegmentedControlLabel>
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      <TaskIdentityFilterComposition
        key={scenario}
        label="Assignee"
        icon={<User aria-hidden />}
        options={FILTER_OPTIONS}
        value={scenarioValue}
        onValueChange={setValue}
        portalRef={portalRef}
        open={scenario === "open" || scenario === "no-results"}
        initialQuery={scenario === "no-results" ? "Nobody" : ""}
        busy={scenario === "busy"}
        disabled={scenario === "disabled"}
      />
    </div>
  );
}

type DialogScenario = "single" | "batch" | "error" | "submitting";

export function CreateTaskDialogStatesComposition() {
  const [scenario, setScenario] = useState<DialogScenario>("single");
  const [open, setOpen] = useState(true);
  return (
    <div className="grid w-full gap-4">
      <SegmentedControl value={scenario} onValueChange={setScenario} ariaLabel="Create Task state">
        <SegmentedControlItem value="single">
          <SegmentedControlLabel>Single</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="batch">
          <SegmentedControlLabel>Batch</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="error">
          <SegmentedControlLabel>Error</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="submitting">
          <SegmentedControlLabel>Submitting</SegmentedControlLabel>
        </SegmentedControlItem>
      </SegmentedControl>
      {!open ? (
        <Button variant="accent" onClick={() => setOpen(true)}>
          Open Create Task dialog
        </Button>
      ) : null}
      <SourceComparisonModalPreview className="min-h-[30rem]" contentClassName="!max-w-md">
        {({ portalProps, contentClassName }) => (
          <CreateTaskDialogComposition
            key={scenario}
            open={open}
            preview
            portalProps={portalProps}
            contentClassName={contentClassName}
            onOpenChange={setOpen}
            initialTitles={
              scenario === "batch" ? ["Map task states", "Verify keyboard flow"] : [""]
            }
            forceError={scenario === "error" ? "Failed to create task" : undefined}
            forceSubmitting={scenario === "submitting"}
            onCreate={() => undefined}
          />
        )}
      </SourceComparisonModalPreview>
    </div>
  );
}
