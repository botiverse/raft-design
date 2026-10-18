import { Timeline, TimelineContent, TimelineItem, TimelineTime } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function TimelineHorizontalContent() {
  return (
    <Timeline horizontal>
      <TimelineItem>
        <TimelineContent>Order placed</TimelineContent>
        <TimelineTime>Mon</TimelineTime>
      </TimelineItem>
      <TimelineItem variant="information">
        <TimelineContent>Packed</TimelineContent>
        <TimelineTime>Tue</TimelineTime>
      </TimelineItem>
      <TimelineItem variant="success" lineType="dashed">
        <TimelineContent>Shipped</TimelineContent>
        <TimelineTime>Wed</TimelineTime>
      </TimelineItem>
      <TimelineItem variant="warning">
        <TimelineContent>Out for delivery</TimelineContent>
        <TimelineTime>Thu</TimelineTime>
      </TimelineItem>
    </Timeline>
  );
}

// @docs-source-strip-start
export function TimelineHorizontalComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <TimelineHorizontalContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
