import { Avatar, AvatarFallback, AvatarImage, TaskChip } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
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
          <MessageMarkdown>
            <p>
              Continue task{" "}
              <TaskChip
                status="in_progress"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
              >
                #205
              </TaskChip>{" "}
              before closing{" "}
              <TaskChip
                status="closed"
                render={<a href={MESSAGE_PLAYGROUND_URLS.stateModelTask} />}
              >
                #480
              </TaskChip>
              .
            </p>
          </MessageMarkdown>
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
