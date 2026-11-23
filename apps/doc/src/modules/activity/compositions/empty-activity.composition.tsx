import { Activity } from "lucide-react";
import {
  ActivityInboxPanel,
  ActivityInboxViewport,
  EmptyState,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@botiverse/raft-ui";

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
          </EmptyStateContent>
        </EmptyState>
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}
