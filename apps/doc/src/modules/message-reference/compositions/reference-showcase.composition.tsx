import { useState } from "react";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import { MessageSquare } from "lucide-react";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemInteractionBoundary,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
  MessageReferenceChip,
} from "raft-ui/wip";
import {
  MessagePermalinkReferenceComposition,
  MessageReferenceLoadingComposition,
  MessageSelfMentionReferenceComposition,
  MessageUnavailableReferencesComposition,
} from "./reference-adapters.composition.tsx";
import { MessageReferenceComparisonComposition } from "./reference-comparison.composition.tsx";

export function MessageReferenceShowcaseComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageReferenceComparisonComposition />
      <MessageItemInteractionBoundary ref={setPortalContainer}>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="agent">
              <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Atlas</MessageItemSender>
              <MessageItemTime>2:21 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              <MessageMarkdown>
                <p>
                  Keep a real external reference to the{" "}
                  <MessagePermalinkReferenceComposition
                    external
                    href="https://github.com/botiverse/slock"
                    meta="repo"
                  >
                    slock repository
                  </MessagePermalinkReferenceComposition>
                  {", and resolve a self mention separately: "}
                  <MessageSelfMentionReferenceComposition
                    portalContainer={portalContainer}
                    preview={<p>You · Current workspace member</p>}
                  >
                    @you
                  </MessageSelfMentionReferenceComposition>
                  {". The same resolver links task "}
                  <MessageReferenceChip
                    tone="muted"
                    render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
                  >
                    #21
                  </MessageReferenceChip>
                  {", thread "}
                  <MessageReferenceChip
                    tone="info"
                    render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
                  >
                    #release-notes:reply
                  </MessageReferenceChip>
                  {", and DM parents "}
                  <MessageReferenceChip
                    tone="accent"
                    render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}
                  >
                    dm:@noah
                  </MessageReferenceChip>{" "}
                  and{" "}
                  <MessageReferenceChip
                    tone="info"
                    render={<a href={MESSAGE_PLAYGROUND_URLS.noahDmThread} />}
                  >
                    dm:@noah:reply
                  </MessageReferenceChip>
                  {"."}
                </p>
                <p>
                  <MessageReferenceLoadingComposition>
                    Resolving thread reference
                  </MessageReferenceLoadingComposition>
                </p>
                <MessageUnavailableReferencesComposition />
              </MessageMarkdown>
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </MessageItemInteractionBoundary>
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:21 PM</MessageItemTime>
          </MessageItemHeader>
          <div className="mb-0.5">
            <MessageReferenceChip
              tone="neutral"
              render={
                <a
                  href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                  title="Jump to state-ownership-migration-notes.md · § Ownership boundary"
                />
              }
            >
              <MessageSquare size={12} />
              <span>re: state-ownership-migration-notes.md · § Ownership boundary</span>
            </MessageReferenceChip>
          </div>
          <MessageMarkdown>
            <blockquote>
              The atom model is a better fit only if we keep server state out of the local store.
            </blockquote>
          </MessageMarkdown>
          <MessageItemBody>Linked the ownership boundary to its source thread.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
