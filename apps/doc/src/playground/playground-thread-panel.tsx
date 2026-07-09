import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImagePlus,
  Paperclip,
  Search,
  Send,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  ChatMainPanelComposer,
  ChatMainPanelComposerActions,
  ChatMainPanelComposerIconButton,
  ChatMainPanelComposerInput,
  ChatMainPanelComposerMeta,
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerToolbar,
  ChatThreadPanelAction,
  ChatThreadPanelActions,
  ChatThreadPanelBody,
  ChatThreadPanelFooter,
  ChatThreadPanelHeader,
  ChatThreadPanelParent,
  ChatThreadPanelReplyCount,
  ChatThreadPanelRoot,
  ChatThreadPanelSearch,
  ChatThreadPanelSearchCount,
  ChatThreadPanelSearchInput,
  ChatThreadPanelTitle,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
  MessageTimelineNotice,
} from "raft-ui/wip";
import type { PlaygroundChannel, PlaygroundChannelId } from "./mock-data.ts";

type ThreadMessageFixture = {
  id: string;
  sender: string;
  /** Gray descriptor beside the sender: role for members, model for agents. */
  meta: string;
  time: string;
  body: string;
  type: "human" | "agent";
};

type ThreadFixture = {
  parent: ThreadMessageFixture;
  replyCount: string;
  replies: ThreadMessageFixture[];
};

const FULL_THREAD: ThreadFixture = {
  parent: {
    id: "parent",
    sender: "Cindy",
    meta: "member",
    time: "10:08 AM",
    body: "Should ThreadPanel own the right-panel chrome?",
    type: "human",
  },
  replyCount: "4 replies",
  replies: [
    {
      id: "reply-1",
      sender: "Atlas",
      meta: "claude-opus",
      time: "10:12 AM",
      body: "ThreadPanel now owns the right-panel header, body, action, and footer chrome.",
      type: "agent",
    },
    {
      id: "reply-2",
      sender: "Cindy",
      meta: "member",
      time: "10:15 AM",
      body: "SideThreadColumn keeps persisted width and desktop resize chrome, then?",
      type: "human",
    },
    {
      id: "reply-3",
      sender: "Atlas",
      meta: "claude-opus",
      time: "10:17 AM",
      body: "Exactly. Width, resize handles, and route sync stay app-owned.",
      type: "agent",
    },
    {
      id: "reply-4",
      sender: "Cindy",
      meta: "member",
      time: "10:21 AM",
      body: "Sold. I will move the close action into the header actions slot.",
      type: "human",
    },
  ],
};

const SHORT_THREAD: ThreadFixture = {
  parent: {
    id: "parent",
    sender: "Atlas",
    meta: "claude-opus",
    time: "9:41 AM",
    body: "Matrix run finished — two fixtures drifted from source.",
    type: "agent",
  },
  replyCount: "3 replies",
  replies: [
    {
      id: "reply-1",
      sender: "Cuvii",
      meta: "member",
      time: "9:44 AM",
      body: "Which ones? I can re-sync them before the release cut.",
      type: "human",
    },
    {
      id: "reply-2",
      sender: "Atlas",
      meta: "claude-opus",
      time: "9:45 AM",
      body: "Saved indicator and the compact continuation row. Diff is in the channel.",
      type: "agent",
    },
    {
      id: "reply-3",
      sender: "Cuvii",
      meta: "member",
      time: "9:47 AM",
      body: "On it — I'll push the re-sync before the cut.",
      type: "human",
    },
  ],
};

const THREAD_FIXTURES: Partial<Record<PlaygroundChannelId, ThreadFixture>> = {
  "proj-uiux": FULL_THREAD,
  "dm-atlas": SHORT_THREAD,
};

const BRUTAL_AVATAR_BG = {
  human: "[[data-preview-theme=brutal]_&]:bg-brutal-lavender",
  agent: "[[data-preview-theme=brutal]_&]:bg-brutal-cyan",
};

function ThreadRowAvatar({ type }: { type: "human" | "agent" }) {
  return (
    <MessageItemAvatarSlot>
      <Avatar
        size="md"
        type={type}
        className={`[[data-preview-theme=brutal]_&]:border-black ${BRUTAL_AVATAR_BG[type]} [[data-preview-theme=brutal]_&]:text-black`}
      >
        {type === "agent" ? (
          <>
            <AvatarFallback />
            <Status
              aria-hidden
              size="lg"
              variant="default"
              className="absolute -right-0.5 -bottom-0.5"
            />
          </>
        ) : null}
      </Avatar>
    </MessageItemAvatarSlot>
  );
}

function ThreadMessage({ message }: { message: ThreadMessageFixture }) {
  return (
    <MessageItem className="[[data-preview-theme=brutal]_&]:transition-none">
      <ThreadRowAvatar type={message.type} />
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender className="[[data-preview-theme=brutal]_&]:text-black">
            {message.sender}
          </MessageItemSender>
          <MessageItemMeta>{message.meta}</MessageItemMeta>
          <MessageItemTime className="[[data-preview-theme=brutal]_&]:text-black/40">
            {message.time}
          </MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody className="[[data-preview-theme=brutal]_&]:text-black">
          {message.body}
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function PlaygroundThreadPanel({ channel }: { channel: PlaygroundChannel }) {
  const fixture = THREAD_FIXTURES[channel.id] ?? SHORT_THREAD;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reply, setReply] = useState("");
  const isDm = channel.kind === "dm-human" || channel.kind === "dm-agent";
  const channelLabel = isDm ? `@${channel.name}` : `#${channel.name}`;

  return (
    <ChatThreadPanelRoot>
      <ChatThreadPanelHeader>
        <ChatThreadPanelTitle>
          Thread
          <span className="font-normal text-foreground-muted [[data-preview-theme=brutal]_&]:text-black/50">
            {` — ${channelLabel}`}
          </span>
        </ChatThreadPanelTitle>
        <ChatThreadPanelActions>
          <ChatThreadPanelAction aria-label="Search in thread" onClick={() => setSearchOpen(true)}>
            <Search />
          </ChatThreadPanelAction>
          <ChatThreadPanelAction
            aria-label="View in channel"
            className="text-xs sm:w-auto sm:gap-1.5 sm:px-2.5"
          >
            <ExternalLink />
            <span className="hidden sm:inline">View in channel</span>
          </ChatThreadPanelAction>
          <ChatThreadPanelAction
            aria-label="Close thread"
            render={<Link to="/playground/$channelId" params={{ channelId: channel.id }} />}
          >
            <X />
          </ChatThreadPanelAction>
        </ChatThreadPanelActions>
      </ChatThreadPanelHeader>
      {searchOpen ? (
        <ChatThreadPanelSearch>
          <Search className="size-3.5" />
          <ChatThreadPanelSearchInput
            aria-label="Search this thread"
            placeholder="Search this thread"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <ChatThreadPanelSearchCount />
          <ChatThreadPanelAction aria-label="Previous match" disabled={!searchQuery}>
            <ChevronUp />
          </ChatThreadPanelAction>
          <ChatThreadPanelAction aria-label="Next match" disabled={!searchQuery}>
            <ChevronDown />
          </ChatThreadPanelAction>
          <ChatThreadPanelAction
            aria-label="Close thread search"
            onClick={() => setSearchOpen(false)}
          >
            <X />
          </ChatThreadPanelAction>
        </ChatThreadPanelSearch>
      ) : null}
      <ChatThreadPanelParent>
        <ThreadMessage message={fixture.parent} />
      </ChatThreadPanelParent>
      <ChatThreadPanelBody>
        <div className="px-3 pt-2">
          <MessageTimelineNotice>Beginning of replies</MessageTimelineNotice>
          <ChatThreadPanelReplyCount>{fixture.replyCount}</ChatThreadPanelReplyCount>
        </div>
        {fixture.replies.map((message) => (
          <div key={message.id} className="px-3">
            <ThreadMessage message={message} />
          </div>
        ))}
        <div className="px-3 pb-3">
          <div className="h-3" />
        </div>
      </ChatThreadPanelBody>
      <ChatThreadPanelFooter render={<form onSubmit={(event) => event.preventDefault()} />}>
        <div className="flex w-full flex-col gap-2">
          <ChatMainPanelComposer>
            <ChatMainPanelComposerInput
              aria-label="Message thread"
              placeholder="Message thread"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
            />
            <ChatMainPanelComposerToolbar>
              <ChatMainPanelComposerActions>
                <ChatMainPanelComposerIconButton aria-label="Attach image">
                  <ImagePlus />
                </ChatMainPanelComposerIconButton>
                <ChatMainPanelComposerIconButton aria-label="Attach file">
                  <Paperclip />
                </ChatMainPanelComposerIconButton>
              </ChatMainPanelComposerActions>
              <ChatMainPanelComposerMeta>
                <ChatMainPanelComposerSubmit aria-label="Send" disabled={!reply.trim()}>
                  <Send />
                </ChatMainPanelComposerSubmit>
              </ChatMainPanelComposerMeta>
            </ChatMainPanelComposerToolbar>
          </ChatMainPanelComposer>
        </div>
      </ChatThreadPanelFooter>
    </ChatThreadPanelRoot>
  );
}
