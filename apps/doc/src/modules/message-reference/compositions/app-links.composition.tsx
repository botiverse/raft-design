import {
  Avatar,
  AvatarFallback,
  MarkdownParagraph,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferenceText,
} from "@botiverse/raft-ui";
import { MessageReferenceIcon } from "@botiverse/raft-ui/wip";

// Links an app (Stamp) previews, in a message: each is a cyan chip in the
// sentence with the app's registered icon and the app's own title, capped
// and truncated. A message that is only a link is the same chip.
export function MessageReferenceAppLinksComposition() {
  const stampIcon = (
    <MessageReferenceIcon>
      <img src="/app-icons/stamp.svg" alt="" />
    </MessageReferenceIcon>
  );
  const first = (
    <MessageReferenceChip
      variant="info"
      capped
      render={<a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer" />}
    >
      {stampIcon}
      <MessageReferenceLabel>
        refactor(i18n): one display-locale source for web and desktop
      </MessageReferenceLabel>
    </MessageReferenceChip>
  );
  const second = (
    <MessageReferenceChip
      variant="info"
      capped
      render={<a href="#stamp-pull-10451" target="_blank" rel="noopener noreferrer" />}
    >
      {stampIcon}
      <MessageReferenceLabel>test(i18n): cover the zh-CN fallback</MessageReferenceLabel>
    </MessageReferenceChip>
  );
  const third = (
    <MessageReferenceChip
      variant="info"
      capped
      render={<a href="#stamp-pull-10437" target="_blank" rel="noopener noreferrer" />}
    >
      {stampIcon}
      <MessageReferenceLabel>
        fix(i18n): read the locale cookie before the Accept-Language header
      </MessageReferenceLabel>
    </MessageReferenceChip>
  );

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
              一次事故：合并时把 staging
              的显示语言回退覆盖掉了，中文用户看到的全是英文。修复拆成了三个 PR：{first} 先把
              display-locale 收成一个来源，{second} 补上回退测试，{third} 已关闭，改动并进了第一个。
              <MessageReferenceText render={<a href="#agent-bugen" />}>
                @Bugen
              </MessageReferenceText>{" "}
              can you review the second one today?
            </MarkdownParagraph>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem compact>
        <MessageItemGutter>
          <MessageItemContinuationTime dateTime="2026-10-22T14:33:00Z">
            2:33
          </MessageItemContinuationTime>
        </MessageItemGutter>
        <MessageItemContent>
          <MessageItemBody>
            <MarkdownParagraph>{first}</MarkdownParagraph>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
