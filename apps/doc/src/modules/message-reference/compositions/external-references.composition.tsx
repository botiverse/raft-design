import { Link as LinkIcon, MessageSquareText } from "lucide-react";
import { MessageReferenceBadge, MessageReferenceChip, MessageReferenceLabel } from "raft-ui/wip";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceExternalReferencesComposition() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-4 text-sm text-foreground">
      <MessageReferenceChip
        variant="muted"
        render={<a href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage} />}
      >
        <MessageReferenceBadge>message</MessageReferenceBadge>
        <MessageSquareText />
        <MessageReferenceLabel>all · api-docs</MessageReferenceLabel>
      </MessageReferenceChip>
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
    </div>
  );
}
