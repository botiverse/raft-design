import { ChevronDown, ChevronUp, MessageSquare, Search, X } from "lucide-react";
import {
  Avatar,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Spinner,
} from "raft-ui";
import {
  ChatThreadPanelActions,
  ChatThreadPanelBody,
  ChatThreadPanelContent,
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
  ChatPanelAction,
} from "raft-ui/wip";

type ChatThreadPanelState = "default" | "empty" | "loading";

interface ChatThreadPanelCompositionProps {
  state?: ChatThreadPanelState;
  search?: boolean;
}

function ThreadSearchRow() {
  return (
    <ChatThreadPanelSearch>
      <ChatThreadPanelSearchIcon render={<Search />} />
      <ChatThreadPanelSearchInput
        aria-label="Search in thread"
        placeholder="Search in thread"
        readOnly
        value="chrome"
      />
      <ChatThreadPanelSearchCount>1/2</ChatThreadPanelSearchCount>
      <ChatPanelAction aria-label="Previous match">
        <ChevronUp />
      </ChatPanelAction>
      <ChatPanelAction aria-label="Next match">
        <ChevronDown />
      </ChatPanelAction>
      <ChatPanelAction aria-label="Close thread search">
        <X />
      </ChatPanelAction>
    </ChatThreadPanelSearch>
  );
}

function ThreadReplies() {
  return (
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
  );
}

function ThreadEmpty() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10">
      <EmptyState>
        <EmptyStateContent>
          <EmptyStateIcon>
            <MessageSquare />
          </EmptyStateIcon>
          <EmptyStateTitle>No replies yet</EmptyStateTitle>
          <EmptyStateDescription>
            Start the conversation by replying in this thread.
          </EmptyStateDescription>
        </EmptyStateContent>
      </EmptyState>
    </div>
  );
}

function ThreadLoading() {
  return (
    <div
      role="status"
      className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-10"
    >
      <Spinner />
      <span className="font-mono text-xs text-foreground-muted">Loading replies…</span>
    </div>
  );
}

export function ChatThreadPanelComposition({
  state = "default",
  search = state === "default",
}: ChatThreadPanelCompositionProps = {}) {
  return (
    <ChatThreadPanelRoot>
      <ChatThreadPanelHeader>
        <ChatThreadPanelTitle>Thread</ChatThreadPanelTitle>
        <ChatThreadPanelActions>
          <ChatPanelAction aria-label="Close thread">
            <X />
          </ChatPanelAction>
        </ChatThreadPanelActions>
      </ChatThreadPanelHeader>
      <ChatThreadPanelContent>
        {search ? <ThreadSearchRow /> : null}
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
        <ChatThreadPanelBody>
          {state === "empty" ? (
            <ThreadEmpty />
          ) : state === "loading" ? (
            <ThreadLoading />
          ) : (
            <ThreadReplies />
          )}
        </ChatThreadPanelBody>
        <ChatThreadPanelFooter>Reply composer slot</ChatThreadPanelFooter>
      </ChatThreadPanelContent>
    </ChatThreadPanelRoot>
  );
}
