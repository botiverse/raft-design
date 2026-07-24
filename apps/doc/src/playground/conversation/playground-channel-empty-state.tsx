import { Hash } from "lucide-react";
import { EmptyState, EmptyStateContent, EmptyStateIcon, EmptyStateTitle } from "raft-ui";

export function PlaygroundChannelEmptyState() {
  return (
    <EmptyState className="h-full min-h-full">
      <EmptyStateContent>
        <EmptyStateIcon>
          <Hash aria-hidden />
        </EmptyStateIcon>
        <EmptyStateTitle>Select a channel</EmptyStateTitle>
      </EmptyStateContent>
    </EmptyState>
  );
}
