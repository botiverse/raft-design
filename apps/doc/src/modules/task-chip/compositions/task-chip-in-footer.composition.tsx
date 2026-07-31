import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
  MessageItemFooter,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function TaskChipInFooterComposition() {
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
          <MessageItemTime>2:23 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Split the ownership boundary work so the migration notes stay reviewable.
        </MessageItemBody>
        <MessageItemFooter>
          <TaskChip status="todo" title="task #16 @Cuvii · Todo">
            <TaskTodoIcon />
            <span className="shrink-0">#16</span>
            <span className="min-w-0 truncate">@Cuvii</span>
          </TaskChip>
          <TaskChip status="in-progress" title="task #205 @Noah · In Progress">
            <TaskInProgressIcon />
            <span className="shrink-0">#205</span>
            <span className="min-w-0 truncate">@Noah</span>
          </TaskChip>
          <TaskChip status="in-review" title="task #340 @Ada · In Review">
            <TaskInReviewIcon />
            <span className="shrink-0">#340</span>
            <span className="min-w-0 truncate">@Ada</span>
          </TaskChip>
          <TaskChip status="done" title="task #47 @Atlas · Done">
            <TaskDoneIcon />
            <span className="shrink-0">#47</span>
            <span className="min-w-0 truncate">@Atlas</span>
          </TaskChip>
          <TaskChip status="closed" title="task #480 · Closed">
            <TaskClosedIcon />
            <span className="shrink-0">#480</span>
          </TaskChip>
          <TaskChip status="in-progress" loading title="Resolving task #512">
            <TaskInProgressIcon />
            <span className="shrink-0">#512</span>
          </TaskChip>
        </MessageItemFooter>
      </MessageItemContent>
    </MessageItem>
  );
}
