import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage, TaskChip } from "raft-ui";
import { MessagesSquare, MessageSquareQuote } from "lucide-react";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
  MessageReferenceChip,
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
            <MessageMarkdown>
              <p>
                Finish task{" "}
                <TaskChip
                  status="todo"
                  render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
                >
                  #21
                </TaskChip>{" "}
                before replying in{" "}
                <MessageReferenceChip
                  tone="info"
                  render={<a href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread} />}
                >
                  <MessagesSquare size={12} />
                  release-notes · reply
                </MessageReferenceChip>
                .
              </p>
            </MessageMarkdown>
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
              tone="neutral"
              render={
                <a
                  href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                  title="Jump to state-ownership-migration-notes.md · § Ownership boundary"
                />
              }
            >
              <MessageSquareQuote size={12} />
              <span>re: state-ownership-migration-notes.md · § Ownership boundary</span>
            </MessageReferenceChip>
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
