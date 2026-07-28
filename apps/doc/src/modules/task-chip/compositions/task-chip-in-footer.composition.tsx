import { Avatar, AvatarFallback, AvatarImage, TaskChip } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";
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
          <TaskChip status="in_progress" title="task #205 @Noah · In Progress">
            <span className="shrink-0">#205</span>
            <span className="min-w-0 truncate">@Noah</span>
          </TaskChip>
          <TaskChip status="in_review" title="task #340 @Ada · In Review">
            <span className="shrink-0">#340</span>
            <span className="min-w-0 truncate">@Ada</span>
          </TaskChip>
        </MessageItemFooter>
      </MessageItemContent>
    </MessageItem>
  );
}
