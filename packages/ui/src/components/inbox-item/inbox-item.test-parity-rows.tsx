import type { ReactElement } from "react";
import { Button } from "../button/button";
import {
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemLeading,
  InboxItemMarks,
  InboxItemSender,
  InboxItemSubtitle,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
} from "./inbox-item";
import { InboxItemSkeleton, InboxItemSkeletonList } from "./inbox-item-skeleton";

// The rows of the app that keep a trailing column, or have no time: an Activity
// row and an object row, a draft, an artifact row, a default-density row, and
// the skeletons that stand for them. Rendered by inbox-item.parity.test.tsx and
// by the script that wrote inbox-item.parity.main.json from main's components,
// so they use only the parts main has.
export const PARITY_ROWS: Record<string, ReactElement> = {
  "compact row with a trailing column": (
    <InboxItem density="compact" data-layout="list" data-unread>
      <InboxItemTrigger aria-label="Open" />
      <InboxItemLeading>
        <span />
      </InboxItemLeading>
      <InboxItemContent>
        <InboxItemHeading>
          <InboxItemTitle>Title</InboxItemTitle>
        </InboxItemHeading>
        <InboxItemBody>
          <InboxItemSender>Person A: </InboxItemSender>
          Preview
        </InboxItemBody>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp>2m</InboxItemTimestamp>
        <InboxItemMarks>
          <span>3</span>
        </InboxItemMarks>
        <InboxItemActions reveal="hover">
          <Button variant="outline" size="icon-md" aria-label="Mark as Done">
            D
          </Button>
        </InboxItemActions>
      </InboxItemTrailing>
    </InboxItem>
  ),
  "compact draft row with no time": (
    <InboxItem density="compact" data-layout="list">
      <InboxItemTrigger aria-label="Open" />
      <InboxItemLeading>
        <span />
      </InboxItemLeading>
      <InboxItemContent>
        <InboxItemHeading>
          <InboxItemTitle>Title</InboxItemTitle>
        </InboxItemHeading>
        <InboxItemBody>Draft</InboxItemBody>
      </InboxItemContent>
    </InboxItem>
  ),
  "compact artifact row": (
    <InboxItem density="compact">
      <InboxItemTrigger aria-label="Open" />
      <InboxItemContent>
        <InboxItemHeading>
          <InboxItemTitle>Title</InboxItemTitle>
        </InboxItemHeading>
        <InboxItemSubtitle className="truncate">#channel · v3</InboxItemSubtitle>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp>3 hours ago</InboxItemTimestamp>
      </InboxItemTrailing>
    </InboxItem>
  ),
  "default row": (
    <InboxItem data-unread>
      <InboxItemTrigger aria-label="Open" />
      <InboxItemContent>
        <InboxItemHeading>
          <InboxItemTitle>Title</InboxItemTitle>
        </InboxItemHeading>
        <InboxItemBody>Preview</InboxItemBody>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp>2m</InboxItemTimestamp>
        <InboxItemActions reveal="hover">
          <Button variant="outline" size="icon-md" aria-label="Mark as Done">
            D
          </Button>
        </InboxItemActions>
      </InboxItemTrailing>
    </InboxItem>
  ),
  "compact skeleton": <InboxItemSkeleton density="compact" leading />,
  "default skeleton": <InboxItemSkeleton context />,
  "compact skeleton list": <InboxItemSkeletonList count={2} delay={0} density="compact" leading />,
};
