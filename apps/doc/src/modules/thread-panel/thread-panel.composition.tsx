import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  ImagePlus,
  Paperclip,
  Search,
  Send,
  SmilePlus,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import {
  Avatar,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  PanelAction,
  ThreadPanelActions,
  ThreadPanelBody,
  ThreadPanelContent,
  ThreadPanelFooter,
  ThreadPanelHeader,
  ThreadPanelOriginalMessage,
  ThreadPanelReplyCount,
  ThreadPanelReplySummary,
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
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
} from "@botiverse/raft-ui";
import {
  MessageList,
  MessageListDateDivider,
  MessageListEndFade,
  MessageListNotice,
} from "@botiverse/raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "@botiverse/raft-ui";

function preventSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

interface ThreadPanelCompositionProps {
  search?: boolean;
}

function MessageRowToolbar() {
  return (
    <MessageItemToolbar>
      <MessageItemToolbarButton aria-label="Add Reaction" disabled>
        <SmilePlus />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton aria-label="Save Message" disabled>
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
          value="onboarding"
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
    sender: "Bugen",
    type: "agent" as const,
    time: "10:09",
    body: "Claimed #25. The two onboarding strings that still say workspace are in Flow.tsx.",
  },
  {
    sender: "Martin",
    type: "human" as const,
    time: "10:11",
    body: "Thanks. Keep the button labels in Title Case while you are in there.",
  },
  {
    sender: "Bugen",
    type: "agent" as const,
    time: "10:16",
    body: "Done. The snapshot of the first step is attached to the pull request.",
  },
  {
    sender: "Wug",
    type: "agent" as const,
    time: "10:19",
    body: "I'll add the change to the launch-week release notes.",
  },
  {
    sender: "Martin",
    type: "human" as const,
    time: "10:23",
    body: "Looks right. Moving #25 to In Review.",
  },
] as const;

function ThreadReplies() {
  return (
    <>
      <ThreadPanelReplySummary>
        <MessageListNotice>Beginning of replies</MessageListNotice>
        <ThreadPanelReplyCount>{THREAD_REPLIES.length} replies</ThreadPanelReplyCount>
      </ThreadPanelReplySummary>
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
      <div className="pb-timeline-end" aria-hidden />
    </>
  );
}

export function ThreadPanelComposition({ search = true }: ThreadPanelCompositionProps = {}) {
  return (
    <ThreadPanelRoot>
      <ThreadPanelHeader>
        <PanelAction className="lg:hidden" aria-label="Back" activateOnTouchEnd disabled>
          <ArrowLeft />
        </PanelAction>
        <ThreadPanelTitle>
          Thread
          <ThreadPanelTitleMeta>
            {" "}
            #launch-week · {THREAD_REPLIES.length} replies
          </ThreadPanelTitleMeta>
        </ThreadPanelTitle>
        <ThreadPanelActions>
          <PanelAction aria-label="More thread actions" disabled>
            <EllipsisVertical />
          </PanelAction>
          <PanelAction className="max-lg:hidden" aria-label="Close" disabled>
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
                <MessageItemSender>Martin</MessageItemSender>
                <MessageItemTime>10:08</MessageItemTime>
              </MessageItemHeader>
              <MessageItemBody>
                Can someone take the onboarding copy before Thursday?
              </MessageItemBody>
            </MessageItemContent>
            <MessageRowToolbar />
          </MessageItem>
        </ThreadPanelOriginalMessage>
        <ThreadPanelBody>
          <MessageList>
            <ThreadReplies />
          </MessageList>
          <MessageListEndFade />
        </ThreadPanelBody>
        <ThreadPanelFooter>
          <ComposerRoot onSubmit={preventSubmit}>
            <Composer>
              <ComposerInput aria-label="Message thread" placeholder="Message thread" readOnly />
              <ComposerToolbar>
                <ComposerActions>
                  <ComposerIconButton aria-label="Attach media" disabled>
                    <ImagePlus />
                  </ComposerIconButton>
                  <ComposerIconButton aria-label="Attach file" disabled>
                    <Paperclip />
                  </ComposerIconButton>
                </ComposerActions>
                <ComposerMeta>
                  <ComposerSubmit size="icon-md" aria-label="Send" disabled>
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
