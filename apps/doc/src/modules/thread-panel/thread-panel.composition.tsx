import {
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ExternalLink,
  ImagePlus,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  SmilePlus,
  X,
} from "lucide-react";
import {
  Avatar,
  Button,
  Checkbox,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
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
  ThreadPanelSearchTrailing,
  ThreadPanelTitle,
  ThreadPanelTitleMeta,
} from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  ComposerToolbarLabel,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageList,
  MessageListDateDivider,
  MessageListNotice,
  PanelAction,
} from "raft-ui/wip";

interface ThreadPanelCompositionProps {
  search?: boolean;
}

function MessageRowToolbar() {
  return (
    <MessageItemToolbar>
      <MessageItemToolbarButton aria-label="Reply in thread">
        <MessageSquare />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Add reaction">
        <SmilePlus />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Save message">
        <Bookmark />
      </MessageItemToolbarButton>
    </MessageItemToolbar>
  );
}

function ThreadSearchRow() {
  return (
    <ThreadPanelSearch>
      <InputGroup className="w-full max-w-[320px]">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search this thread"
          placeholder="Search this thread"
          readOnly
          value="chrome"
        />
      </InputGroup>
      <ThreadPanelSearchTrailing>
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
      </ThreadPanelSearchTrailing>
    </ThreadPanelSearch>
  );
}

function ThreadReplies() {
  return (
    <>
      <div className="px-3 pt-2">
        <MessageListNotice>Beginning of replies</MessageListNotice>
        <ThreadPanelReplyCount>2 replies</ThreadPanelReplyCount>
      </div>
      <MessageListDateDivider>Today</MessageListDateDivider>
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
        <MessageRowToolbar />
      </MessageItem>
      <MessageItem>
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
        <MessageRowToolbar />
      </MessageItem>
      <div className="h-6" aria-hidden />
    </>
  );
}

export function ThreadPanelComposition({ search = true }: ThreadPanelCompositionProps = {}) {
  return (
    <ThreadPanelRoot>
      <ThreadPanelHeader>
        <Button
          className="mr-1 lg:hidden"
          variant="outline"
          size="icon-sm"
          aria-label="Back to channel"
        >
          <ChevronLeft aria-hidden />
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
            <span className="hidden whitespace-nowrap font-medium leading-none md:inline">
              View in channel
            </span>
          </PanelAction>
          <PanelAction className="max-lg:hidden" aria-label="Close thread">
            <X />
          </PanelAction>
        </ThreadPanelActions>
      </ThreadPanelHeader>
      <ThreadPanelContent>
        {search ? <ThreadSearchRow /> : null}
        <ThreadPanelOriginalMessage>
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
            <MessageRowToolbar />
          </MessageItem>
        </ThreadPanelOriginalMessage>
        <ThreadPanelBody>
          <MessageList>
            <ThreadReplies />
          </MessageList>
        </ThreadPanelBody>
        <ThreadPanelFooter>
          <ComposerRoot onSubmit={(event) => event.preventDefault()}>
            <Composer>
              <ComposerInput aria-label="Message thread" placeholder="Message thread" readOnly />
              <ComposerToolbar>
                <ComposerActions>
                  <ComposerIconButton aria-label="Attach image" disabled>
                    <ImagePlus />
                  </ComposerIconButton>
                  <ComposerIconButton aria-label="Attach file" disabled>
                    <Paperclip />
                  </ComposerIconButton>
                </ComposerActions>
                <ComposerMeta>
                  <ComposerToolbarLabel>
                    <Checkbox size="sm" aria-label="Send as task" />
                    As Task
                  </ComposerToolbarLabel>
                  <ComposerSubmit aria-label="Send" disabled>
                    <span>Send</span>
                    <Send />
                  </ComposerSubmit>
                </ComposerMeta>
              </ComposerToolbar>
            </Composer>
          </ComposerRoot>
        </ThreadPanelFooter>
      </ThreadPanelContent>
    </ThreadPanelRoot>
  );
}
