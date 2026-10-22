import { Link as LinkIcon } from "lucide-react";
import {
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferenceSuffix,
} from "@botiverse/raft-ui";
import { MESSAGE_EXAMPLE_HREFS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceExternalReferencesComposition() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-4 text-sm text-foreground">
      {/* @docs-source-strip-start */}
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="link"
          render={<a href={MESSAGE_EXAMPLE_HREFS.apiDocsMessage} />}
        >
          <LinkIcon />
          <MessageReferenceLabel>#raft-ui-migration</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Permalink</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="link"
          render={<a href={MESSAGE_EXAMPLE_HREFS.apiDocsMessage} />}
        >
          <LinkIcon />
          <MessageReferenceLabel>#raft-ui-migration</MessageReferenceLabel>
          <MessageReferenceSuffix>msg</MessageReferenceSuffix>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">Message link</span>
      </div>
      {/* @docs-source-strip-end */}
    </div>
  );
}
