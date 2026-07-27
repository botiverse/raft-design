import { SYSTEM_MESSAGE_GROUPED_GENERIC } from "../system-message.fixtures.ts";
import { SystemMessageGroupedList } from "../system-message-grouped-list.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageGroupedGenericContent() {
  return <SystemMessageGroupedList messages={SYSTEM_MESSAGE_GROUPED_GENERIC} />;
}

// @docs-source-strip-start
export function SystemMessageGroupedGenericComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageGroupedGenericContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
