import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronUp, ExternalLink, Search, X } from "lucide-react";
import { Button, InputGroup, InputGroupAddon, InputGroupInput } from "raft-ui";
import {
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
  MessageList,
  MessageListNotice,
  PanelAction,
} from "raft-ui/wip";
import { PlaygroundThreadComposer } from "../composer/playground-composer.tsx";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { PlaygroundMessageRow } from "../message/playground-message-row.tsx";
import { type PlaygroundChannelRecord, type PlaygroundThread } from "../mock/index.ts";

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
  const conversationLabel = isDm ? "DM" : "channel";
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const matchingMessages = normalizedQuery
    ? [thread.parent, ...thread.replies].filter((message) =>
        message.content.toLocaleLowerCase().includes(normalizedQuery),
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
    <ThreadPanelRoot className="max-md:h-auto max-md:min-h-dvh max-md:flex-none max-md:overflow-visible">
      <ThreadPanelHeader className="max-md:sticky max-md:top-0 max-md:z-30">
        <Button
          className="mr-1 lg:hidden"
          variant="outline"
          size="icon-md"
          nativeButton={false}
          aria-label={backToTasks ? "Back to Tasks" : `Back to ${conversationLabel}`}
          render={
            backToTasks ? (
              <Link to="/playground/tasks" search={{}} />
            ) : (
              <PlaygroundConversationLink conversation={channel} />
            )
          }
        >
          <ChevronLeft aria-hidden />
        </Button>
        <ThreadPanelTitle>
          Thread
          <ThreadPanelTitleMeta>{` — ${channelLabel}`}</ThreadPanelTitleMeta>
        </ThreadPanelTitle>
        <ThreadPanelActions>
          <PanelAction aria-label="Search in thread" onClick={() => setSearchOpen(true)}>
            <Search />
          </PanelAction>
          <PanelAction
            nativeButton={false}
            aria-label={`View in ${conversationLabel}`}
            render={<PlaygroundConversationLink conversation={channel} />}
          >
            <ExternalLink />

            <span className="hidden whitespace-nowrap font-medium leading-none md:inline">
              {`View in ${conversationLabel}`}
            </span>
          </PanelAction>
          <PanelAction
            className="max-lg:hidden"
            nativeButton={false}
            aria-label="Close thread"
            render={<PlaygroundConversationLink conversation={channel} />}
          >
            <X />
          </PanelAction>
        </ThreadPanelActions>
      </ThreadPanelHeader>
      <ThreadPanelContent className="max-md:h-auto max-md:min-h-0 max-md:flex-none max-md:overflow-visible">
        {searchOpen ? (
          <ThreadPanelSearch>
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search this thread"
                placeholder="Search this thread"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setActiveMatchIndex(0);
                }}
              />
            </InputGroup>
            <ThreadPanelSearchCount aria-live="polite">{matchCountLabel}</ThreadPanelSearchCount>
            <ThreadPanelActions>
              <PanelAction
                aria-label="Previous match"
                disabled={!matchingMessages.length}
                onClick={() => moveToMatch(-1)}
              >
                <ChevronUp />
              </PanelAction>
              <PanelAction
                aria-label="Next match"
                disabled={!matchingMessages.length}
                onClick={() => moveToMatch(1)}
              >
                <ChevronDown />
              </PanelAction>
              <PanelAction aria-label="Close thread search" onClick={() => setSearchOpen(false)}>
                <X />
              </PanelAction>
            </ThreadPanelActions>
          </ThreadPanelSearch>
        ) : null}
        <ThreadPanelOriginalMessage
          render={
            <PlaygroundMessageRow
              message={thread.parent}
              searchMatch={activeMatch?.id === thread.parent.id}
              threadId={thread.parent.id}
            />
          }
        />
        <ThreadPanelBody className="max-md:h-auto max-md:min-h-[calc(100dvh-var(--shell-header-height))] max-md:flex-none max-md:overflow-visible">
          <MessageList
            rootClassName="max-md:h-auto max-md:min-h-0"
            className="max-md:!h-auto max-md:!min-h-0 max-md:!overflow-visible"
          >
            <div className="px-3 pt-2">
              <MessageListNotice>Beginning of replies</MessageListNotice>
              <ThreadPanelReplyCount>
                {thread.replies.length === 1 ? "1 reply" : `${thread.replies.length} replies`}
              </ThreadPanelReplyCount>
            </div>
            {thread.replies.map((message) => (
              <PlaygroundMessageRow
                key={message.id}
                message={message}
                searchMatch={activeMatch?.id === message.id}
                threadId={thread.parent.id}
              />
            ))}
            <div className="h-6 max-md:h-[var(--panel-footer-clearance)]" aria-hidden />
          </MessageList>
        </ThreadPanelBody>
        <PlaygroundThreadComposer channel={channel} label="Message thread" />
      </ThreadPanelContent>
    </ThreadPanelRoot>
  );
}
