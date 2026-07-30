import { Avatar, AvatarFallback, AvatarImage, MarkdownParagraph, TaskChip } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";

export function TaskChipInMarkdownComposition() {
  return (
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
          <MessageItemTime>2:22 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <MarkdownParagraph>
            Pick up{" "}
            <TaskChip
              variant="message"
              status="todo"
              render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
            >
              #16
            </TaskChip>
            , continue{" "}
            <TaskChip
              variant="message"
              status="in_progress"
              render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
            >
              #205
            </TaskChip>
            , then close{" "}
            <TaskChip
              variant="message"
              status="done"
              render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
            >
              #47
            </TaskChip>{" "}
            and archive{" "}
            <TaskChip
              variant="message"
              status="closed"
              render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
            >
              #480
            </TaskChip>
            . Resolving{" "}
            <TaskChip variant="message" status="in_review" loading title="Resolving task #340">
              #340
            </TaskChip>
            .
          </MarkdownParagraph>
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
