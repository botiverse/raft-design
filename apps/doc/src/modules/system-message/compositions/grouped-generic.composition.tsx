import {
  SystemMessageGroup,
  SystemMessageGroupChevron,
  SystemMessageGroupDisclosure,
  SystemMessageGroupHeader,
  SystemMessageGroupPanel,
  SystemMessageGroupSummary,
} from "raft-ui";
import { SystemMessageRowComposition } from "./preview.composition.tsx";
import type { SystemMessageRowCompositionProps } from "./preview.composition.tsx";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function SystemMessageGroupComposition({
  id,
  summary,
  events,
}: {
  id?: string;
  summary: string;
  events: readonly SystemMessageRowCompositionProps[];
}) {
  return (
    <SystemMessageGroup id={id}>
      <SystemMessageGroupHeader>
        <SystemMessageGroupDisclosure title={summary}>
          <SystemMessageGroupSummary>{summary}</SystemMessageGroupSummary>
          <SystemMessageGroupChevron />
        </SystemMessageGroupDisclosure>
      </SystemMessageGroupHeader>
      <SystemMessageGroupPanel>
        {events.map((event) => (
          <SystemMessageRowComposition
            key={event.id ?? `${event.createdAt}:${event.content}`}
            {...event}
          />
        ))}
      </SystemMessageGroupPanel>
    </SystemMessageGroup>
  );
}

export function SystemMessageGroupedGenericContent() {
  return (
    <div className="w-full max-w-3xl">
      <SystemMessageGroupComposition
        summary="There are 2 system messages"
        events={[
          {
            createdAt: "2:18 PM",
            content: "📦 Atlas archived this channel",
          },
          {
            createdAt: "2:19 PM",
            content: "📤 Atlas unarchived this channel",
          },
        ]}
      />
    </div>
  );
}

// @docs-source-strip-start
export function SystemMessageGroupedGenericComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <SystemMessageGroupedGenericContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
