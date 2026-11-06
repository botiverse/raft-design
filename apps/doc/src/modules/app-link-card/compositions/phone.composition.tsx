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
  MessageItemHeader,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
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
} from "@botiverse/raft-ui/wip";

// A phone's message column. The answer lists only the block card, so the
// link stays the author's plain link and the card follows its paragraph: it
// takes the message's width, and its buttons are tapped right there.
export function AppLinkCardPhoneComposition() {
  const titleId = useId();
  const [approved, setApproved] = useState(false);
  const handleApprove = useCallback(() => setApproved(true), []);

  return (
    <div className="mx-auto flex w-full max-w-[375px] flex-col">
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
              Could someone approve this before the release?{" "}
              <MarkdownLink href="#stamp-pull-10451" target="_blank" rel="noopener noreferrer">
                https://stamp.build/botiverse/slock/pull/10451
              </MarkdownLink>
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
                </Button>
                <Button variant="outline" disabled={approved} onClick={handleApprove}>
                  Approve
                </Button>
              </AppLinkCardActions>
            </AppLinkCard>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
