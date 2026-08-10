import { Activity } from "lucide-react";
import {
  ActivityInboxPanel,
  ActivityInboxViewport,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "raft-ui";

export function EmptyActivityComposition() {
  return (
    <ActivityInboxPanel>
      <ActivityInboxViewport>
        <EmptyState className="h-full">
          <EmptyStateContent>
            <EmptyStateIcon>
              <Activity aria-hidden />
            </EmptyStateIcon>
            <EmptyStateTitle>You&apos;re all caught up</EmptyStateTitle>
            <EmptyStateDescription>
              New mentions, replies, and reactions will appear here.
            </EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}
