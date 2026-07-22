import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageChannelUnarchiveContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.channelUnarchive} time="2:16 PM" />;
}

// @docs-source-strip-start
export function SystemMessageChannelUnarchiveComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageChannelUnarchiveContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
