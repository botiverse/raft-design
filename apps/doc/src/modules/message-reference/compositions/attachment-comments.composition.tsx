import { MessageSquareQuote } from "lucide-react";
import { MessageReferenceChip } from "raft-ui/wip";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceAttachmentCommentsComposition() {
  return (
    <p className="text-sm text-foreground">
      <MessageReferenceChip
        tone="neutral"
        render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
      >
        <MessageSquareQuote size={12} />
        <span>state-ownership-migration-notes.md · § Ownership boundary</span>
      </MessageReferenceChip>
    </p>
  );
}
