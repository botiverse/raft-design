import { useState, type ReactNode } from "react";
import { ListTodo, MessageSquare, Paperclip } from "lucide-react";
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsIndicator,
  TabsLabel,
} from "raft-ui";
import {
  ConversationPanelBody,
  ConversationPanelContent,
  MessageList,
  ConversationPanelRoot,
  ConversationPanelTabs,
  MessageListDateDivider,
  MessageListNotice,
} from "raft-ui/wip";

import { MessageTextSelectionComposition } from "#/modules/message-item/compositions/selection.compositions.tsx";
import { PlaygroundMainComposer } from "./playground-composer.tsx";
import { PlaygroundSingleComposerMentionProvider } from "./playground-composer-mentions.tsx";
import { PlaygroundConversationPanelHeader } from "./playground-conversation-panel-header.tsx";
import {
  usePlaygroundNavigation,
  type PlaygroundPanelTab,
} from "./playground-navigation-state.tsx";
import { PlaygroundFilesPanel } from "./playground-files-panel.tsx";
import { PlaygroundTasksPanel } from "./playground-tasks-panel.tsx";
import { MatrixBody } from "./playground-message-matrix.tsx";
import { IncidentBody, ProjUiuxBody, ReleaseBody } from "./playground-message-scenarios.tsx";
import {
  PlaygroundMessageRow,
  PlaygroundRepliesBadge,
  PlaygroundUnreadRepliesBadge,
} from "./playground-message-row.tsx";
import {
  getPlaygroundThread,
  type PlaygroundChannel,
  type PlaygroundChannelRecord,
  type PlaygroundMessage,
  type PlaygroundShowcasePreset,
} from "./mock/index.ts";

const TAB_META: Record<PlaygroundPanelTab, { icon: ReactNode; label: string }> = {
  chat: { icon: <MessageSquare />, label: "Chat" },
  tasks: { icon: <ListTodo />, label: "Tasks" },
  files: { icon: <Paperclip />, label: "Files" },
};

export function PlaygroundConversationPanel({ channel }: { channel: PlaygroundChannelRecord }) {
  const { panelTab, selectPanelTab } = usePlaygroundNavigation();
  const [tabOrder, setTabOrder] = useState<PlaygroundPanelTab[]>(["chat", "tasks", "files"]);
  const composerLabel =
    channel.kind === "dm" ? `Message @${channel.name}` : `Message #${channel.name}`;

  return (
    <ConversationPanelRoot>
      <PlaygroundConversationPanelHeader channel={channel} />
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

function ShowcaseBody({ preset }: { preset: PlaygroundShowcasePreset }) {
  switch (preset) {
    case "rich":
      return <ProjUiuxBody />;
    case "incident":
      return <IncidentBody />;
    case "release":
      return <ReleaseBody />;
    case "matrix":
      return <MatrixBody />;
  }
}

function ChannelBody({ channel }: { channel: PlaygroundChannel }) {
  switch (channel.content.kind) {
    case "messages":
      return <ConversationBody messages={channel.content.messages} />;
    case "showcase":
      return <ShowcaseBody preset={channel.content.preset} />;
    case "empty":
      return <NewChannelBody channel={channel} />;
  }
}

function ConversationBody({ messages }: { messages: readonly PlaygroundMessage[] }) {
  const unreadCount = messages.filter((message) => message.unread).length;

  return (
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
      </MessageList>
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
