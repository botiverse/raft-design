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
  MessageTimelineNotice,
  PanelIconButton,
  PanelIconButtonLabel,
} from "raft-ui/wip";
import { PlaygroundThreadComposer } from "./playground-composer.tsx";
import { PlaygroundMessageRow } from "./playground-message-row.tsx";
import { type PlaygroundChannelRecord, type PlaygroundThread } from "./mock/index.ts";

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
  const activeMatch = matchingMessages[resolvedMatchIndex];
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
          <PanelIconButton aria-label="Search in thread" onClick={() => setSearchOpen(true)}>
            <Search />
          </PanelIconButton>
          <PanelIconButton
            aria-label="View in channel"
            layout="responsiveLabel"
            render={
              <Link to="/playground/$channelId" params={{ channelId: channel.id }} search={{}} />
            }
          >
            <ExternalLink />
            <PanelIconButtonLabel responsive>View in channel</PanelIconButtonLabel>
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
          <PanelIconButton
            aria-label="Previous match"
            disabled={!matchingMessages.length}
            onClick={() => moveToMatch(-1)}
          >
            <ChevronUp />
          </PanelIconButton>
          <PanelIconButton
            aria-label="Next match"
            disabled={!matchingMessages.length}
            onClick={() => moveToMatch(1)}
          >
            <ChevronDown />
          </PanelIconButton>
          <PanelIconButton aria-label="Close thread search" onClick={() => setSearchOpen(false)}>
            <X />
          </PanelIconButton>
        </ChatThreadPanelSearch>
      ) : null}
      <ChatThreadPanelParent>
        <PlaygroundMessageRow
          message={thread.parent}
          searchMatch={activeMatch?.id === thread.parent.id}
          threadId={thread.parent.id}
        />
      </ChatThreadPanelParent>
      <ChatThreadPanelBody>
        <div className="px-3 pt-2">
          <MessageTimelineNotice>Beginning of replies</MessageTimelineNotice>
          <ChatThreadPanelReplyCount>
            {thread.replies.length === 1 ? "1 reply" : `${thread.replies.length} replies`}
          </ChatThreadPanelReplyCount>
        </div>
        {thread.replies.map((message) => (
          <PlaygroundMessageRow
            key={message.id}
            message={message}
            searchMatch={activeMatch?.id === message.id}
            threadId={thread.parent.id}
          />
        ))}
        <div className="px-3 pb-3">
          <div className="h-3" />
        </div>
      </ChatThreadPanelBody>
      <PlaygroundThreadComposer channel={channel} label="Message thread" />
    </ChatThreadPanelRoot>
  );
}
