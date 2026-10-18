import {
  Button,
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  TasksPanelRoot,
  TasksPanelEmpty,
  TasksPanelToolbar,
  TasksPanelToolbarFilters,
  TasksPanelToolbarLabel,
  TasksPanelViewport,
} from "@botiverse/raft-ui";
import { CheckSquare, ChevronDown, User } from "lucide-react";

export function TasksPanelEmptyContent() {
  return (
    <TasksPanelRoot>
      <TasksPanelViewport>
        <TaskEmptyState filtered={false} />
      </TasksPanelViewport>
    </TasksPanelRoot>
  );
}

export function TasksPanelFilteredEmptyContent() {
  return (
    <TasksPanelRoot>
      <TasksPanelToolbar>
        <TasksPanelToolbarFilters>
          <TasksPanelToolbarLabel aria-hidden>
            <User aria-hidden />
            Assignee
            <ChevronDown aria-hidden />
          </TasksPanelToolbarLabel>
          <Button variant="ghost" size="sm">
            Clear
          </Button>
        </TasksPanelToolbarFilters>
      </TasksPanelToolbar>
      <TasksPanelViewport>
        <TaskEmptyState filtered />
      </TasksPanelViewport>
    </TasksPanelRoot>
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

// @docs-source-strip-start
// Side-by-side display shell only. Use the content components above for real usage.
export function TasksEmptyStatesComposition() {
  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <div className="flex min-h-80">
        <TasksPanelEmptyContent />
      </div>
      <div className="flex min-h-80">
        <TasksPanelFilteredEmptyContent />
      </div>
    </div>
  );
}
// @docs-source-strip-end
