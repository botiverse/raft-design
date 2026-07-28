import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageChannelRenameContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:16 PM</SystemMessageTime>
      <SystemMessageContent>
        @atlas renamed this channel from #rename-before to #rename-after.
      </SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageChannelRenameComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageChannelRenameContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
