import {
  Button,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "raft-ui";
import {
  TasksPanelRoot,
  TasksPanelEmpty,
  TasksPanelToolbar,
  TasksPanelToolbarGroup,
  TasksPanelViewport,
} from "raft-ui/wip";
import { CheckSquare, User } from "lucide-react";

import { TasksToolbarFilterPlaceholder } from "./tasks-panel.composition";

export function TasksEmptyStatesComposition() {
  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <div className="flex min-h-80">
        <TasksPanelRoot>
          <TasksPanelViewport>
            <TaskEmptyState filtered={false} />
          </TasksPanelViewport>
        </TasksPanelRoot>
      </div>
      <div className="flex min-h-80">
        <TasksPanelRoot>
          <TasksPanelToolbar>
            <TasksPanelToolbarGroup>
              <TasksToolbarFilterPlaceholder label="Assignee" icon={<User aria-hidden />} />
              <Button variant="ghost" size="sm">
                Clear
              </Button>
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
