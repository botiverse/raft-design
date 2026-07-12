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
  ChatThreadPanelSearchIcon,
  ChatThreadPanelSearchInput,
  ChatThreadPanelTitle,
  ChatThreadPanelTitleMeta,
  MessageItem,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSearchMatch,
  MessageItemSender,
  MessageItemTime,
  MessageTimelineNotice,
  PanelButton,
  PanelButtonIcon,
  PanelButtonLabel,
} from "raft-ui/wip";
import { PlaygroundThreadComposer } from "./playground-composer.tsx";
import { PlaygroundMessageAvatar } from "./playground-message-avatar.tsx";
import {
  getPlaygroundActor,
  type PlaygroundChannelRecord,
  type PlaygroundMessage,
  type PlaygroundThread,
} from "./mock/index.ts";

function ThreadMessage({
  message,
  searchMatch = false,
}: {
  message: PlaygroundMessage;
  searchMatch?: boolean;
}) {
  const actor = getPlaygroundActor(message.authorId);
  const variant = actor.type === "agent" ? "agent" : "member";
  const Root = searchMatch ? MessageItemSearchMatch : MessageItem;

  return (
    <Root>
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
    </Root>
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
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const isDm = channel.kind === "dm";
  const channelLabel = isDm ? `@${channel.name}` : `#${channel.name}`;
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const matchingMessages = normalizedQuery
    ? [thread.parent, ...thread.replies].filter((message) =>
        message.body.toLocaleLowerCase().includes(normalizedQuery),
      )
    : [];
  const resolvedMatchIndex = matchingMessages.length
    ? activeMatchIndex % matchingMessages.length
    : 0;
  const activeMatch = searchOpen ? matchingMessages[resolvedMatchIndex] : undefined;
  const matchCountLabel = matchingMessages.length
    ? `${resolvedMatchIndex + 1} of ${matchingMessages.length}`
    : normalizedQuery
      ? "No matches"
      : "";

  function moveToMatch(direction: -1 | 1) {
    setActiveMatchIndex((index) =>
      matchingMessages.length
        ? (index + direction + matchingMessages.length) % matchingMessages.length
        : 0,
    );
  }

  return (
    <ChatThreadPanelRoot>
      <ChatThreadPanelHeader>
        <ChatThreadPanelTitle>
          Thread
          <ChatThreadPanelTitleMeta>{` — ${channelLabel}`}</ChatThreadPanelTitleMeta>
        </ChatThreadPanelTitle>
        <ChatThreadPanelActions>
          <PanelButton aria-label="Search in thread" onClick={() => setSearchOpen(true)}>
            <PanelButtonIcon>
              <Search />
            </PanelButtonIcon>
          </PanelButton>
          <PanelButton
            aria-label="View in channel"
            render={
              <Link to="/playground/$channelId" params={{ channelId: channel.id }} search={{}} />
            }
          >
            <PanelButtonIcon>
              <ExternalLink />
            </PanelButtonIcon>
            <PanelButtonLabel>View in channel</PanelButtonLabel>
          </PanelButton>
          <PanelButton
            aria-label="Close thread"
            render={
              <Link to="/playground/$channelId" params={{ channelId: channel.id }} search={{}} />
            }
          >
            <PanelButtonIcon>
              <X />
            </PanelButtonIcon>
          </PanelButton>
        </ChatThreadPanelActions>
      </ChatThreadPanelHeader>
      {searchOpen ? (
        <ChatThreadPanelSearch>
          <ChatThreadPanelSearchIcon render={<Search />} />
          <ChatThreadPanelSearchInput
            aria-label="Search this thread"
            placeholder="Search this thread"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setActiveMatchIndex(0);
            }}
          />
          <ChatThreadPanelSearchCount aria-live="polite">
            {matchCountLabel}
          </ChatThreadPanelSearchCount>
          <PanelButton
            aria-label="Previous match"
            disabled={!matchingMessages.length}
            onClick={() => moveToMatch(-1)}
          >
            <PanelButtonIcon>
              <ChevronUp />
            </PanelButtonIcon>
          </PanelButton>
          <PanelButton
            aria-label="Next match"
            disabled={!matchingMessages.length}
            onClick={() => moveToMatch(1)}
          >
            <PanelButtonIcon>
              <ChevronDown />
            </PanelButtonIcon>
          </PanelButton>
          <PanelButton aria-label="Close thread search" onClick={() => setSearchOpen(false)}>
            <PanelButtonIcon>
              <X />
            </PanelButtonIcon>
          </PanelButton>
        </ChatThreadPanelSearch>
      ) : null}
      <ChatThreadPanelParent>
        <ThreadMessage message={thread.parent} searchMatch={activeMatch?.id === thread.parent.id} />
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
            <ThreadMessage message={message} searchMatch={activeMatch?.id === message.id} />
          </div>
        ))}
        <div className="h-6" aria-hidden />
      </ChatThreadPanelBody>
      <PlaygroundThreadComposer channel={channel} label="Message thread" />
    </ChatThreadPanelRoot>
  );
}
