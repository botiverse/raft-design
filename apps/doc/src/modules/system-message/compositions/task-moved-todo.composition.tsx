import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskMovedTodoContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:18 PM</SystemMessageTime>
      <SystemMessageContent>
        📝 Atlas moved #41 "Release review checklist" to Todo
      </SystemMessageContent>
    </SystemMessage>
  );
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
