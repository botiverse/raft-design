import { Activity } from "lucide-react";
import { EmptyState, EmptyStateContent, EmptyStateIcon, EmptyStateTitle } from "raft-ui";
import { ActivityInboxPanel, ActivityInboxViewport } from "raft-ui/wip";

export function EmptyActivityComposition() {
  return (
    <ActivityInboxPanel>
      <ActivityInboxViewport>
        <EmptyState className="h-full">
          <EmptyStateContent>
            <EmptyStateIcon>
              <Activity />
            </EmptyStateIcon>
            <EmptyStateTitle>Activity is empty</EmptyStateTitle>
          </EmptyStateContent>
        </EmptyState>
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}
