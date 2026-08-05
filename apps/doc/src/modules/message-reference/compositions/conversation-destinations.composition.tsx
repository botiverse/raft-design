import { GitBranch, Hash, Lock, MessageSquareMore } from "lucide-react";
import { MessageReferenceBadge, MessageReferenceChip, MessageReferenceLabel } from "raft-ui";
import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceConversationDestinationsComposition() {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-4 text-sm text-foreground-strong">
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
        <span className="text-[12px] leading-[1.4] text-foreground-muted">#channel</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip
          variant="accent"
          render={<a href={MESSAGE_PLAYGROUND_URLS.hiringPrivateChannel} />}
        >
          <MessageReferenceBadge>private</MessageReferenceBadge>
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
          <MessageReferenceBadge>joint</MessageReferenceBadge>
          <GitBranch />
          <MessageReferenceLabel>northstar-launch-handoff</MessageReferenceLabel>
        </MessageReferenceChip>
        {/* @docs-source-strip-start */}
        <span className="text-[12px] leading-[1.4] text-foreground-muted">#joint-channel</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        {/* @docs-source-strip-end */}
        <MessageReferenceChip variant="accent" render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}>
          <MessageReferenceBadge>dm</MessageReferenceBadge>
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
