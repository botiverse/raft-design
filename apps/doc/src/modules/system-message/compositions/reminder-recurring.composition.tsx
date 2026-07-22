import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageReminderRecurringContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.reminderRecurring} time="2:20 PM" />;
}

// @docs-source-strip-start
export function SystemMessageReminderRecurringComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageReminderRecurringContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
