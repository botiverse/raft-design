import { useState } from "react";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage, TaskChip } from "raft-ui";
import { MessageCircle, MessagesSquare, MessageSquareQuote } from "lucide-react";

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
  MessageReference,
} from "raft-ui/wip";
import {
  MessagePermalinkReferenceComposition,
  MessageReferenceLoadingComposition,
  MessageSelfMentionReferenceComposition,
  MessageUnavailableReferencesComposition,
} from "#/modules/message-item/compositions/content.compositions.tsx";
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
                  Open{" "}
                  <MessagePermalinkReferenceComposition
                    href={MESSAGE_PLAYGROUND_URLS.apiDocsMessage}
                  >
                    #all
                  </MessagePermalinkReferenceComposition>
                  {", and resolve a self mention separately: "}
                  <MessageSelfMentionReferenceComposition
                    portalContainer={portalContainer}
                    preview={<p>You · Current workspace member</p>}
                  >
                    @you
                  </MessageSelfMentionReferenceComposition>
                  {". The same resolver links task "}
                  <TaskChip
                    status="in_progress"
                    render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
                  >
                    <span className="shrink-0">#21</span>
                    <span className="min-w-0 truncate">@Noah</span>
                  </TaskChip>
                  {", thread "}
                  <MessageReference
                    variant="conversation"
                    render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
                  >
                    <MessagesSquare size={12} />
                    #release-notes:reply
                  </MessageReference>
                  {", and DM parents "}
                  <MessageReference
                    variant="conversation"
                    render={<a href={MESSAGE_PLAYGROUND_URLS.noahDm} />}
                  >
                    <MessageCircle size={12} />
                    dm:@noah
                  </MessageReference>{" "}
                  and{" "}
                  <MessageReference
                    variant="conversation"
                    render={<a href={MESSAGE_PLAYGROUND_URLS.noahDmThread} />}
                  >
                    <MessagesSquare size={12} />
                    dm:@noah:reply
                  </MessageReference>
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
            <MessageReference
              variant="attachment"
              render={
                <a
                  href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                  title="Jump to state-ownership-migration-notes.md · § Ownership boundary"
                />
              }
            >
              <MessageSquareQuote size={12} />
              <span>re: state-ownership-migration-notes.md · § Ownership boundary</span>
            </MessageReference>
          </div>
          <MessageMarkdown>
            <blockquote>
              The atom model is a better fit only if we keep server state out of the local store.
            </blockquote>
          </MessageMarkdown>
          <MessageItemBody>Commented on the attachment source boundary.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
