import { Skeleton } from "raft-ui";
import {
  ActivityInboxItem,
  ActivityInboxItemContent,
  ActivityInboxList,
  ActivityInboxPanel,
  ActivityInboxViewport,
} from "raft-ui/wip";

export function LoadingActivityComposition() {
  return (
    <ActivityInboxPanel aria-busy="true">
      <ActivityInboxViewport>
        <ActivityInboxList>
          {Array.from({ length: 6 }, (_, index) => (
            <ActivityInboxItem key={index} aria-hidden disabled>
              <ActivityInboxItemContent className="flex flex-col gap-2">
                <Skeleton variant="line" className="w-2/5" />
                <Skeleton variant="line" className="w-full" />
              </ActivityInboxItemContent>
            </ActivityInboxItem>
          ))}
        </ActivityInboxList>
      </ActivityInboxViewport>
    </ActivityInboxPanel>
  );
}
