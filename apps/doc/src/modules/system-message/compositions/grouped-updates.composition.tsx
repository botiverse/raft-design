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
} from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function SystemMessageGroupedUpdatesContent() {
  return (
    <div className="w-full max-w-3xl">
      <SystemMessageGroup>
        <SystemMessageGroupHeader>
          <SystemMessageGroupDisclosure title="There are 3 system updates: 2 task updates, 1 system message">
            <SystemMessageGroupSummary>
              There are 3 system updates: 2 task updates, 1 system message
            </SystemMessageGroupSummary>
            <SystemMessageGroupChevron />
          </SystemMessageGroupDisclosure>
        </SystemMessageGroupHeader>
        <SystemMessageGroupPanel>
          <SystemMessage>
            <SystemMessageTime>2:18 PM</SystemMessageTime>
            <SystemMessageContent>
              ✅ Atlas moved #41 &quot;Release review checklist&quot; to Done
            </SystemMessageContent>
          </SystemMessage>
          <SystemMessage>
            <SystemMessageTime>2:19 PM</SystemMessageTime>
            <SystemMessageContent>
              📌 Ada claimed #42 &quot;Polish SystemMessage docs&quot;
            </SystemMessageContent>
          </SystemMessage>
          <SystemMessage>
            <SystemMessageTime>2:20 PM</SystemMessageTime>
            <SystemMessageContent>
              @atlas renamed this channel from #rename-before to #rename-after.
            </SystemMessageContent>
          </SystemMessage>
        </SystemMessageGroupPanel>
      </SystemMessageGroup>
    </div>
  );
}

// @docs-source-strip-start
export function SystemMessageGroupedUpdatesComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <SystemMessageGroupedUpdatesContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
