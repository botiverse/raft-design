import { MessageSquareQuote } from "lucide-react";
import { MessageReferenceBadge, MessageReferenceChip } from "raft-ui/wip";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceAttachmentCommentsComposition() {
  return (
    <p className="text-sm text-foreground">
      <MessageReferenceChip
        variant="neutral"
        render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
      >
        <MessageReferenceBadge>comment</MessageReferenceBadge>
        <MessageSquareQuote />
        <span>state-ownership-migration-notes.md · § Ownership boundary</span>
      </MessageReferenceChip>
    </p>
  );
}
