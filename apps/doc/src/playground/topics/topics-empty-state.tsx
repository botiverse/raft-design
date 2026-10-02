import { MessagesSquare } from "lucide-react";
import { EmptyState, EmptyStateContent, EmptyStateIcon, EmptyStateTitle } from "raft-ui";

export function PlaygroundTopicsEmptyState() {
  return (
    <EmptyState className="h-full min-h-full">
      <EmptyStateContent>
        <EmptyStateIcon>
          <MessagesSquare aria-hidden />
        </EmptyStateIcon>
        <EmptyStateTitle>Select a channel</EmptyStateTitle>
      </EmptyStateContent>
    </EmptyState>
  );
}
