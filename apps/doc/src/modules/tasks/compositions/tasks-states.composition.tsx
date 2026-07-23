import { useState } from "react";
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
  TaskLoadingList,
  TaskLoadingRow,
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

import { TasksToolbarFilterPlaceholder } from "./tasks-panel.composition";

export function TasksLoadingComposition() {
  const [view, setView] = useState("board");
  const [notice, setNotice] = useState("Tasks are loading");
  return (
    <div className="flex min-h-[34rem] w-full min-w-0">
      <TasksPanelRoot aria-label="Loading tasks">
        <TasksPanelToolbar>
          <TasksPanelToolbarGroup>
            <TasksToolbarFilterPlaceholder label="Creator" icon={<UserCircle2 aria-hidden />} />
            <TasksToolbarFilterPlaceholder label="Assignee" icon={<User aria-hidden />} />
            <Button
              variant="accent"
              size="sm"
              onClick={() => setNotice("New Task pressed while loading")}
            >
              <Plus aria-hidden />
              New Task
            </Button>
          </TasksPanelToolbarGroup>
          <TasksPanelToolbarGroup>
            <SegmentedControl
              value={view}
              onValueChange={(nextView) => {
                setView(nextView);
                setNotice(`${nextView} view selected while loading`);
              }}
              ariaLabel="Task view"
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
                <Skeleton variant="line" className="w-1/2" />
                <Skeleton variant="line" className="w-3/4" />
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
              <TasksToolbarFilterPlaceholder label="Assignee" icon={<User aria-hidden />} />
            </TasksPanelToolbarGroup>
          </TasksPanelToolbar>
          <TasksPanelViewport>
            <TaskEmptyState filtered />
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
