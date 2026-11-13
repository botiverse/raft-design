import { ArrowUpRight, Ellipsis } from "lucide-react";
import { useCallback, useId, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemLabel,
  DropdownMenuTrigger,
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
  AppLinkCardBadge,
  AppLinkCardBody,
  AppLinkCardEyebrow,
  AppLinkCardHeader,
  AppLinkCardHost,
  AppLinkCardIcon,
  AppLinkCardMeta,
  AppLinkCardName,
  AppLinkCardTitle,
  DropdownMenuLinkItem,
  MessageReferenceIcon,
} from "@botiverse/raft-ui/wip";

// Two answers with a block card. The first lists `inline` as well: the link
// is a chip in the sentence, with no hover card (the answer lists none), and
// the card follows the paragraph. The second lists only the block card: the
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
                  <a href="#stamp-pull-10451" target="_blank" rel="noopener noreferrer">
                    #10451 test(i18n): cover the zh-CN fallback when the locale cookie is missing
                  </a>
                </AppLinkCardTitle>
                <AppLinkCardMeta>
                  <AppLinkCardBadge>{approved ? "Approved" : "Review requested"}</AppLinkCardBadge>
                  <span>Jasper · +112 −8</span>
                </AppLinkCardMeta>
              </AppLinkCardBody>
              <AppLinkCardActions>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-md" aria-label="More" />}
                  >
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLinkItem
                      href="#stamp-pull-10451"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <DropdownMenuItemLabel>Open in Stamp</DropdownMenuItemLabel>
                      <ArrowUpRight role="img" aria-label="(opens in a new tab)" />
                    </DropdownMenuLinkItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  render={
                    <a href="#stamp-pull-10451-files" target="_blank" rel="noopener noreferrer" />
                  }
                >
                  View changes
                  <ArrowUpRight
                    data-icon="inline-end"
                    role="img"
                    aria-label="(opens in a new tab)"
                  />
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
                  <a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer">
                    #10449 refactor(i18n): one display-locale source for web and desktop
                  </a>
                </AppLinkCardTitle>
                <AppLinkCardMeta>
                  <AppLinkCardBadge>Merged</AppLinkCardBadge>
                  <span>Martin · +803 −498</span>
                </AppLinkCardMeta>
              </AppLinkCardBody>
              <AppLinkCardActions>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-md" aria-label="More" />}
                  >
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLinkItem
                      href="#stamp-pull-10449"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <DropdownMenuItemLabel>Open in Stamp</DropdownMenuItemLabel>
                      <ArrowUpRight role="img" aria-label="(opens in a new tab)" />
                    </DropdownMenuLinkItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </AppLinkCardActions>
            </AppLinkCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
