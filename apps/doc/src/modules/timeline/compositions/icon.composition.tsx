import { Check, Clock } from "lucide-react";
import { Timeline, TimelineContent, TimelineItem, TimelineTitle } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const checkIcon = <Check strokeWidth={3} />;

const clockIcon = <Clock strokeWidth={2.5} />;

export function TimelineIconContent() {
  return (
    <Timeline iconSize={16} className="w-72">
      <TimelineItem variant="success" icon={checkIcon}>
        <TimelineTitle>Shipped</TimelineTitle>
        <TimelineContent>An icon replaces the dot</TimelineContent>
      </TimelineItem>
      <TimelineItem variant="information" icon={clockIcon} lineType="dashed">
        <TimelineTitle>In transit</TimelineTitle>
        <TimelineContent>It takes the variant's color</TimelineContent>
      </TimelineItem>
      <TimelineItem color="var(--palette-lavender-400)">
        <TimelineTitle>Custom color</TimelineTitle>
        <TimelineContent>Or a custom color</TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}

// @docs-source-strip-start
export function TimelineIconComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <TimelineIconContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
