import { Link as LinkIcon, MessageSquareText } from "lucide-react";
import { MessageReferenceBadge, MessageReferenceChip, MessageReferenceLabel } from "raft-ui/wip";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceExternalReferencesComposition() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-4 text-sm text-foreground">
      {/* @docs-source-strip-start */}
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="link"
          render={<a href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage} />}
        >
          <MessageReferenceBadge>message</MessageReferenceBadge>
          <MessageSquareText />
          <MessageReferenceLabel>all</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Permalink</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="link"
          render={
            <a href="https://github.com/botiverse/rui/pull/125" rel="noreferrer" target="_blank" />
          }
        >
          <MessageReferenceBadge>github.com</MessageReferenceBadge>
          <LinkIcon />
          <MessageReferenceLabel>rui#125 Compose message surfaces</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">External link</span>
      </div>
      {/* @docs-source-strip-end */}
    </div>
  );
}
