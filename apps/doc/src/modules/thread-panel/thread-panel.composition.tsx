import { ChevronDown, ChevronLeft, ChevronUp, ExternalLink, Search, X } from "lucide-react";
import {
  Avatar,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  ThreadPanelActions,
  ThreadPanelBody,
  ThreadPanelContent,
  ThreadPanelHeader,
  ThreadPanelOriginalMessage,
  ThreadPanelReplyCount,
  ThreadPanelRoot,
  ThreadPanelSearch,
  ThreadPanelSearchCount,
  ThreadPanelTitle,
  ThreadPanelTitleMeta,
} from "raft-ui";
import {
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

interface ThreadPanelCompositionProps {
  search?: boolean;
}

function ThreadSearchRow() {
  return (
    <ThreadPanelSearch>
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search in thread"
          placeholder="Search in thread"
          readOnly
          value="chrome"
        />
      </InputGroup>
      <ThreadPanelSearchCount>1/2</ThreadPanelSearchCount>
      <ThreadPanelActions>
        <PanelAction aria-label="Previous match">
          <ChevronUp />
        </PanelAction>
        <PanelAction aria-label="Next match">
          <ChevronDown />
        </PanelAction>
        <PanelAction aria-label="Close thread search">
          <X />
        </PanelAction>
      </ThreadPanelActions>
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

export function ThreadPanelComposition({ search = true }: ThreadPanelCompositionProps = {}) {
  return (
    <ThreadPanelRoot>
      <ThreadPanelHeader>
        <Button variant="outline" size="icon-md" aria-label="Back to channel">
          <ChevronLeft />
        </Button>
        <ThreadPanelTitle>
          Thread
          <ThreadPanelTitleMeta> — #acme-design</ThreadPanelTitleMeta>
        </ThreadPanelTitle>
        <ThreadPanelActions>
          <PanelAction aria-label="Search in thread">
            <Search />
          </PanelAction>
          <PanelAction aria-label="View in channel">
            <ExternalLink />
            <span className="whitespace-nowrap font-medium leading-none">View in channel</span>
          </PanelAction>
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
            <ThreadReplies />
          </MessageList>
        </ThreadPanelBody>
      </ThreadPanelContent>
    </ThreadPanelRoot>
  );
}
