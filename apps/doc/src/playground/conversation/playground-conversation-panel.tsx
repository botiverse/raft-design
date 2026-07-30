import { useState, type ReactNode } from "react";
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
import { MessageList, MessageListDateDivider, MessageListNotice } from "raft-ui/wip";

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
  getPlaygroundConversationMessages,
  type PlaygroundChannel,
  type PlaygroundChannelRecord,
  type PlaygroundMessage,
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
  header,
}: {
  channel: PlaygroundChannelRecord;
  composerLabel: string;
  header: ReactNode;
}) {
  const { panelTab, selectPanelTab } = usePlaygroundNavigation();
  const [tabOrder, setTabOrder] = useState<PlaygroundPanelTab[]>(["chat", "tasks", "files"]);

  return (
    <ConversationPanelRoot>
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
                <ChannelBody channel={channel} />
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
                permalink.hash = `message-${message.id}`;
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

function ChannelBody({ channel }: { channel: PlaygroundChannelRecord }) {
  const messages = getPlaygroundConversationMessages(channel.id);
  const selection = usePlaygroundMessageMultiSelect();
  return messages.length ? (
    <ConversationBody messages={messages} selection={selection} />
  ) : (
    <NewChannelBody channel={channel} />
  );
}

function ConversationBody({
  messages,
  selection,
}: {
  messages: readonly PlaygroundMessage[];
  selection: ReturnType<typeof usePlaygroundMessageMultiSelect>;
}) {
  const { tasks } = usePlaygroundTaskState();
  const unreadCount = messages.filter((message) => message.unread).length;
  const groupedRows = messages.map((message, index) => {
    const previous = messages[index - 1];
    const compact = Boolean(
      previous &&
      previous.senderId === message.senderId &&
      previous.messageType === message.messageType,
    );
    return { message, compact };
  });

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
            const linkedTask = tasks.find((task) => task.sourceMessageId === message.id);
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
                compact={compact}
                threadId={message.id}
                footer={taskBadge}
                selectionMode={selection.active}
                selected={selection.selected.has(message.id)}
                onEnterSelectionMode={() => selection.enter(message.id)}
                onSelectedChange={() => selection.toggle(message.id)}
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
