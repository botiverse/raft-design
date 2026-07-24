import { useState } from "react";
import {
  Button,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Skeleton,
} from "raft-ui";
import {
  TaskLoadingList,
  TaskLoadingRow,
  TasksPanelRoot,
  TasksPanelToolbar,
  TasksPanelToolbarGroup,
  TasksPanelViewport,
} from "raft-ui/wip";
import { Columns3, LayoutList, Plus, User, UserCircle2 } from "lucide-react";

import { TasksToolbarFilterPlaceholder } from "./tasks-panel.composition";

export function TasksLoadingComposition() {
  const [view, setView] = useState("board");
  const [notice, setNotice] = useState("Tasks are loading");
  return (
    <div className="flex min-h-[34rem] w-full min-w-0">
      <TasksPanelRoot aria-label="Loading tasks">
        <TasksPanelToolbar>
          <TasksPanelToolbarGroup>
            <Button
              variant="accent"
              size="sm"
              onClick={() => setNotice("New Task pressed while loading")}
            >
              <Plus aria-hidden />
              New Task
            </Button>
            <TasksToolbarFilterPlaceholder label="Creator" icon={<UserCircle2 aria-hidden />} />
            <TasksToolbarFilterPlaceholder label="Assignee" icon={<User aria-hidden />} />
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
