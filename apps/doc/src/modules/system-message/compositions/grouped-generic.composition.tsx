import type { SystemMessageSlice } from "../system-message.fixtures.ts";
import { SystemMessageGroupedList } from "../system-message-grouped-list.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

const MESSAGES: SystemMessageSlice[] = [
  {
    id: "sys-channel-archive",
    messageType: "system",
    content: "📦 Atlas archived this channel",
  },
  {
    id: "sys-channel-unarchive",
    messageType: "system",
    content: "📤 Atlas unarchived this channel",
  },
];

export function SystemMessageGroupedGenericContent() {
  return <SystemMessageGroupedList messages={MESSAGES} />;
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
