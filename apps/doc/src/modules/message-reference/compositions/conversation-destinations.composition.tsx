import { Hash, MessageCircle, MessagesSquare, MessageSquareText } from "lucide-react";
import { MessageReferenceChip } from "raft-ui/wip";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceConversationDestinationsComposition() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-4 text-sm text-foreground">
      <div className="flex flex-col items-center gap-3">
        <MessageReferenceChip
          tone="accent"
          render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesChannel} />}
        >
          <Hash size={12} />
          release-notes
        </MessageReferenceChip>
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Channel</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <MessageReferenceChip tone="accent" render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}>
          <MessageCircle size={12} />
          Noah
        </MessageReferenceChip>
        <span className="text-[12px] leading-[1.4] text-foreground-muted">DM</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <MessageReferenceChip
          tone="info"
          render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
        >
          <MessagesSquare size={12} />
          release-notes · abc123
        </MessageReferenceChip>
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Thread</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <MessageReferenceChip
          tone="info"
          render={<a href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage} />}
        >
          <MessageSquareText size={12} />
          all · api-docs
        </MessageReferenceChip>
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Message</span>
      </div>
    </div>
  );
}
