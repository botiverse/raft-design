import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronUp, ExternalLink, Search, X } from "lucide-react";
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  ThreadPanelActions,
  ThreadPanelBody,
  ThreadPanelContent,
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
  MessageList,
  MessageListNotice,
  MessageMultiSelect,
  PanelAction,
  useMessageMultiSelect,
} from "raft-ui/wip";
import { MessageMultiSelectToolbarComposition } from "#/modules/message-item/compositions/selection.compositions.tsx";
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
    ? `${resolvedMatchIndex + 1}/${matchingMessages.length}`
    : normalizedQuery
      ? "No matches"
      : "";

  const groupedReplies = thread.replies.map((message, index) => {
    const previous = thread.replies[index - 1];
    const compact = Boolean(
      previous &&
      previous.senderId === message.senderId &&
      previous.messageType === message.messageType,
    );
    return { message, compact };
  });

  function moveToMatch(direction: -1 | 1) {
    setActiveMatchIndex((index) =>
      matchingMessages.length
        ? (index + direction + matchingMessages.length) % matchingMessages.length
        : 0,
    );
  }

  return (
    <ThreadPanelRoot>
      <ThreadPanelHeader>
        <Button
          className="mr-1 lg:hidden"
          variant="outline"
          size="icon-sm"
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
      <ThreadPanelContent>
        <MessageMultiSelect>
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
              <ThreadPanelSearchTrailing>
                <ThreadPanelSearchCount aria-live="polite">
                  {matchCountLabel}
                </ThreadPanelSearchCount>
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
                  <PanelAction
                    aria-label="Close thread search"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X />
                  </PanelAction>
                </ThreadPanelActions>
              </ThreadPanelSearchTrailing>
            </ThreadPanelSearch>
          ) : null}
          <ThreadPanelOriginalMessage>
            <PlaygroundMessageRow
              message={thread.parent}
              searchMatch={activeMatch?.id === thread.parent.id}
              threadId={thread.parent.id}
            />
          </ThreadPanelOriginalMessage>
          <ThreadPanelBody>
            <MessageList>
              <div className="px-3 pt-2">
                <MessageListNotice>Beginning of replies</MessageListNotice>
                <ThreadPanelReplyCount>
                  {thread.replies.length === 1 ? "1 reply" : `${thread.replies.length} replies`}
                </ThreadPanelReplyCount>
              </div>
              {groupedReplies.map(({ message, compact }) => (
                <PlaygroundMessageRow
                  key={message.id}
                  message={message}
                  compact={compact}
                  searchMatch={activeMatch?.id === message.id}
                  threadId={thread.parent.id}
                />
              ))}
              <div className="h-6" aria-hidden />
            </MessageList>
          </ThreadPanelBody>
          <PlaygroundThreadMultiSelectToolbar messages={[thread.parent, ...thread.replies]} />
          <PlaygroundThreadComposer channel={channel} label="Message thread" />
        </MessageMultiSelect>
      </ThreadPanelContent>
    </ThreadPanelRoot>
  );
}

function PlaygroundThreadMultiSelectToolbar({
  messages,
}: {
  messages: readonly { id: string; content: string }[];
}) {
  const selection = useMessageMultiSelect();
  if (!selection?.active) return null;

  const selectedContent = messages
    .filter((message) => selection.selected.has(message.id))
    .map((message) => message.content)
    .join("\n\n");

  return (
    <MessageMultiSelectToolbarComposition
      count={selection.selected.size}
      onCancel={selection.cancel}
      onCopyLink={() => void navigator.clipboard?.writeText(window.location.href)}
      onCopyMarkdown={() => void navigator.clipboard?.writeText(selectedContent)}
      onForward={() => undefined}
    />
  );
}
