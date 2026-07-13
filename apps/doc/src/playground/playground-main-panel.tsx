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
  ChatMainPanelBody,
  ChatMainPanelContent,
  ChatMainPanelMessageList,
  ChatMainPanelRoot,
  ChatMainPanelTabs,
  ChatMainPanelTimeline,
  MessageTimelineDateDivider,
  MessageTimelineNotice,
} from "raft-ui/wip";

import { MessageTextSelectionComposition } from "#/modules/message-item/compositions/selection.compositions.tsx";
import { PlaygroundMainComposer } from "./playground-composer.tsx";
import { PlaygroundSingleComposerMentionProvider } from "./playground-composer-mentions.tsx";
import { PlaygroundMainPanelHeader } from "./playground-main-panel-header.tsx";
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

export function PlaygroundMainPanel({ channel }: { channel: PlaygroundChannelRecord }) {
  const { panelTab, selectPanelTab } = usePlaygroundNavigation();
  const [tabOrder, setTabOrder] = useState<PlaygroundPanelTab[]>(["chat", "tasks", "files"]);
  const composerLabel =
    channel.kind === "dm" ? `Message @${channel.name}` : `Message #${channel.name}`;

  return (
    <ChatMainPanelRoot>
      <PlaygroundMainPanelHeader channel={channel} />
      <ChatMainPanelContent>
        <ChatMainPanelTabs render={<Tabs value={panelTab} onValueChange={selectPanelTab} />}>
          <SortableTabsList value={tabOrder} onReorder={setTabOrder} variant="underline">
            {tabOrder.map((id) => (
              <SortableTabsTab key={id} value={id}>
                {TAB_META[id].icon}
                <TabsLabel>{TAB_META[id].label}</TabsLabel>
              </SortableTabsTab>
            ))}
            <TabsIndicator />
          </SortableTabsList>
        </ChatMainPanelTabs>
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
      </ChatMainPanelContent>
    </ChatMainPanelRoot>
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
  return (
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <div className="px-3 pt-3">
            <MessageTimelineNotice>Beginning of messages</MessageTimelineNotice>
          </div>
          <MessageTimelineDateDivider>Today</MessageTimelineDateDivider>
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
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
    </ChatMainPanelBody>
  );
}

function NewChannelBody({ channel }: { channel: PlaygroundChannel }) {
  return (
    <ChatMainPanelBody>
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
    </ChatMainPanelBody>
  );
}
