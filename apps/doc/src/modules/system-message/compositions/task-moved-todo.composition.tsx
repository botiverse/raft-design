import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskMovedTodoContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.taskMovedTodo} time="2:18 PM" />;
}

// @docs-source-strip-start
export function SystemMessageTaskMovedTodoComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageTaskMovedTodoContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
