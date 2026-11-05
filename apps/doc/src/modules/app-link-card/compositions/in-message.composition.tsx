import { useCallback, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
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

// The first message links a pull request inside a sentence: its chip stays in
// the sentence, opens no hover card (the card is right below it), and the card
// follows the paragraph. The second message is only a link: the card takes its
// place.
export function AppLinkCardInMessageComposition() {
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
            <AppLinkCard>
              <AppLinkCardHeader>
                <AppLinkCardIcon>
                  <img src="/app-icons/stamp.svg" alt="" />
                </AppLinkCardIcon>
                <AppLinkCardName>Stamp</AppLinkCardName>
                <AppLinkCardHost>stamp.build</AppLinkCardHost>
              </AppLinkCardHeader>
              <AppLinkCardBody>
                <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
                <AppLinkCardTitle>
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
            <AppLinkCard>
              <AppLinkCardHeader>
                <AppLinkCardIcon>
                  <img src="/app-icons/stamp.svg" alt="" />
                </AppLinkCardIcon>
                <AppLinkCardName>Stamp</AppLinkCardName>
                <AppLinkCardHost>stamp.build</AppLinkCardHost>
              </AppLinkCardHeader>
              <AppLinkCardBody>
                <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
                <AppLinkCardTitle>
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
