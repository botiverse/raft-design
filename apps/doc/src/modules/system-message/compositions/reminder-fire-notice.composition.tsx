import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageReminderFireNoticeContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.reminderFireNotice} time="2:20 PM" />;
}

// @docs-source-strip-start
export function SystemMessageReminderFireNoticeComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageReminderFireNoticeContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
