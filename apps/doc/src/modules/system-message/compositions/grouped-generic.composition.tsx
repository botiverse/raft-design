import {
  SystemMessage,
  SystemMessageContent,
  SystemMessageGroup,
  SystemMessageGroupChevron,
  SystemMessageGroupDisclosure,
  SystemMessageGroupHeader,
  SystemMessageGroupPanel,
  SystemMessageGroupSummary,
  SystemMessageTime,
} from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageGroupedGenericContent() {
  return (
    <div className="w-full max-w-3xl">
      <SystemMessageGroup>
        <SystemMessageGroupHeader>
          <SystemMessageGroupDisclosure title="There are 2 system messages">
            <SystemMessageGroupSummary>There are 2 system messages</SystemMessageGroupSummary>
            <SystemMessageGroupChevron />
          </SystemMessageGroupDisclosure>
        </SystemMessageGroupHeader>
        <SystemMessageGroupPanel>
          <SystemMessage>
            <SystemMessageTime>2:18 PM</SystemMessageTime>
            <SystemMessageContent>📦 Atlas archived this channel</SystemMessageContent>
          </SystemMessage>
          <SystemMessage>
            <SystemMessageTime>2:19 PM</SystemMessageTime>
            <SystemMessageContent>📤 Atlas unarchived this channel</SystemMessageContent>
          </SystemMessage>
        </SystemMessageGroupPanel>
      </SystemMessageGroup>
    </div>
  );
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
