import { Timeline, TimelineContent, TimelineItem, TimelineTime, TimelineTitle } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function TimelinePlacementContent() {
  return (
    <div className="grid w-full max-w-lg grid-cols-2 gap-8">
      <Timeline>
        <TimelineItem>
          <TimelineTitle>Left</TimelineTitle>
          <TimelineContent>Markers on the left</TimelineContent>
          <TimelineTime>09:00</TimelineTime>
        </TimelineItem>
        <TimelineItem variant="success">
          <TimelineTitle>Left</TimelineTitle>
          <TimelineContent>The default placement</TimelineContent>
          <TimelineTime>10:00</TimelineTime>
        </TimelineItem>
      </Timeline>
      <Timeline itemPlacement="right">
        <TimelineItem>
          <TimelineTitle>Right</TimelineTitle>
          <TimelineContent>Markers on the right</TimelineContent>
          <TimelineTime>09:00</TimelineTime>
        </TimelineItem>
        <TimelineItem variant="success">
          <TimelineTitle>Right</TimelineTitle>
          <TimelineContent>Text aligns to the markers</TimelineContent>
          <TimelineTime>10:00</TimelineTime>
        </TimelineItem>
      </Timeline>
    </div>
  );
}

// @docs-source-strip-start
export function TimelinePlacementComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <TimelinePlacementContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
