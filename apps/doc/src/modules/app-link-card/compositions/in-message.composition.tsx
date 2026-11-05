import { useCallback, useId, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  MarkdownLink,
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
} from "@botiverse/raft-ui";
import {
  AppLinkCard,
  AppLinkCardActions,
  AppLinkCardBody,
  AppLinkCardEyebrow,
  AppLinkCardHeader,
  AppLinkCardHost,
  AppLinkCardIcon,
  AppLinkCardMeta,
  AppLinkCardName,
  AppLinkCardTitle,
  MessageReferenceIcon,
} from "@botiverse/raft-ui/wip";

// Two answers that ask for a block. The first also sends `inline`: the link is
// a chip in the sentence, opens no hover card (its card is right below it),
// and the card follows the paragraph. The second sends only the block: the
// link stays the author's plain link, alone in its paragraph, and the card
// follows it. Neither link moves or is replaced.
export function AppLinkCardInMessageComposition() {
  const titleId = useId();
  const secondTitleId = useId();
  const [approved, setApproved] = useState(false);
  const handleApprove = useCallback(() => setApproved(true), []);

  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>J</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Jasper</MessageItemSender>
            </MessageItemSenderGroup>
            <MessageItemTime dateTime="2026-11-05T09:12:00Z">9:12 AM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MarkdownParagraph>
              The fallback test is up in{" "}
              <MessageReferenceChip
                variant="info"
                capped
                render={<a href="#stamp-pull-10451" target="_blank" rel="noopener noreferrer" />}
              >
                <MessageReferenceIcon>
                  <img src="/app-icons/stamp.svg" alt="" />
                </MessageReferenceIcon>
                <MessageReferenceLabel>
                  #10451 test(i18n): cover the zh-CN fallback when the locale cookie is missing
                </MessageReferenceLabel>
              </MessageReferenceChip>
              , could someone approve it before the release?
            </MarkdownParagraph>
            <AppLinkCard aria-labelledby={titleId}>
              <AppLinkCardHeader>
                <AppLinkCardIcon>
                  <img src="/app-icons/stamp.svg" alt="" />
                </AppLinkCardIcon>
                <AppLinkCardName>Stamp</AppLinkCardName>
                <AppLinkCardHost>stamp.build</AppLinkCardHost>
              </AppLinkCardHeader>
              <AppLinkCardBody>
                <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
                <AppLinkCardTitle id={titleId}>
                  #10451 test(i18n): cover the zh-CN fallback when the locale cookie is missing
                </AppLinkCardTitle>
                <AppLinkCardMeta>
                  <Badge appearance="soft">{approved ? "Approved" : "Review requested"}</Badge>
                  <span>Jasper · +112 −8</span>
                </AppLinkCardMeta>
              </AppLinkCardBody>
              <AppLinkCardActions>
                <Button
                  variant="ghost"
                  render={
                    <a href="#stamp-pull-10451-files" target="_blank" rel="noopener noreferrer" />
                  }
                >
                  View changes
                </Button>
                <Button variant="outline" disabled={approved} onClick={handleApprove}>
                  Approve
                </Button>
              </AppLinkCardActions>
            </AppLinkCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem compact>
        <MessageItemGutter>
          <MessageItemContinuationTime dateTime="2026-11-05T09:13:00Z">
            9:13
          </MessageItemContinuationTime>
        </MessageItemGutter>
        <MessageItemContent>
          <MessageItemBody>
            <MarkdownParagraph>
              <MarkdownLink href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer">
                https://stamp.build/botiverse/slock/pull/10449
              </MarkdownLink>
            </MarkdownParagraph>
            <AppLinkCard aria-labelledby={secondTitleId}>
              <AppLinkCardHeader>
                <AppLinkCardIcon>
                  <img src="/app-icons/stamp.svg" alt="" />
                </AppLinkCardIcon>
                <AppLinkCardName>Stamp</AppLinkCardName>
                <AppLinkCardHost>stamp.build</AppLinkCardHost>
              </AppLinkCardHeader>
              <AppLinkCardBody>
                <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
                <AppLinkCardTitle id={secondTitleId}>
                  #10449 refactor(i18n): one display-locale source for web and desktop
                </AppLinkCardTitle>
                <AppLinkCardMeta>
                  <Badge appearance="soft">Merged</Badge>
                  <span>Martin · +803 −498</span>
                </AppLinkCardMeta>
              </AppLinkCardBody>
              <AppLinkCardActions>
                <Button
                  variant="outline"
                  render={<a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer" />}
                >
                  Open in Stamp
                </Button>
              </AppLinkCardActions>
            </AppLinkCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
