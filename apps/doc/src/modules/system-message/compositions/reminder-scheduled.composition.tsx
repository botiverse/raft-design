import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageReminderScheduledContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.reminderScheduled} time="2:17 PM" />;
}

// @docs-source-strip-start
export function SystemMessageReminderScheduledComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageReminderScheduledContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
