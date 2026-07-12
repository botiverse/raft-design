import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "raft-ui";
import {
  ChatThreadPanelActions,
  ChatThreadPanelBody,
  ChatThreadPanelFooter,
  ChatThreadPanelHeader,
  ChatThreadPanelParent,
  ChatThreadPanelReplyCount,
  ChatThreadPanelRoot,
  ChatThreadPanelSearch,
  ChatThreadPanelSearchCount,
  ChatThreadPanelSearchIcon,
  ChatThreadPanelSearchInput,
  ChatThreadPanelTitle,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSearchMatch,
  MessageItemSender,
  MessageItemTime,
  MessageTimelineDateDivider,
  MessageTimelineNotice,
  PanelButton,
  PanelButtonIcon,
} from "raft-ui/wip";

interface ChatThreadPanelCompositionShellProps {
  children: ReactNode;
  search?: ReactNode;
}

export function ChatThreadPanelCompositionShell({
  children,
  search,
}: ChatThreadPanelCompositionShellProps) {
  return (
    <ChatThreadPanelRoot>
      <ChatThreadPanelHeader>
        <ChatThreadPanelTitle>Thread</ChatThreadPanelTitle>
        <ChatThreadPanelActions>
          <PanelButton aria-label="Close thread">
            <PanelButtonIcon>
              <X />
            </PanelButtonIcon>
          </PanelButton>
        </ChatThreadPanelActions>
      </ChatThreadPanelHeader>
      {search}
      <ChatThreadPanelParent>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human" />
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Cindy</MessageItemSender>
              <MessageItemTime>10:08</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>Should ThreadPanel own the right-panel chrome?</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </ChatThreadPanelParent>
      <ChatThreadPanelBody>{children}</ChatThreadPanelBody>
      <ChatThreadPanelFooter>Reply composer slot</ChatThreadPanelFooter>
    </ChatThreadPanelRoot>
  );
}

export function ChatThreadPanelComposition() {
  return (
    <ChatThreadPanelCompositionShell
      search={
        <ChatThreadPanelSearch>
          <ChatThreadPanelSearchIcon render={<Search />} />
          <ChatThreadPanelSearchInput
            aria-label="Search in thread"
            placeholder="Search in thread"
            readOnly
            value="chrome"
          />
          <ChatThreadPanelSearchCount>1/2</ChatThreadPanelSearchCount>
          <PanelButton aria-label="Previous match">
            <PanelButtonIcon>
              <ChevronUp />
            </PanelButtonIcon>
          </PanelButton>
          <PanelButton aria-label="Next match">
            <PanelButtonIcon>
              <ChevronDown />
            </PanelButtonIcon>
          </PanelButton>
          <PanelButton aria-label="Close thread search">
            <PanelButtonIcon>
              <X />
            </PanelButtonIcon>
          </PanelButton>
        </ChatThreadPanelSearch>
      }
    >
      <>
        <div className="px-3 pt-2">
          <MessageTimelineNotice>Beginning of replies</MessageTimelineNotice>
          <ChatThreadPanelReplyCount>2 replies</ChatThreadPanelReplyCount>
        </div>
        <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>
        <div className="px-3">
          <MessageItem>
            <MessageItemAvatarSlot>
              <Avatar size="md" type="human" />
            </MessageItemAvatarSlot>
            <MessageItemContent>
              <MessageItemHeader>
                <MessageItemSender>Cindy</MessageItemSender>
                <MessageItemTime>10:09</MessageItemTime>
              </MessageItemHeader>
              <MessageItemBody>
                SideThreadColumn owns persisted width and desktop resize chrome.
              </MessageItemBody>
            </MessageItemContent>
          </MessageItem>
        </div>
        <div className="px-3">
          <MessageItemSearchMatch>
            <MessageItemAvatarSlot>
              <Avatar size="md" type="agent" />
            </MessageItemAvatarSlot>
            <MessageItemContent>
              <MessageItemHeader>
                <MessageItemSender>Atlas</MessageItemSender>
                <MessageItemTime>10:11</MessageItemTime>
              </MessageItemHeader>
              <MessageItemBody>
                ThreadPanel now owns the right-panel header, body, action, and footer chrome.
              </MessageItemBody>
            </MessageItemContent>
          </MessageItemSearchMatch>
        </div>
        <div className="h-6" aria-hidden />
      </>
    </ChatThreadPanelCompositionShell>
  );
}
