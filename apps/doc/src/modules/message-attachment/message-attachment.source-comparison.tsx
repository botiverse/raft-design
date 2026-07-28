import { Avatar, AvatarFallback } from "raft-ui";
import {
  MessageAttachmentGroup,
  MessageItem,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

import { MessageFileAttachmentComposition } from "./compositions/file-attachments.composition.tsx";

export function MessageAttachmentComparisonComposition() {
  return (
    <div className="w-full max-w-xl">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>App Planner</MessageItemSender>
            <MessageItemTime>3:04 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Here is the source parity pass.</MessageItemBody>
          <MessageItemAttachments>
            <MessageAttachmentGroup>
              <MessageFileAttachmentComposition />
            </MessageAttachmentGroup>
          </MessageItemAttachments>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
