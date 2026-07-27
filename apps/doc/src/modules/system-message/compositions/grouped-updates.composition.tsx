import { SYSTEM_MESSAGE_GROUPED_UPDATES } from "../system-message.fixtures.ts";
import { SystemMessageGroupedList } from "../system-message-grouped-list.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageGroupedUpdatesContent() {
  return <SystemMessageGroupedList messages={SYSTEM_MESSAGE_GROUPED_UPDATES} />;
}

// @docs-source-strip-start
export function SystemMessageGroupedUpdatesComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageGroupedUpdatesContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
