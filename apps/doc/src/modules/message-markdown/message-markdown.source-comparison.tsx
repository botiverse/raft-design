import { Avatar } from "raft-ui";
import {
  MessageCodeBlock,
  MessageInlineCode,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
} from "raft-ui/wip";

export function MessageMarkdownComparisonComposition() {
  return (
    <div className="w-full max-w-xl">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent" />
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:18 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageMarkdown>
              <p>
                The current renderer keeps <strong>bold</strong>, <em>emphasis</em>, and{" "}
                <MessageInlineCode>inline code</MessageInlineCode> inside the message row.
              </p>
              <blockquote>Markdown remains bounded by the message content column.</blockquote>
              <MessageCodeBlock>
                <code>{"const theme = 'brutal';"}</code>
              </MessageCodeBlock>
            </MessageMarkdown>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
