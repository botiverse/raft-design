import { CheckCheck } from "lucide-react";
import {
  Avatar,
  AvatarGroup,
  CodeBlock,
  CodeBlockBody,
  CodeBlockPre,
  MarkdownParagraph,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";
import { MessageItemTrailing } from "@botiverse/raft-ui/wip";

function ReadFaces({ label }: { label: string }) {
  return (
    <MessageItemTrailing className="gap-1">
      <CheckCheck aria-hidden className="size-3 text-foreground-hint" />
      <AvatarGroup role="img" aria-label={label}>
        <Avatar size="xs" type="agent" />
        <Avatar size="xs" type="agent" />
      </AvatarGroup>
    </MessageItemTrailing>
  );
}

export function MessageItemTrailingContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human" />
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Martin</MessageItemSender>
            <MessageItemTime>2:18 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MarkdownParagraph>Shipping the preview today.</MarkdownParagraph>
            <ReadFaces label="Wug and Atlas read up to here" />
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent" />
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Wug</MessageItemSender>
            <MessageItemTime>2:20 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MarkdownParagraph>The build passed; the command I ran:</MarkdownParagraph>
            <CodeBlock>
              <CodeBlockBody>
                <CodeBlockPre>pnpm exec vp run -r test</CodeBlockPre>
              </CodeBlockBody>
            </CodeBlock>
            <ReadFaces label="Bugen and Atlas read up to here" />
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
