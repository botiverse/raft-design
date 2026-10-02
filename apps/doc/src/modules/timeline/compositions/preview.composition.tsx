import { Timeline, TimelineContent, TimelineItem, TimelineTime, TimelineTitle } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function TimelinePreviewContent() {
  return (
    <Timeline className="w-72">
      <TimelineItem>
        <TimelineTitle>Draft</TimelineTitle>
        <TimelineContent>Draft opened for review</TimelineContent>
        <TimelineTime>2026-10-01 09:12</TimelineTime>
      </TimelineItem>
      <TimelineItem variant="success">
        <TimelineTitle>Checks</TimelineTitle>
        <TimelineContent>All checks passed</TimelineContent>
        <TimelineTime>2026-10-01 10:40</TimelineTime>
      </TimelineItem>
      <TimelineItem variant="warning">
        <TimelineTitle>Review</TimelineTitle>
        <TimelineContent>One reviewer asked for changes</TimelineContent>
        <TimelineTime>2026-10-01 14:05</TimelineTime>
      </TimelineItem>
      <TimelineItem variant="danger">
        <TimelineTitle>Deploy</TimelineTitle>
        <TimelineContent>Deploy to staging failed</TimelineContent>
        <TimelineTime>2026-10-01 16:30</TimelineTime>
      </TimelineItem>
      <TimelineItem variant="information">
        <TimelineTitle>Release</TimelineTitle>
        <TimelineContent>Waiting on the release window</TimelineContent>
        <TimelineTime>2026-10-02 08:00</TimelineTime>
      </TimelineItem>
    </Timeline>
  );
}

// @docs-source-strip-start
export function TimelinePreviewComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <TimelinePreviewContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
