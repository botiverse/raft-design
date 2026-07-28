import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MarkdownBlockquote,
  MarkdownParagraph,
  TaskChip,
} from "raft-ui";
import { MessagesSquare, MessageSquareQuote } from "lucide-react";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageReferenceBadge,
  MessageReferenceChip,
  MessageReferenceLabel,
} from "raft-ui/wip";
import { MessageReferenceComparisonComposition } from "./reference-comparison.composition.tsx";

export function MessageReferenceShowcaseComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageReferenceComparisonComposition />
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
            <MarkdownParagraph>
              Finish task{" "}
              <TaskChip status="todo" render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}>
                #21
              </TaskChip>{" "}
              before replying in{" "}
              <MessageReferenceChip
                variant="accent"
                render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
              >
                <MessageReferenceBadge>thread</MessageReferenceBadge>
                <MessagesSquare />
                <MessageReferenceLabel>release-notes · reply</MessageReferenceLabel>
              </MessageReferenceChip>
              .
            </MarkdownParagraph>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
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
              variant="neutral"
              render={
                <a
                  href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                  title="Jump to state-ownership-migration-notes.md · § Ownership boundary"
                />
              }
            >
              <MessageReferenceBadge>comment</MessageReferenceBadge>
              <MessageSquareQuote />
              <MessageReferenceLabel>
                re: state-ownership-migration-notes.md · § Ownership boundary
              </MessageReferenceLabel>
            </MessageReferenceChip>
          </div>
          <MarkdownBlockquote>
            The atom model is a better fit only if we keep server state out of the local store.
          </MarkdownBlockquote>
          <MessageItemBody>Commented on the attachment source boundary.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
