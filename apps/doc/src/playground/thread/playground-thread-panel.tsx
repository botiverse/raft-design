import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronUp, ExternalLink, Search, X } from "lucide-react";
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  PanelAction,
  ThreadPanelActions,
  ThreadPanelBody,
  ThreadPanelContent,
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
  MessageMultiSelect,
} from "raft-ui";
import { MessageList, MessageListNotice } from "raft-ui";
import { MessageMultiSelectToolbarComposition } from "#/modules/message-item/compositions/selection.compositions.tsx";
import { PlaygroundThreadComposer } from "../composer/playground-composer.tsx";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { PlaygroundMessageRow } from "../message/playground-message-row.tsx";
import { usePlaygroundMessageMultiSelect } from "../message/use-playground-message-multi-select.ts";
import { usePlaygroundThreadReplies } from "../message/use-playground-message-workflow.ts";
import {
  getPlaygroundActor,
  type PlaygroundChannelRecord,
  type PlaygroundTask,
  type PlaygroundThread,
} from "../mock/index.ts";
import { TaskStatusBadge } from "../tasks/task-status-badge.tsx";

export function PlaygroundThreadPanel({
  backToTasks,
  channel,
  onClose,
  onViewConversation,
  task,
  thread,
}: {
  backToTasks?: boolean;
  channel: PlaygroundChannelRecord;
  onClose?: () => void;
  onViewConversation?: () => void;
  task?: PlaygroundTask;
  thread: PlaygroundThread;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const location = useLocation();
  const { replies } = usePlaygroundThreadReplies(thread.parent.id, thread.replies);
  const selection = usePlaygroundMessageMultiSelect();
  const hashTargetId = location.hash.replace(/^#/, "");
  const focusTargetId = hashTargetId.startsWith("thread-message-") ? hashTargetId : undefined;
  const isDm = channel.kind === "dm";
  const channelLabel = isDm ? `@${channel.name}` : `#${channel.name}`;
  const conversationLabel = isDm ? "DM" : "channel";
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const matchingMessages = normalizedQuery
    ? [thread.parent, ...replies].filter((message) =>
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

  const groupedReplies = replies.map((message, index) => {
    const previous = replies[index - 1];
    const compact = Boolean(previous && previous.senderId === message.senderId);
    return { message, compact };
  });

  useEffect(() => {
    if (!focusTargetId) return;

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(focusTargetId);
      if (!(target instanceof HTMLElement)) return;
      target.scrollIntoView({ block: "center" });
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusTargetId, replies]);

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
          nativeButton={onClose ? undefined : false}
          aria-label={backToTasks ? "Back to Tasks" : `Back to ${conversationLabel}`}
          render={
            onClose ? undefined : backToTasks ? (
              <Link to="/playground/tasks" search={{}} />
            ) : (
              <PlaygroundConversationLink conversation={channel} />
            )
          }
          onClick={onClose}
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
            nativeButton={onViewConversation ? undefined : false}
            aria-label={`View in ${conversationLabel}`}
            render={
              onViewConversation ? undefined : <PlaygroundConversationLink conversation={channel} />
            }
            onClick={onViewConversation}
          >
            <ExternalLink />

            <span className="hidden whitespace-nowrap font-medium leading-none md:inline">
              {`View in ${conversationLabel}`}
            </span>
          </PanelAction>
          <PanelAction
            className="max-lg:hidden"
            nativeButton={onClose ? undefined : false}
            aria-label="Close thread"
            render={onClose ? undefined : <PlaygroundConversationLink conversation={channel} />}
            onClick={onClose}
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
              task={task}
              footer={
                task ? (
                  <TaskStatusBadge
                    taskId={task.id}
                    assignee={
                      task.assigneeActorId
                        ? getPlaygroundActor(task.assigneeActorId).name
                        : undefined
                    }
                  />
                ) : undefined
              }
              searchQuery={activeMatch?.id === thread.parent.id ? normalizedQuery : undefined}
              focusTarget={focusTargetId === `thread-message-${thread.parent.id}`}
              surface="thread"
              threadId={thread.parent.id}
              selectionMode={selection.active}
              selected={selection.selected.has(thread.parent.id)}
              onEnterSelectionMode={() => selection.enter(thread.parent.id)}
              onSelectedChange={() => selection.toggle(thread.parent.id)}
            />
          </ThreadPanelOriginalMessage>
          <ThreadPanelBody>
            <MessageList>
              <ThreadPanelReplySummary>
                <MessageListNotice>Beginning of replies</MessageListNotice>
                <ThreadPanelReplyCount>
                  {replies.length === 1 ? "1 reply" : `${replies.length} replies`}
                </ThreadPanelReplyCount>
              </ThreadPanelReplySummary>
              {groupedReplies.map(({ message, compact }) => (
                <PlaygroundMessageRow
                  key={message.id}
                  message={message}
                  compact={compact}
                  focusTarget={focusTargetId === `thread-message-${message.id}`}
                  searchQuery={activeMatch?.id === message.id ? normalizedQuery : undefined}
                  surface="thread"
                  threadId={thread.parent.id}
                  selectionMode={selection.active}
                  selected={selection.selected.has(message.id)}
                  onEnterSelectionMode={() => selection.enter(message.id)}
                  onSelectedChange={() => selection.toggle(message.id)}
                />
              ))}
              <div className="h-6" aria-hidden />
            </MessageList>
          </ThreadPanelBody>
          <PlaygroundThreadMultiSelectToolbar
            messages={[thread.parent, ...replies]}
            selection={selection}
          />
          <PlaygroundThreadComposer
            key={thread.parent.id}
            channel={channel}
            initialReplies={thread.replies}
            label="Message thread"
            threadId={thread.parent.id}
          />
        </MessageMultiSelect>
      </ThreadPanelContent>
    </ThreadPanelRoot>
  );
}

function PlaygroundThreadMultiSelectToolbar({
  messages,
  selection,
}: {
  messages: readonly { id: string; content: string }[];
  selection: ReturnType<typeof usePlaygroundMessageMultiSelect>;
}) {
  if (!selection.active) return null;

  const selectedContent = messages
    .filter((message) => selection.selected.has(message.id))
    .map((message) => message.content)
    .join("\n\n");
  const selectedMessages = messages.filter((message) => selection.selected.has(message.id));

  return (
    <MessageMultiSelectToolbarComposition
      onCancel={selection.cancel}
      onCopyLink={
        selectedMessages.length
          ? () => {
              const links = selectedMessages.map((message) => {
                const permalink = new URL(window.location.href);
                permalink.hash = `thread-message-${message.id}`;
                return permalink.href;
              });
              void navigator.clipboard?.writeText(links.join("\n"));
            }
          : undefined
      }
      onCopyMarkdown={
        selectedContent ? () => void navigator.clipboard?.writeText(selectedContent) : undefined
      }
    >
      {selection.selected.size} selected
    </MessageMultiSelectToolbarComposition>
  );
}
