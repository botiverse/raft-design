import { Link as LinkIcon } from "lucide-react";
import { MessageReferenceChip, MessageReferenceLabel, MessageReferenceMeta } from "raft-ui/wip";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceExternalReferencesComposition() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-4 text-sm text-foreground">
      <MessageReferenceChip
        variant="muted"
        render={<a href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage} />}
      >
        <LinkIcon size={12} />
        <MessageReferenceLabel>all · api-docs</MessageReferenceLabel>
        <MessageReferenceMeta>msg</MessageReferenceMeta>
      </MessageReferenceChip>
      <MessageReferenceChip
        variant="link"
        render={
          <a href="https://github.com/botiverse/rui/pull/125" rel="noreferrer" target="_blank" />
        }
      >
        <LinkIcon size={12} />
        <MessageReferenceLabel>rui#125 Compose message surfaces</MessageReferenceLabel>
        <MessageReferenceMeta>github.com</MessageReferenceMeta>
      </MessageReferenceChip>
    </div>
  );
}
