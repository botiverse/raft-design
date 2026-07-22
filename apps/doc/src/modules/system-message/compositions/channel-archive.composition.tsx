import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageChannelArchiveContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.channelArchive} time="2:16 PM" />;
}

// @docs-source-strip-start
export function SystemMessageChannelArchiveComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageChannelArchiveContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
