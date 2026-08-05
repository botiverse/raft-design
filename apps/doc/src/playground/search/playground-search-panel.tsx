import { ChevronLeft, Monitor } from "lucide-react";
import {
  Button,
  AppShellMainSlot,
  AppShellPanelSlot,
  AppShellSidebarSlot,
  ConversationPanelBody,
  ConversationPanelContent,
  ConversationPanelRoot,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
  useThemeFamily,
} from "raft-ui";
import { useEffect, useState } from "react";

import { BrutalSearchPanelComposition } from "#/modules/search/compositions/brutal-search-panel.composition.tsx";
import type {
  SearchChannelFixture,
  SearchEntityFixture,
  SearchMessageFixture,
  SearchSenderFixture,
} from "#/modules/search/search.fixtures.ts";

import {
  PLAYGROUND_ACTORS,
  PLAYGROUND_CHANNELS,
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_MACHINES,
  getPlaygroundActor,
  getPlaygroundChannel,
  getPlaygroundThread,
  isPlaygroundChatMessage,
  isPlaygroundChannelId,
  isPlaygroundThreadId,
  type PlaygroundChatMessage,
} from "../mock/index.ts";
import { PLAYGROUND_CONVERSATIONS } from "../mock/conversations.ts";
import {
  usePlaygroundDesktop,
  usePlaygroundWideDesktop,
} from "../app-shell/use-playground-desktop.ts";
import { MemberDetailPanel } from "../browse/member-detail-panel.tsx";
import { memberDetailId } from "../browse/member-selection.ts";
import { PlaygroundChannelPanel } from "../conversation/playground-channel-panel.tsx";
import { PlaygroundDmPanel } from "../conversation/playground-dm-panel.tsx";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { PlaygroundThreadPanel } from "../thread/playground-thread-panel.tsx";
import { PLAYGROUND_SEARCH_FOCUS_EVENT } from "./playground-search-focus.ts";

const PLAYGROUND_SEARCH_COMPUTERS: readonly SearchEntityFixture[] = PLAYGROUND_MACHINES.map(
  (machine) => ({
    key: `computer:${machine.id}`,
    type: "computer",
    title: machine.name,
    subtitle: { kind: "computer", hostname: null },
    fields: [{ value: machine.name, priority: 0 }],
    channelId: null,
    machineId: machine.id,
    agentId: null,
    userId: null,
  }),
);

const PLAYGROUND_SEARCH_SENDERS: readonly SearchSenderFixture[] = PLAYGROUND_ACTORS.map(
  (actor) => ({
    id: actor.id,
    kind: actor.type,
    label: actor.name,
    handle: actor.id,
    isCurrentUser: actor.id === "cuvii" || undefined,
  }),
);

const PLAYGROUND_SEARCH_CHANNELS: readonly SearchChannelFixture[] = PLAYGROUND_CHANNELS.map(
  (channel) => ({
    id: channel.id,
    kind: channel.kind === "dm" ? "dm" : "channel",
    name: channel.name,
    archivedAt: channel.archived ? "2026-05-01T08:00:00.000Z" : undefined,
  }),
);

const channelEntities: readonly SearchEntityFixture[] = PLAYGROUND_CHANNELS.filter(
  (channel) => channel.kind !== "dm",
).map((channel) => ({
  key: `channel:${channel.id}`,
  type: "channel",
  title: channel.name,
  subtitle: { kind: "channel" },
  fields: [
    { value: channel.name, priority: 0 },
    { value: channel.subtitle, priority: 3 },
  ],
  channelId: channel.id,
  machineId: null,
  agentId: null,
  userId: null,
  archivedAt: channel.archived ? "2026-05-01T08:00:00.000Z" : undefined,
}));

const actorEntities: readonly SearchEntityFixture[] = PLAYGROUND_ACTORS.map((actor) => ({
  key: `${actor.type === "agent" ? "agent" : "human"}:${actor.id}`,
  type: actor.type === "agent" ? "agentDm" : "humanDm",
  title: actor.name,
  subtitle:
    actor.id === "cuvii"
      ? { kind: "selfDm" }
      : actor.type === "agent"
        ? { kind: "text", text: `@${actor.id}` }
        : "description" in actor && actor.description
          ? { kind: "text", text: actor.description }
          : { kind: "text", text: actor.meta },
  fields: [
    { value: actor.name, priority: 0 },
    { value: actor.id, priority: 1 },
    {
      value: `${actor.meta} ${"presence" in actor ? actor.presence : ""}`,
      priority: 3,
    },
  ],
  channelId:
    PLAYGROUND_DIRECT_MESSAGES.find((channel) => channel.otherActorId === actor.id)?.id ?? null,
  machineId: null,
  agentId: actor.type === "agent" ? actor.id : null,
  userId: actor.type === "human" ? actor.id : null,
}));

const PLAYGROUND_SEARCH_ENTITIES: readonly SearchEntityFixture[] = [
  ...channelEntities,
  ...actorEntities,
  ...PLAYGROUND_SEARCH_COMPUTERS,
];

const SEARCH_DATE_BASE = Date.parse("2026-05-30T12:00:00.000Z");

function toSearchMessage(
  channelId: string,
  message: PlaygroundChatMessage,
  sequence: number,
  thread?: {
    id: string;
    parentMessageId: string;
    parentMessageContent: string;
  },
): SearchMessageFixture {
  const normalizedBody = message.content.toLocaleLowerCase();
  return {
    id: message.id,
    channelId,
    senderId: message.senderId,
    content: message.content,
    createdAt:
      message.createdAtDateTime ??
      new Date(SEARCH_DATE_BASE - sequence * 11 * 60 * 1000).toISOString(),
    mentions: normalizedBody.includes("cuvii") ? ["cuvii"] : [],
    threadId: thread?.id ?? null,
    parentMessageId: thread?.parentMessageId ?? null,
    parentMessageContent: thread?.parentMessageContent ?? null,
  };
}

function buildSearchMessages(): readonly SearchMessageFixture[] {
  let sequence = 0;
  const messages: SearchMessageFixture[] = [];

  for (const {
    conversation: channel,
    messages: conversationMessages,
    threads,
  } of PLAYGROUND_CONVERSATIONS) {
    const threadMessageIds = new Set(
      threads.flatMap((thread) => [thread.parent.id, ...thread.replies.map((reply) => reply.id)]),
    );

    for (const message of conversationMessages) {
      if (threadMessageIds.has(message.id)) continue;
      if (!isPlaygroundChatMessage(message)) continue;
      messages.push(toSearchMessage(channel.id, message, sequence++));
    }

    for (const thread of threads) {
      const threadFixture = {
        id: thread.parent.id,
        parentMessageId: thread.parent.id,
        parentMessageContent: thread.parent.content,
      };
      messages.push(toSearchMessage(channel.id, thread.parent, sequence++, threadFixture));
      for (const reply of thread.replies) {
        messages.push(toSearchMessage(channel.id, reply, sequence++, threadFixture));
      }
    }
  }

  return messages;
}

const PLAYGROUND_SEARCH_MESSAGES = buildSearchMessages();
const searchEntityPrefix = "search-entity:";
const searchMessagePrefix = "search-message:";
const searchConversationPrefix = "search-conversation:";
const threadContextPrefix = "thread:";
type SelectContent = (id?: string, options?: { hash?: string; surface?: string }) => void;

export function PlaygroundSearchPanel() {
  const theme = useThemeFamily();
  const isDesktop = usePlaygroundDesktop();
  const hasContextColumn = usePlaygroundWideDesktop();
  const {
    contentId,
    contextId,
    searchQuery,
    selectContent,
    selectContext,
    selectRailView,
    setSearchQuery,
  } = usePlaygroundNavigation();
  const [focusRequestKey, setFocusRequestKey] = useState(0);
  const activeEntityKey = contentId?.startsWith(searchEntityPrefix)
    ? contentId.slice(searchEntityPrefix.length)
    : undefined;
  const activeMessageId = contentId?.startsWith(searchMessagePrefix)
    ? contentId.slice(searchMessagePrefix.length)
    : undefined;
  const activeEntity = PLAYGROUND_SEARCH_ENTITIES.find((entity) => entity.key === activeEntityKey);
  const activeMessage = PLAYGROUND_SEARCH_MESSAGES.find(
    (message) => message.id === activeMessageId,
  );
  const activeConversationId = contentId?.startsWith(searchConversationPrefix)
    ? contentId.slice(searchConversationPrefix.length)
    : undefined;
  const contextualThreadId = contextId?.startsWith(threadContextPrefix)
    ? contextId.slice(threadContextPrefix.length)
    : undefined;
  const contextualThread =
    contextualThreadId && isPlaygroundThreadId(contextualThreadId)
      ? getPlaygroundThread(contextualThreadId)
      : undefined;

  useEffect(() => {
    const requestFocus = () => setFocusRequestKey((current) => current + 1);
    window.addEventListener(PLAYGROUND_SEARCH_FOCUS_EVENT, requestFocus);
    return () => window.removeEventListener(PLAYGROUND_SEARCH_FOCUS_EVENT, requestFocus);
  }, []);

  const master = (
    <BrutalSearchPanelComposition
      entities={PLAYGROUND_SEARCH_ENTITIES}
      messages={PLAYGROUND_SEARCH_MESSAGES}
      senders={PLAYGROUND_SEARCH_SENDERS}
      channels={PLAYGROUND_SEARCH_CHANNELS}
      defaultQuery=""
      query={searchQuery}
      selectedKey={activeEntityKey ?? (activeMessageId ? `message:${activeMessageId}` : null)}
      onQueryChange={setSearchQuery}
      focusRequestKey={focusRequestKey}
      onBack={() => selectRailView("chat")}
      onOpenEntity={(entity) =>
        selectContent(`${searchEntityPrefix}${entity.key}`, {
          surface: getSearchEntitySurface(entity),
        })
      }
      onOpenMessage={(message) =>
        selectContent(`${searchMessagePrefix}${message.id}`, {
          hash: message.threadId ? `thread-message-${message.id}` : `message-${message.id}`,
          surface: getSearchMessageSurface(message),
        })
      }
    />
  );

  const openContextThread = (threadId: string) =>
    selectContext(`${threadContextPrefix}${threadId}`);
  const content =
    activeConversationId && isPlaygroundChannelId(activeConversationId)
      ? renderConversationContent(activeConversationId, selectContent, openContextThread)
      : activeEntity
        ? renderEntityContent(activeEntity, selectContent, openContextThread)
        : activeMessage
          ? renderMessageContent(activeMessage, selectContent, openContextThread)
          : undefined;
  const context = contextualThread ? (
    <PlaygroundThreadPanel
      key={contextualThread.thread.parent.id}
      channel={contextualThread.channel}
      thread={contextualThread.thread}
      onClose={() => selectContext(undefined)}
      onViewConversation={() => selectContext(undefined)}
    />
  ) : undefined;

  if (!isDesktop) {
    return (
      <AppShellMainSlot className="h-full w-full bg-transparent">
        {context ?? content ?? master}
      </AppShellMainSlot>
    );
  }

  if (!content) {
    return <AppShellMainSlot className="flex h-full min-w-0 flex-1">{master}</AppShellMainSlot>;
  }

  return (
    <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
      <ResizablePanel
        id="playground-search-master"
        defaultSize={560}
        minSize={400}
        maxSize={720}
        groupResizeBehavior="preserve-pixel-size"
        className="relative min-w-0"
      >
        <AppShellSidebarSlot className="relative flex h-full w-auto min-w-0 flex-1">
          {master}
        </AppShellSidebarSlot>
      </ResizablePanel>
      <ResizableHandle className={theme === "elegant" ? "translate-x-[14px]" : undefined} />
      <ResizablePanel id="playground-search-content" minSize={320} className="relative min-w-0">
        <AppShellMainSlot className="flex h-full min-w-0 flex-1">
          {content}
          {context && !hasContextColumn ? (
            <div
              className={
                theme === "brutal"
                  ? "absolute inset-0 z-20 flex min-h-0 min-w-0 border-l-2 border-black bg-white"
                  : "absolute inset-0 z-20 flex min-h-0 min-w-0 bg-layer-panel"
              }
            >
              {context}
            </div>
          ) : null}
        </AppShellMainSlot>
      </ResizablePanel>
      {context && hasContextColumn ? (
        <>
          <ResizableHandle className={theme === "elegant" ? "z-50 translate-x-[7px]" : "z-50"} />
          <ResizablePanel
            id="playground-search-context"
            defaultSize={400}
            minSize={360}
            maxSize="60vw"
            groupResizeBehavior="preserve-pixel-size"
            className="relative z-20 min-w-0 !overflow-visible"
          >
            <AppShellPanelSlot className="flex h-full min-w-0 flex-1">{context}</AppShellPanelSlot>
          </ResizablePanel>
        </>
      ) : null}
    </ResizableGroup>
  );
}

function renderEntityContent(
  entity: SearchEntityFixture,
  selectContent: SelectContent,
  onOpenThread: (threadId: string) => void,
) {
  if (entity.channelId && isPlaygroundChannelId(entity.channelId)) {
    return renderConversationContent(entity.channelId, selectContent, onOpenThread);
  }

  const actorId = entity.agentId ?? entity.userId;
  const actor = PLAYGROUND_ACTORS.find((candidate) => candidate.id === actorId);
  if (actor) {
    return (
      <MemberDetailPanel
        key={actor.id}
        actor={getPlaygroundActor(actor.id)}
        onBack={() => selectContent(undefined)}
        onClose={() => selectContent(undefined)}
        onSelectActor={(nextActor) =>
          selectContent(
            `${searchEntityPrefix}${
              nextActor.type === "agent"
                ? memberDetailId.agent(nextActor.id)
                : memberDetailId.human(nextActor.id)
            }`,
            { surface: `member:${nextActor.id}` },
          )
        }
      />
    );
  }

  return <SearchMachineContent title={entity.title} onBack={() => selectContent(undefined)} />;
}

function renderConversationContent(
  channelId: string,
  selectContent: SelectContent,
  onOpenThread: (threadId: string) => void,
) {
  if (!isPlaygroundChannelId(channelId)) return undefined;
  const channel = getPlaygroundChannel(channelId);
  return channel.kind === "dm" ? (
    <PlaygroundDmPanel
      key={channel.id}
      dm={channel}
      onBack={() => selectContent(undefined)}
      onOpenThread={onOpenThread}
    />
  ) : (
    <PlaygroundChannelPanel
      key={channel.id}
      channel={channel}
      onBack={() => selectContent(undefined)}
      onOpenThread={onOpenThread}
    />
  );
}

function renderMessageContent(
  message: SearchMessageFixture,
  selectContent: SelectContent,
  onOpenThread: (threadId: string) => void,
) {
  if (!isPlaygroundChannelId(message.channelId)) return undefined;
  if (message.threadId && isPlaygroundThreadId(message.threadId)) {
    const thread = getPlaygroundThread(message.threadId);
    if (thread) {
      return (
        <PlaygroundThreadPanel
          key={thread.thread.parent.id}
          channel={thread.channel}
          thread={thread.thread}
          onClose={() => selectContent(undefined)}
          onViewConversation={() =>
            selectContent(`${searchConversationPrefix}${thread.channel.id}`, {
              surface: `conversation:${thread.channel.id}`,
            })
          }
        />
      );
    }
  }

  return renderConversationContent(message.channelId, selectContent, onOpenThread);
}

function getSearchEntitySurface(entity: SearchEntityFixture) {
  if (entity.channelId) return `conversation:${entity.channelId}`;
  if (entity.agentId) return `member:${entity.agentId}`;
  if (entity.userId) return `member:${entity.userId}`;
  return entity.machineId ? `machine:${entity.machineId}` : entity.key;
}

function getSearchMessageSurface(message: SearchMessageFixture) {
  return message.threadId ? `thread:${message.threadId}` : `conversation:${message.channelId}`;
}

function SearchMachineContent({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <ConversationPanelRoot>
      <ConversationPanelContent>
        <ConversationPanelBody>
          <div className="relative flex h-full items-center justify-center p-6">
            <Button
              className="absolute top-4 left-4 md:hidden"
              size="sm"
              variant="outline"
              onClick={onBack}
            >
              <ChevronLeft aria-hidden />
              Back to Search
            </Button>
            <EmptyState>
              <EmptyStateIcon>
                <Monitor />
              </EmptyStateIcon>
              <EmptyStateContent>
                <EmptyStateTitle>{title}</EmptyStateTitle>
                <EmptyStateDescription>
                  Managed computer available in this workspace.
                </EmptyStateDescription>
              </EmptyStateContent>
            </EmptyState>
          </div>
        </ConversationPanelBody>
      </ConversationPanelContent>
    </ConversationPanelRoot>
  );
}
