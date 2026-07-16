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
  ThreadPanelActions,
  ThreadPanelBody,
  ThreadPanelContent,
  ThreadPanelFooter,
  ThreadPanelHeader,
  ThreadPanelOriginalMessage,
  ThreadPanelReplyCount,
  ThreadPanelRoot,
  ThreadPanelSearch,
  ThreadPanelSearchCount,
  ThreadPanelSearchIcon,
  ThreadPanelSearchInput,
  ThreadPanelTitle,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSearchMatch,
  MessageItemSender,
  MessageItemTime,
  MessageList,
  MessageListDateDivider,
  MessageListNotice,
  PanelAction,
} from "raft-ui/wip";

type ThreadPanelState = "default" | "empty" | "loading";

interface ThreadPanelCompositionProps {
  state?: ThreadPanelState;
  search?: boolean;
}

function ThreadSearchRow() {
  return (
    <ThreadPanelSearch>
      <ThreadPanelSearchIcon render={<Search />} />
      <ThreadPanelSearchInput
        aria-label="Search in thread"
        placeholder="Search in thread"
        readOnly
        value="chrome"
      />
      <ThreadPanelSearchCount>1/2</ThreadPanelSearchCount>
      <PanelAction aria-label="Previous match">
        <ChevronUp />
      </PanelAction>
      <PanelAction aria-label="Next match">
        <ChevronDown />
      </PanelAction>
      <PanelAction aria-label="Close thread search">
        <X />
      </PanelAction>
    </ThreadPanelSearch>
  );
}

function ThreadReplies() {
  return (
    <>
      <div className="px-3 pt-2">
        <MessageListNotice>Beginning of replies</MessageListNotice>
        <ThreadPanelReplyCount>12 replies</ThreadPanelReplyCount>
      </div>
      <MessageListDateDivider>Today</MessageListDateDivider>
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
      {Array.from({ length: 10 }, (_, index) => (
        <div key={`thread-overflow-${index}`} className="px-3">
          <MessageItem>
            <MessageItemAvatarSlot>
              <Avatar size="md" type={index % 2 === 0 ? "human" : "agent"} />
            </MessageItemAvatarSlot>
            <MessageItemContent>
              <MessageItemHeader>
                <MessageItemSender>{index % 2 === 0 ? "Cindy" : "Atlas"}</MessageItemSender>
                <MessageItemTime>10:{12 + index}</MessageItemTime>
              </MessageItemHeader>
              <MessageItemBody>
                Thread replies continue behind the floating composer while the body remains the only
                scroll owner.
              </MessageItemBody>
            </MessageItemContent>
          </MessageItem>
        </div>
      ))}
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

export function ThreadPanelComposition({
  state = "default",
  search = state === "default",
}: ThreadPanelCompositionProps = {}) {
  return (
    <ThreadPanelRoot>
      <ThreadPanelHeader>
        <ThreadPanelTitle>Thread</ThreadPanelTitle>
        <ThreadPanelActions>
          <PanelAction aria-label="Close thread">
            <X />
          </PanelAction>
        </ThreadPanelActions>
      </ThreadPanelHeader>
      <ThreadPanelContent>
        {search ? <ThreadSearchRow /> : null}
        <ThreadPanelOriginalMessage render={<MessageItem />}>
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
        </ThreadPanelOriginalMessage>
        <ThreadPanelBody>
          <MessageList>
            {state === "empty" ? (
              <ThreadEmpty />
            ) : state === "loading" ? (
              <ThreadLoading />
            ) : (
              <ThreadReplies />
            )}
          </MessageList>
        </ThreadPanelBody>
        <ThreadPanelFooter>Reply composer slot</ThreadPanelFooter>
      </ThreadPanelContent>
    </ThreadPanelRoot>
  );
}
