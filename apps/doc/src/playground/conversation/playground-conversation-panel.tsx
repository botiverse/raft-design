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
} from "raft-ui";
import { MessageListDateDivider, MessageListNotice } from "raft-ui/wip";

import { MessageTextSelectionComposition } from "#/modules/message-item/compositions/selection.compositions.tsx";
import { PlaygroundMainComposer } from "../composer/playground-composer.tsx";
import { PlaygroundSingleComposerMentionProvider } from "../composer/playground-composer-mentions.tsx";
import type { PlaygroundPanelTab } from "../navigation/playground-navigation.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { PlaygroundFilesPanel } from "../files/files-panel.tsx";
import { PlaygroundTasksPanel } from "../tasks/tasks-panel.tsx";
import { PlaygroundMessageList } from "../message/playground-message-list.tsx";
import {
  PlaygroundMessageRow,
  PlaygroundRepliesBadge,
  PlaygroundUnreadRepliesBadge,
} from "../message/playground-message-row.tsx";
import {
  getPlaygroundConversationMessages,
  getPlaygroundThread,
  type PlaygroundChannel,
  type PlaygroundChannelRecord,
  type PlaygroundMessage,
} from "../mock/index.ts";

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
            <MessageTextSelectionComposition>
              <ChannelBody channel={channel} />
            </MessageTextSelectionComposition>
            <PlaygroundMainComposer
              key={channel.id}
              channel={channel}
              label={composerLabel}
              initialComposer={channel.initialComposer}
            />
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

function ChannelBody({ channel }: { channel: PlaygroundChannelRecord }) {
  const messages = getPlaygroundConversationMessages(channel.id);
  return messages.length ? (
    <ConversationBody messages={messages} />
  ) : (
    <NewChannelBody channel={channel} />
  );
}

function ConversationBody({ messages }: { messages: readonly PlaygroundMessage[] }) {
  const unreadCount = messages.filter((message) => message.unread).length;

  return (
    <ConversationPanelBody>
      <PlaygroundMessageList>
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
        {messages.map((message) => {
          const thread = getPlaygroundThread(message.id)?.thread;
          return (
            <PlaygroundMessageRow
              key={message.id}
              message={message}
              threadId={thread ? message.id : undefined}
              footer={
                thread ? (
                  thread.unreadCount ? (
                    <PlaygroundUnreadRepliesBadge threadId={message.id} />
                  ) : (
                    <PlaygroundRepliesBadge threadId={message.id} />
                  )
                ) : null
              }
            />
          );
        })}
        <div className="pb-3" aria-hidden />
      </PlaygroundMessageList>
    </ConversationPanelBody>
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
