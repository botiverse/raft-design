import { GitBranch, Hash, Lock, MessageSquareMore } from "lucide-react";
import { MessageReferenceChip, MessageReferenceLabel } from "@botiverse/raft-ui";
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
          <Hash />
          <MessageReferenceLabel>release-notes</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">#channel</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="accent"
          render={<a href={MESSAGE_PLAYGROUND_URLS.hiringPrivateChannel} />}
        >
          <Lock />
          <MessageReferenceLabel>interview-debrief</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">#private-channel</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="accent"
          render={<a href={MESSAGE_PLAYGROUND_URLS.northstarJointChannel} />}
        >
          <GitBranch />
          <MessageReferenceLabel>northstar-launch-handoff</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">#joint-channel</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip variant="accent" render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}>
          <MessageSquareMore />
          <MessageReferenceLabel>dm:@noah-bennett</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">dm:@member</span>
      </div>
      {/* @docs-source-strip-end */}
    </div>
  );
}
