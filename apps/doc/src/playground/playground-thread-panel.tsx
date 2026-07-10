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
  ComposerStack,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
  MessageTimelineNotice,
  PanelIconButton,
} from "raft-ui/wip";
import {
  getPlaygroundActor,
  type PlaygroundChannelRecord,
  type PlaygroundMessage,
  type PlaygroundThread,
} from "./mock/index.ts";

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

function ThreadMessage({ message }: { message: PlaygroundMessage }) {
  const actor = getPlaygroundActor(message.authorId);

  return (
    <MessageItem className="[[data-preview-theme=brutal]_&]:transition-none">
      <ThreadRowAvatar type={actor.type} />
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender className="[[data-preview-theme=brutal]_&]:text-black">
            {actor.name}
          </MessageItemSender>
          <MessageItemMeta>{actor.meta}</MessageItemMeta>
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

export function PlaygroundThreadPanel({
  channel,
  thread,
}: {
  channel: PlaygroundChannelRecord;
  thread: PlaygroundThread;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reply, setReply] = useState("");
  const isDm = channel.kind === "dm";
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
          <PanelIconButton aria-label="Search in thread" onClick={() => setSearchOpen(true)}>
            <Search />
          </PanelIconButton>
          <PanelIconButton
            aria-label="View in channel"
            className="text-xs sm:w-auto sm:gap-1.5 sm:px-2.5"
            render={
              <Link to="/playground/$channelId" params={{ channelId: channel.id }} search={{}} />
            }
          >
            <ExternalLink />
            <span className="hidden sm:inline">View in channel</span>
          </PanelIconButton>
          <PanelIconButton
            aria-label="Close thread"
            render={
              <Link to="/playground/$channelId" params={{ channelId: channel.id }} search={{}} />
            }
          >
            <X />
          </PanelIconButton>
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
          <PanelIconButton aria-label="Previous match" disabled={!searchQuery}>
            <ChevronUp />
          </PanelIconButton>
          <PanelIconButton aria-label="Next match" disabled={!searchQuery}>
            <ChevronDown />
          </PanelIconButton>
          <PanelIconButton aria-label="Close thread search" onClick={() => setSearchOpen(false)}>
            <X />
          </PanelIconButton>
        </ChatThreadPanelSearch>
      ) : null}
      <ChatThreadPanelParent>
        <ThreadMessage message={thread.parent} />
      </ChatThreadPanelParent>
      <ChatThreadPanelBody>
        <div className="px-3 pt-2">
          <MessageTimelineNotice>Beginning of replies</MessageTimelineNotice>
          <ChatThreadPanelReplyCount>
            {thread.replies.length === 1 ? "1 reply" : `${thread.replies.length} replies`}
          </ChatThreadPanelReplyCount>
        </div>
        {thread.replies.map((message) => (
          <div key={message.id} className="px-3">
            <ThreadMessage message={message} />
          </div>
        ))}
        <div className="px-3 pb-3">
          <div className="h-3" />
        </div>
      </ChatThreadPanelBody>
      <ChatThreadPanelFooter render={<form onSubmit={(event) => event.preventDefault()} />}>
        <ComposerStack>
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
        </ComposerStack>
      </ChatThreadPanelFooter>
    </ChatThreadPanelRoot>
  );
}
