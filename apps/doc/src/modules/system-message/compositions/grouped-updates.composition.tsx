import type { SystemMessageSlice } from "../system-message.fixtures.ts";
import { SystemMessageGroupedList } from "../system-message-grouped-list.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

const MESSAGES: SystemMessageSlice[] = [
  {
    id: "sys-task-moved-done",
    messageType: "system",
    content: '✅ Atlas moved #41 "Release review checklist" to Done',
  },
  {
    id: "sys-task-claimed",
    messageType: "system",
    content: '📌 Ada claimed #42 "Polish SystemMessage docs"',
  },
  {
    id: "sys-channel-rename",
    messageType: "system",
    content: "@atlas renamed this channel from #rename-before to #rename-after.",
  },
];

export function SystemMessageGroupedUpdatesContent() {
  return <SystemMessageGroupedList messages={MESSAGES} />;
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
