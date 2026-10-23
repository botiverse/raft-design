import { useCallback, useState } from "react";
import {
  Button,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Skeleton,
  TaskLoadingList,
  TaskLoadingRow,
  TasksPanelRoot,
  TasksPanelToolbar,
  TasksPanelToolbarFilters,
  TasksPanelToolbarLabel,
  TasksPanelToolbarNewTask,
  TasksPanelToolbarView,
  TasksPanelViewport,
} from "@botiverse/raft-ui";
import { ChevronDown, Columns3, LayoutList, Plus, User, UserCircle2 } from "lucide-react";

export function TasksLoadingComposition() {
  const [view, setView] = useState("board");
  const [notice, setNotice] = useState("Tasks are loading");

  const handleNewTask = useCallback(() => setNotice("New Task pressed while loading"), []);
  const handleViewChange = useCallback((nextView: string) => {
    setView(nextView);
    setNotice(`${nextView} view selected while loading`);
  }, []);

  return (
    <div className="flex min-h-[34rem] w-full min-w-0">
      <TasksPanelRoot aria-label="Loading tasks">
        <TasksPanelToolbar>
          <TasksPanelToolbarNewTask>
            <Button variant="accent" size="md" onClick={handleNewTask}>
              <Plus aria-hidden />
              New Task
            </Button>
          </TasksPanelToolbarNewTask>
          <TasksPanelToolbarFilters>
            <TasksPanelToolbarLabel aria-hidden>
              <UserCircle2 aria-hidden />
              Creator
              <ChevronDown aria-hidden />
            </TasksPanelToolbarLabel>
            <TasksPanelToolbarLabel aria-hidden>
              <User aria-hidden />
              Assignee
              <ChevronDown aria-hidden />
            </TasksPanelToolbarLabel>
          </TasksPanelToolbarFilters>
          <TasksPanelToolbarView>
            <SegmentedControl value={view} onValueChange={handleViewChange} aria-label="Task view">
              <SegmentedControlItem value="board" aria-label="Board" className="max-md:px-2.5">
                <Columns3 aria-hidden />
                <SegmentedControlLabel className="max-md:hidden">Board</SegmentedControlLabel>
              </SegmentedControlItem>
              <SegmentedControlItem value="list" aria-label="List" className="max-md:px-2.5">
                <LayoutList aria-hidden />
                <SegmentedControlLabel className="max-md:hidden">List</SegmentedControlLabel>
              </SegmentedControlItem>
            </SegmentedControl>
          </TasksPanelToolbarView>
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
