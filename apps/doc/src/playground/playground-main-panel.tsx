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

import { MessageTextSelectionComposition } from "#/compositions/message-item/message-selection-compositions.tsx";
import { PlaygroundMainComposer } from "./playground-composer.tsx";
import { PlaygroundMainPanelHeader } from "./playground-main-panel-header.tsx";
import { PlaygroundTasksPanel } from "./playground-tasks-panel.tsx";
import { MatrixBody } from "./playground-message-matrix.tsx";
import { IncidentBody, ProjUiuxBody, ReleaseBody } from "./playground-message-scenarios.tsx";
import {
  PlaygroundMessageRow,
  PlaygroundRepliesBadge,
  PlaygroundUnreadRepliesBadge,
} from "./playground-message-row.tsx";
import {
  getPlaygroundActor,
  getPlaygroundThread,
  type PlaygroundChannel,
  type PlaygroundMessage,
  type PlaygroundScenarioId,
} from "./mock/index.ts";

type PanelTab = "chat" | "tasks" | "files";

const TAB_META: Record<PanelTab, { icon: ReactNode; label: string }> = {
  chat: { icon: <MessageSquare />, label: "Chat" },
  tasks: { icon: <ListTodo />, label: "Tasks" },
  files: { icon: <Paperclip />, label: "Files" },
};

export function PlaygroundMainPanel({ channel }: { channel: PlaygroundChannel }) {
  const [tab, setTab] = useState<PanelTab>("chat");
  const [tabOrder, setTabOrder] = useState<PanelTab[]>(["chat", "tasks", "files"]);
  const composerLabel =
    channel.kind === "dm" ? `Message @${channel.name}` : `Message #${channel.name}`;
  const uploads = channel.content.kind === "scenario" && channel.content.scenario === "incident";

  return (
    <ChatMainPanelRoot>
      <PlaygroundMainPanelHeader channel={channel} />
      <ChatMainPanelContent>
        <ChatMainPanelTabs render={<Tabs value={tab} onValueChange={setTab} />}>
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
        {tab === "chat" ? (
          <>
            <MessageTextSelectionComposition>
              <ChannelBody channel={channel} />
            </MessageTextSelectionComposition>
            <PlaygroundMainComposer channel={channel} label={composerLabel} uploads={uploads} />
          </>
        ) : tab === "tasks" ? (
          <PlaygroundTasksPanel channel={channel} />
        ) : (
          <TabPlaceholder
            icon={<Paperclip />}
            title="No files yet"
            description="Attach files in Chat, or drag files into the message composer. They will appear here after the message is sent."
          />
        )}
      </ChatMainPanelContent>
    </ChatMainPanelRoot>
  );
}

function ScenarioBody({ scenario }: { scenario: PlaygroundScenarioId }) {
  switch (scenario) {
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
    case "scenario":
      return <ScenarioBody scenario={channel.content.scenario} />;
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
            const actor = getPlaygroundActor(message.authorId);
            const thread = getPlaygroundThread(message.id)?.thread;
            return (
              <PlaygroundMessageRow
                key={message.id}
                variant={actor.type === "agent" ? "agent" : "member"}
                sender={actor.name}
                meta={actor.meta}
                time={message.time}
                body={message.body}
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

function TabPlaceholder({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <ChatMainPanelBody>
      <div className="flex h-full items-center justify-center">
        <EmptyState>
          <EmptyStateIcon>{icon}</EmptyStateIcon>
          <EmptyStateContent>
            <EmptyStateTitle>{title}</EmptyStateTitle>
            <EmptyStateDescription>{description}</EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </div>
    </ChatMainPanelBody>
  );
}
