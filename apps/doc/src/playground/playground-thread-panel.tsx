import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, ExternalLink, Search, X } from "lucide-react";
import {
  ChatThreadPanelActions,
  ChatThreadPanelBody,
  ChatThreadPanelHeader,
  ChatThreadPanelParent,
  ChatThreadPanelReplyCount,
  ChatThreadPanelRoot,
  ChatThreadPanelSearch,
  ChatThreadPanelSearchCount,
  ChatThreadPanelSearchInput,
  ChatThreadPanelTitle,
  MessageItem,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
  MessageTimelineNotice,
  PanelIconButton,
} from "raft-ui/wip";
import { Composer } from "./playground-composer.tsx";
import { PlaygroundMessageAvatar } from "./playground-message-avatar.tsx";
import {
  getPlaygroundActor,
  type PlaygroundChannelRecord,
  type PlaygroundMessage,
  type PlaygroundThread,
} from "./mock/index.ts";

function ThreadMessage({ message }: { message: PlaygroundMessage }) {
  const actor = getPlaygroundActor(message.authorId);
  const variant = actor.type === "agent" ? "agent" : "member";

  return (
    <MessageItem className="[[data-theme=brutal]_&]:transition-none">
      <PlaygroundMessageAvatar
        variant={variant}
        sender={actor.name}
        meta={actor.meta}
        status={actor.type === "agent" ? "online" : "offline"}
      />
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>{actor.name}</MessageItemSender>
          <MessageItemMeta>{actor.meta}</MessageItemMeta>
          <MessageItemTime>{message.time}</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>{message.body}</MessageItemBody>
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
  const isDm = channel.kind === "dm";
  const channelLabel = isDm ? `@${channel.name}` : `#${channel.name}`;

  return (
    <ChatThreadPanelRoot>
      <ChatThreadPanelHeader>
        <ChatThreadPanelTitle>
          Thread
          <span className="font-normal text-foreground-muted [[data-theme=brutal]_&]:text-black/50">
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
      <Composer channel={channel} label="Message thread" surface="thread" />
    </ChatThreadPanelRoot>
  );
}
