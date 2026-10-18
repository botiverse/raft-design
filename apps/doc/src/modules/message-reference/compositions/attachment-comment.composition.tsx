import { MessageSquare } from "lucide-react";
import { MarkdownBlockquote, MessageReferenceChip, MessageReferenceLabel } from "raft-ui";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceAttachmentCommentComposition() {
  return (
    <div className="w-full max-w-xl text-sm text-foreground">
      <div className="mb-0.5">
        <MessageReferenceChip
          variant="muted"
          render={
            <a
              href={MESSAGE_PLAYGROUND_URLS.stateOwnershipAttachment}
              title="Jump to the message with state-ownership-migration-notes.md · § Ownership boundary"
            />
          }
        >
          <MessageSquare />
          <MessageReferenceLabel>
            re: state-ownership-migration-notes.md · § Ownership boundary
          </MessageReferenceLabel>
        </MessageReferenceChip>
      </div>
      <MarkdownBlockquote>
        The atom model is a better fit only if we keep server state out of the local store.
      </MarkdownBlockquote>
    </div>
  );
}
