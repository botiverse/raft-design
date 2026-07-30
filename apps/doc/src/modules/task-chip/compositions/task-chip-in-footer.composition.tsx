import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  TaskChip,
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
            <span className="shrink-0">#16</span>
            <span className="min-w-0 truncate">@Cuvii</span>
          </TaskChip>
          <TaskChip status="in_progress" title="task #205 @Noah · In Progress">
            <span className="shrink-0">#205</span>
            <span className="min-w-0 truncate">@Noah</span>
          </TaskChip>
          <TaskChip status="in_review" title="task #340 @Ada · In Review">
            <span className="shrink-0">#340</span>
            <span className="min-w-0 truncate">@Ada</span>
          </TaskChip>
          <TaskChip status="done" title="task #47 @Atlas · Done">
            <span className="shrink-0">#47</span>
            <span className="min-w-0 truncate">@Atlas</span>
          </TaskChip>
          <TaskChip status="closed" title="task #480 · Closed">
            <span className="shrink-0">#480</span>
          </TaskChip>
          <TaskChip status="in_progress" loading title="Resolving task #512">
            <span className="shrink-0">#512</span>
          </TaskChip>
        </MessageItemFooter>
      </MessageItemContent>
    </MessageItem>
  );
}
