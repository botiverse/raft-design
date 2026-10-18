import { MessagesSquare } from "lucide-react";
import { MessageReferenceChip, MessageReferenceLabel } from "raft-ui";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceThreadReferencesComposition() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-4 text-sm text-foreground-strong">
      {/* @docs-source-strip-start */}
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="info"
          render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelThread} />}
        >
          <MessagesSquare />
          <MessageReferenceLabel>#state-model:29a90e07</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">#channel:shortId</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip variant="info" render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}>
          <MessagesSquare />
          <MessageReferenceLabel>dm:@noah-bennett:feedface</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">dm:@member:shortId</span>
      </div>
      {/* @docs-source-strip-end */}
    </div>
  );
}
