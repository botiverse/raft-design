import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  TasksPanelEmpty,
} from "@botiverse/raft-ui";
import { CheckSquare } from "lucide-react";

/** Panel-level empty host for the unfiltered and filtered-empty task lists. */
export function TasksPanelEmptyState({ filtered }: { filtered: boolean }) {
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
