import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { ListTodo, MessageSquare, Paperclip } from "lucide-react";
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  ConversationPanelBody,
  ConversationPanelContent,
  ConversationPanelRoot,
  ConversationPanelTabs,
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsIndicator,
  TabsLabel,
  MessageMultiSelect,
} from "raft-ui";
import type { PanelEdge } from "raft-ui";
import { MessageList, MessageListDateDivider, MessageListNotice } from "raft-ui";

import { MessageMultiSelectToolbarComposition } from "#/modules/message-item/compositions/selection.compositions.tsx";
import { MessageTextSelectionComposition } from "#/modules/message-item/compositions/text-selection.composition.tsx";
import { PlaygroundMainComposer } from "../composer/playground-composer.tsx";
import { PlaygroundSingleComposerMentionProvider } from "../composer/playground-composer-mentions.tsx";
import type { PlaygroundPanelTab } from "../navigation/playground-navigation.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { PlaygroundFilesPanel } from "../files/files-panel.tsx";
import { PlaygroundTasksPanel } from "../tasks/tasks-panel.tsx";
import { PlaygroundMessageRow } from "../message/playground-message-row.tsx";
import { usePlaygroundMessageMultiSelect } from "../message/use-playground-message-multi-select.ts";
import {
  getPlaygroundActor,
  findPlaygroundTaskForMessage,
  getPlaygroundMessageText,
  isPlaygroundChatMessage,
  getPlaygroundConversationMessages,
} from "../mock/index.ts";
import type {
  PlaygroundChannel,
  PlaygroundChannelRecord,
  PlaygroundMessage,
} from "../mock/index.ts";
import { TaskStatusBadge } from "../tasks/task-status-badge.tsx";
import { usePlaygroundTaskState } from "../tasks/use-playground-task-state.ts";

const TAB_META: Record<PlaygroundPanelTab, { icon: ReactNode; label: string }> = {
  chat: { icon: <MessageSquare />, label: "Chat" },
  tasks: { icon: <ListTodo />, label: "Tasks" },
  files: { icon: <Paperclip />, label: "Files" },
};

export function PlaygroundConversationPanel({
  channel,
  composerLabel,
  edge = "inset",
  header,
  onOpenThread,
}: {
  channel: PlaygroundChannelRecord;
  composerLabel: string;
  edge?: PanelEdge;
  header: ReactNode;
  onOpenThread?: (threadId: string) => void;
}) {
  const { panelTab, selectPanelTab } = usePlaygroundNavigation();
  const [tabOrder, setTabOrder] = useState<PlaygroundPanelTab[]>(["chat", "tasks", "files"]);

  return (
    <ConversationPanelRoot edge={edge}>
      {header}
      <ConversationPanelContent>
        <ConversationPanelTabs render={<Tabs value={panelTab} onValueChange={selectPanelTab} />}>
          <SortableTabsList value={tabOrder} onReorder={setTabOrder} variant="underline">
            {tabOrder.map((id) => (
              <SortableTabsTab key={id} value={id}>
                {TAB_META[id].icon}
                <TabsLabel>{TAB_META[id].label}</TabsLabel>
              </SortableTabsTab>
            ))}
            <TabsIndicator />
          </SortableTabsList>
        </ConversationPanelTabs>
        {panelTab === "chat" ? (
          <PlaygroundSingleComposerMentionProvider>
            <MessageMultiSelect>
              <MessageTextSelectionComposition>
                <ChannelBody channel={channel} onOpenThread={onOpenThread} />
              </MessageTextSelectionComposition>
              <PlaygroundMainComposer
                key={channel.id}
                channel={channel}
                label={composerLabel}
                initialComposer={channel.initialComposer}
              />
            </MessageMultiSelect>
          </PlaygroundSingleComposerMentionProvider>
        ) : panelTab === "tasks" ? (
          <PlaygroundTasksPanel channel={channel} />
        ) : (
          <PlaygroundFilesPanel channel={channel} />
        )}
      </ConversationPanelContent>
    </ConversationPanelRoot>
  );
}

function PlaygroundMessageMultiSelectToolbar({
  messages,
  selection,
}: {
  messages: readonly PlaygroundMessage[];
  selection: ReturnType<typeof usePlaygroundMessageMultiSelect>;
}) {
  const selectedMessages = useMemo(
    () => messages.filter((message) => selection.selected.has(message.id)),
    [messages, selection.selected],
  );
  const selectedContent = useMemo(
    () =>
      selectedMessages.filter(isPlaygroundChatMessage).map(getPlaygroundMessageText).join("\n\n"),
    [selectedMessages],
  );
  const copyLinks = useCallback(() => {
    const links = selectedMessages.map((message) => {
      const permalink = new URL(window.location.href);
      permalink.hash = `message-${message.id}`;
      return permalink.href;
    });
    void navigator.clipboard?.writeText(links.join("\n"));
  }, [selectedMessages]);
  const copyMarkdown = useCallback(
    () => void navigator.clipboard?.writeText(selectedContent),
    [selectedContent],
  );

  if (!selection.active) return null;

  return (
    <MessageMultiSelectToolbarComposition
      onCancel={selection.cancel}
      onCopyLink={selectedMessages.length ? copyLinks : undefined}
      onCopyMarkdown={selectedContent ? copyMarkdown : undefined}
    >
      {selection.selected.size} selected
    </MessageMultiSelectToolbarComposition>
  );
}

function ChannelBody({
  channel,
  onOpenThread,
}: {
  channel: PlaygroundChannelRecord;
  onOpenThread?: (threadId: string) => void;
}) {
  const messages = getPlaygroundConversationMessages(channel.id);
  const selection = usePlaygroundMessageMultiSelect();
  return messages.length ? (
    <ConversationBody messages={messages} onOpenThread={onOpenThread} selection={selection} />
  ) : (
    <NewChannelBody channel={channel} />
  );
}

function ConversationBody({
  messages,
  onOpenThread,
  selection,
}: {
  messages: readonly PlaygroundMessage[];
  onOpenThread?: (threadId: string) => void;
  selection: ReturnType<typeof usePlaygroundMessageMultiSelect>;
}) {
  const location = useLocation();
  const { tasks } = usePlaygroundTaskState();
  const hashTargetId = location.hash.replace(/^#/, "");
  const focusTargetId = hashTargetId.startsWith("message-") ? hashTargetId : undefined;
  const unreadCount = messages.filter((message) => message.unread).length;
  const groupedRows = messages.map((message, index) => {
    const previous = messages[index - 1];
    const compact = Boolean(
      previous &&
      previous.kind === "chat" &&
      message.kind === "chat" &&
      previous.senderId === message.senderId,
    );
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
  }, [focusTargetId, messages]);

  return (
    <>
      <ConversationPanelBody>
        <MessageList>
          <div className="px-3 pt-3">
            <MessageListNotice>Beginning of messages</MessageListNotice>
          </div>
          <MessageListDateDivider>Today</MessageListDateDivider>
          {unreadCount > 0 ? (
            <div className="px-3 pt-3">
              <MessageListNotice tone="muted">
                {unreadCount === 1 ? "1 unread message" : `${unreadCount} unread messages`}
              </MessageListNotice>
            </div>
          ) : null}
          {groupedRows.map(({ message, compact }) => {
            const linkedTask = findPlaygroundTaskForMessage(tasks, message.id);
            const taskBadge = linkedTask ? (
              <TaskStatusBadge
                taskId={linkedTask.id}
                assignee={
                  linkedTask.assigneeActorId
                    ? getPlaygroundActor(linkedTask.assigneeActorId).name
                    : undefined
                }
              />
            ) : null;

            return (
              <PlaygroundMessageRow
                key={message.id}
                message={message}
                task={linkedTask}
                compact={compact}
                threadId={message.id}
                focusTarget={focusTargetId === `message-${message.id}`}
                onOpenThread={onOpenThread}
                footer={taskBadge}
                selectionMode={selection.active}
                selected={selection.selected.has(message.id)}
                onEnterSelectionMode={selection.enter}
                onSelectedChange={selection.toggle}
              />
            );
          })}
          <div className="pb-3" aria-hidden />
        </MessageList>
      </ConversationPanelBody>
      <PlaygroundMessageMultiSelectToolbar messages={messages} selection={selection} />
    </>
  );
}

function NewChannelBody({ channel }: { channel: PlaygroundChannel }) {
  return (
    <ConversationPanelBody>
      <div className="flex h-full items-center justify-center">
        <EmptyState>
          <EmptyStateIcon>
            <MessageSquare />
          </EmptyStateIcon>
          <EmptyStateContent>
            <EmptyStateTitle>Start #{channel.name}</EmptyStateTitle>
            <EmptyStateDescription>
              This is the beginning of the conversation. Send the first message below.
            </EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </div>
    </ConversationPanelBody>
  );
}
