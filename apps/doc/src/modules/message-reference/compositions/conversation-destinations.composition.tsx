import { Hash, MessageCircle, MessagesSquare, MessageSquareText } from "lucide-react";
import { MessageReferenceBadge, MessageReferenceChip, MessageReferenceLabel } from "raft-ui/wip";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceConversationDestinationsComposition() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-4 text-sm text-foreground">
      {/* @docs-source-strip-start */}
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="accent"
          render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesChannel} />}
        >
          <MessageReferenceBadge>channel</MessageReferenceBadge>
          <Hash />
          <MessageReferenceLabel>release-notes</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Channel</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip variant="accent" render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}>
          <MessageReferenceBadge>dm</MessageReferenceBadge>
          <MessageCircle />
          <MessageReferenceLabel>Noah</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">DM</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="accent"
          render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
        >
          <MessageReferenceBadge>thread</MessageReferenceBadge>
          <MessagesSquare />
          <MessageReferenceLabel>release-notes · abc123</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Thread</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="accent"
          render={<a href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage} />}
        >
          <MessageReferenceBadge>message</MessageReferenceBadge>
          <MessageSquareText />
          <MessageReferenceLabel>all · api-docs</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Message</span>
      </div>
      {/* @docs-source-strip-end */}
    </div>
  );
}
