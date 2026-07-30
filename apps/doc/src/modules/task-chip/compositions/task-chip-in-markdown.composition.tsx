import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MarkdownParagraph,
  TaskChip,
  TaskClosedIcon,
  TaskDoneIcon,
  TaskInProgressIcon,
  TaskInReviewIcon,
  TaskTodoIcon,
} from "raft-ui";
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
              variant="inline"
              status="todo"
              render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
            >
              <TaskTodoIcon />
              #16
            </TaskChip>
            , continue{" "}
            <TaskChip
              variant="inline"
              status="in-progress"
              render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
            >
              <TaskInProgressIcon />
              #205
            </TaskChip>
            , then close{" "}
            <TaskChip
              variant="inline"
              status="done"
              render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
            >
              <TaskDoneIcon />
              #47
            </TaskChip>{" "}
            and archive{" "}
            <TaskChip
              variant="inline"
              status="closed"
              render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
            >
              <TaskClosedIcon />
              #480
            </TaskChip>
            . Resolving{" "}
            <TaskChip variant="inline" status="in-review" loading title="Resolving task #340">
              <TaskInReviewIcon />
              #340
            </TaskChip>
            .
          </MarkdownParagraph>
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
