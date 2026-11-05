import { useCallback, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
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
  AppLinkCardBody,
  AppLinkCardEyebrow,
  AppLinkCardHeader,
  AppLinkCardHost,
  AppLinkCardIcon,
  AppLinkCardMeta,
  AppLinkCardName,
  AppLinkCardTitle,
} from "@botiverse/raft-ui/wip";

// A phone's message column: the card takes the message's width, and its
// buttons are tapped right there.
export function AppLinkCardPhoneComposition() {
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
    </div>
  );
}
