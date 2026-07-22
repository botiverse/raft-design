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
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbarLabel,
} from "raft-ui";
import {
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
import {
  Composer,
  ComposerInput,
  ComposerToolbar,
} from "#/modules/chat-composer/composer-responsive.tsx";

interface ThreadPanelCompositionProps {
  search?: boolean;
}

function MessageRowToolbar() {
  return (
    <MessageItemToolbar>
      <MessageItemToolbarButton aria-label="Reply in thread" disabled>
        <MessageSquare />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Add reaction" disabled>
        <SmilePlus />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Save message" disabled>
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
          <PanelAction aria-label="Previous match" disabled>
            <ChevronUp />
          </PanelAction>
          <PanelAction aria-label="Next match" disabled>
            <ChevronDown />
          </PanelAction>
          <PanelAction aria-label="Close thread search" disabled>
            <X />
          </PanelAction>
        </ThreadPanelActions>
      </ThreadPanelSearchTrailing>
    </ThreadPanelSearch>
  );
}

const THREAD_REPLIES = [
  {
    sender: "Cindy",
    type: "human" as const,
    time: "10:09",
    body: "SideThreadColumn owns persisted width and desktop resize chrome.",
  },
  {
    sender: "Atlas",
    type: "agent" as const,
    time: "10:11",
    body: "ThreadPanel now owns the right-panel header, body, action, and footer chrome.",
  },
  {
    sender: "Noah",
    type: "human" as const,
    time: "10:14",
    body: "Keep the original message pinned above the scroll body so context stays visible.",
  },
  {
    sender: "Atlas",
    type: "agent" as const,
    time: "10:16",
    body: "Agreed. Replies should scroll independently from the header search and composer footer.",
  },
  {
    sender: "Mia",
    type: "human" as const,
    time: "10:19",
    body: "Can we verify scrollbar fade-in while scrolling through a longer reply stack?",
  },
  {
    sender: "Cindy",
    type: "human" as const,
    time: "10:21",
    body: "Yes — add enough messages that the MessageList viewport overflows at the docs preview height.",
  },
  {
    sender: "Atlas",
    type: "agent" as const,
    time: "10:23",
    body: "Desktop uses ScrollArea; mobile keeps native PanelScrollViewport. Both need overflow to exercise.",
  },
  {
    sender: "Noah",
    type: "human" as const,
    time: "10:26",
    body: "Also check elegant bottom clearance so the last reply is not hidden behind the composer.",
  },
  {
    sender: "Mia",
    type: "human" as const,
    time: "10:28",
    body: "Scrolling to the end should leave a comfortable gap above the footer on elegant.",
  },
  {
    sender: "Atlas",
    type: "agent" as const,
    time: "10:30",
    body: "That clearance comes from the message-list content recipe on elegant only.",
  },
] as const;

function ThreadReplies() {
  return (
    <>
      <div className="px-3 pt-2">
        <MessageListNotice>Beginning of replies</MessageListNotice>
        <ThreadPanelReplyCount>{THREAD_REPLIES.length} replies</ThreadPanelReplyCount>
      </div>
      <MessageListDateDivider>Today</MessageListDateDivider>
      {THREAD_REPLIES.map((reply) => (
        <MessageItem key={`${reply.sender}-${reply.time}`}>
          <MessageItemAvatarSlot>
            <Avatar size="md" type={reply.type} />
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>{reply.sender}</MessageItemSender>
              <MessageItemTime>{reply.time}</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>{reply.body}</MessageItemBody>
          </MessageItemContent>
          <MessageRowToolbar />
        </MessageItem>
      ))}
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
          disabled
        >
          <ChevronLeft aria-hidden />
        </Button>
        <ThreadPanelTitle>
          Thread
          <ThreadPanelTitleMeta> — #acme-design</ThreadPanelTitleMeta>
        </ThreadPanelTitle>
        <ThreadPanelActions>
          <PanelAction aria-label="Search in thread" disabled>
            <Search />
          </PanelAction>
          <PanelAction aria-label="View in channel" disabled>
            <ExternalLink />
            <span className="hidden whitespace-nowrap font-medium leading-none md:inline">
              View in channel
            </span>
          </PanelAction>
          <PanelAction className="max-lg:hidden" aria-label="Close thread" disabled>
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
                    <Checkbox size="sm" aria-label="Send as task" disabled />
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
