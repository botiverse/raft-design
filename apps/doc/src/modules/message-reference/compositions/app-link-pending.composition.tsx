import { Link as LinkIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  MarkdownParagraph,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
  MessageReferenceLabel,
  MessageReferencePending,
} from "@botiverse/raft-ui";

// Before the app's preview arrives, each link is a gray chip with its address
// shortened to host and path, capped at the same width as the chip that
// replaces it.
export function MessageReferenceAppLinkPendingComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Martin</MessageItemSender>
            </MessageItemSenderGroup>
            <MessageItemTime dateTime="2026-10-22T14:32:00Z">2:32 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MarkdownParagraph>
              修复拆成了三个 PR：
              <MessageReferencePending capped>
                <LinkIcon />
                <MessageReferenceLabel>
                  stamp.build/botiverse/slock/pull/10449
                </MessageReferenceLabel>
              </MessageReferencePending>{" "}
              先把 display-locale 收成一个来源，
              <MessageReferencePending capped>
                <LinkIcon />
                <MessageReferenceLabel>
                  stamp.build/botiverse/slock/pull/10451
                </MessageReferenceLabel>
              </MessageReferencePending>{" "}
              补上回退测试，
              <MessageReferencePending capped>
                <LinkIcon />
                <MessageReferenceLabel>
                  stamp.build/botiverse/slock/pull/10437
                </MessageReferenceLabel>
              </MessageReferencePending>{" "}
              已关闭。
            </MarkdownParagraph>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
