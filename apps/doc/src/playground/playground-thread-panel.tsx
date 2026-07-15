import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronUp, ExternalLink, Search, X } from "lucide-react";
import { Button } from "raft-ui";
import {
  ChatThreadPanelActions,
  ChatThreadPanelBody,
  ChatThreadPanelContent,
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
  ChatPanelAction,
} from "raft-ui/wip";
import { PlaygroundThreadComposer } from "./playground-composer.tsx";
import { PlaygroundMessageRow } from "./playground-message-row.tsx";
import {
  PLAYGROUND_SERVER_SLUG,
  type PlaygroundChannelRecord,
  type PlaygroundThread,
} from "./mock/index.ts";

export function PlaygroundThreadPanel({
  backToTasks,
  channel,
  thread,
}: {
  backToTasks?: boolean;
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
        <Button
          className="mr-1 lg:hidden"
          variant="outline"
          size="icon-md"
          nativeButton={false}
          aria-label={backToTasks ? "Back to Tasks" : "Back to channel"}
          render={
            backToTasks ? (
              <Link to="/playground/tasks" search={{}} />
            ) : (
              <Link
                to="/playground/s/$serverSlug/channel/$channelId"
                params={{ channelId: channel.id, serverSlug: PLAYGROUND_SERVER_SLUG }}
                search={{}}
              />
            )
          }
        >
          <ChevronLeft aria-hidden />
        </Button>
        <ChatThreadPanelTitle>
          Thread
          <ChatThreadPanelTitleMeta>{` — ${channelLabel}`}</ChatThreadPanelTitleMeta>
        </ChatThreadPanelTitle>
        <ChatThreadPanelActions>
          <ChatPanelAction aria-label="Search in thread" onClick={() => setSearchOpen(true)}>
            <Search />
          </ChatPanelAction>
          <ChatPanelAction
            nativeButton={false}
            aria-label="View in channel"
            render={
              <Link
                to="/playground/s/$serverSlug/channel/$channelId"
                params={{ channelId: channel.id, serverSlug: PLAYGROUND_SERVER_SLUG }}
                search={{}}
              />
            }
          >
            <ExternalLink />

            <span className="hidden whitespace-nowrap font-medium leading-none md:inline">
              View in channel
            </span>
          </ChatPanelAction>
          <ChatPanelAction
            className="max-lg:hidden"
            nativeButton={false}
            aria-label="Close thread"
            render={
              <Link
                to="/playground/s/$serverSlug/channel/$channelId"
                params={{ channelId: channel.id, serverSlug: PLAYGROUND_SERVER_SLUG }}
                search={{}}
              />
            }
          >
            <X />
          </ChatPanelAction>
        </ChatThreadPanelActions>
      </ChatThreadPanelHeader>
      <ChatThreadPanelContent>
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
            <ChatPanelAction
              aria-label="Previous match"
              disabled={!matchingMessages.length}
              onClick={() => moveToMatch(-1)}
            >
              <ChevronUp />
            </ChatPanelAction>
            <ChatPanelAction
              aria-label="Next match"
              disabled={!matchingMessages.length}
              onClick={() => moveToMatch(1)}
            >
              <ChevronDown />
            </ChatPanelAction>
            <ChatPanelAction aria-label="Close thread search" onClick={() => setSearchOpen(false)}>
              <X />
            </ChatPanelAction>
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
          <div className="h-6" aria-hidden />
        </ChatThreadPanelBody>
        <PlaygroundThreadComposer channel={channel} label="Message thread" />
      </ChatThreadPanelContent>
    </ChatThreadPanelRoot>
  );
}
