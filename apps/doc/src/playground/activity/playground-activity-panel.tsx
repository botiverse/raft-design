import {
  AppShellMainSlot,
  AppShellOverlaySlot,
  AppShellPanelSlot,
  AppShellSidebarSlot,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
  useThemeFamily,
} from "raft-ui";
import { useEffect, useMemo, useRef } from "react";

import type { ActivityCompositionItem } from "#/modules/activity/activity.fixtures.ts";
import { ActivityInboxComposition } from "#/modules/activity/compositions/activity-inbox.composition.tsx";

import {
  getPlaygroundActor,
  getPlaygroundChannel,
  getPlaygroundTopicChannel,
  getPlaygroundThread,
  isPlaygroundDmId,
  isPlaygroundThreadId,
} from "../mock/index.ts";
import type { PlaygroundTopic } from "../mock/index.ts";
import {
  usePlaygroundDesktop,
  usePlaygroundWideDesktop,
} from "../app-shell/use-playground-desktop.ts";
import { PlaygroundChannelPanel } from "../conversation/playground-channel-panel.tsx";
import { PlaygroundDmPanel } from "../conversation/playground-dm-panel.tsx";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { PlaygroundThreadPanel } from "../thread/playground-thread-panel.tsx";
import { PlaygroundTopicPanel } from "../topics/topic-panel.tsx";
import { usePlaygroundTopicState } from "../topics/use-playground-topic-state.ts";
import { usePlaygroundActivityState } from "./activity-state.tsx";
import type { PlaygroundActivityItem } from "./activity-state.tsx";

const activityContentPrefix = "activity:";
const activityConversationPrefix = "activity-conversation:";
const threadContextPrefix = "thread:";

export function PlaygroundActivityPanel() {
  const theme = useThemeFamily();
  const isDesktop = usePlaygroundDesktop();
  const hasContextColumn = usePlaygroundWideDesktop();
  const { items, applyChanges, markItemRead } = usePlaygroundActivityState();
  const { topics } = usePlaygroundTopicState();
  const { contentId, contextId, selectContent, selectContext, selectRailView } =
    usePlaygroundNavigation();
  const activationTimerRef = useRef<number | null>(null);
  const compositionItems = useMemo(
    () => items.map((item) => toCompositionItem(item, topics)),
    [items, topics],
  );
  const { activeItemId, showConversation } = parseActivityContentId(contentId);
  const activeItem = items.find((item) => item.id === activeItemId);
  const activeCompositionItem = compositionItems.find((item) => item.id === activeItemId);
  const contextualThread = getContextualThread(contextId);

  useEffect(
    () => () => {
      if (activationTimerRef.current !== null) {
        window.clearTimeout(activationTimerRef.current);
      }
    },
    [],
  );

  function commitCompositionItems(nextItems: readonly ActivityCompositionItem[]) {
    applyChanges(
      new Map(
        nextItems.map((item) => [
          item.id,
          {
            unread: item.unreadCount > 0,
            saved: item.saved,
            done: item.done,
            following: item.following,
          },
        ]),
      ),
    );
  }

  function activateItem(item: ActivityCompositionItem, _detail: number) {
    const source = items.find((activity) => activity.id === item.id);
    if (activationTimerRef.current !== null) {
      window.clearTimeout(activationTimerRef.current);
      activationTimerRef.current = null;
    }

    if (activeItemId === item.id) {
      selectContent(undefined);
      return;
    }

    activationTimerRef.current = window.setTimeout(() => {
      activationTimerRef.current = null;
      markItemRead(item.id);
      selectContent(`${activityContentPrefix}${item.id}`, {
        surface:
          source?.source === "topic"
            ? `topic:${source.topicId}`
            : item.kind === "thread" && source
              ? `thread:${source.messageId}`
              : `conversation:${item.channelId}`,
      });
    }, 160);
  }

  const master = (
    <ActivityInboxComposition
      items={compositionItems}
      openItemId={activeItemId ?? null}
      onItemsChange={commitCompositionItems}
      onBack={() => selectRailView("chat")}
      onOpenItem={activateItem}
    />
  );

  const openContextThread = (threadId: string) =>
    selectContext(`${threadContextPrefix}${threadId}`);
  const content = activeItem ? (
    <PlaygroundActivityContent
      item={activeItem}
      kind={activeCompositionItem?.kind}
      showConversation={showConversation}
      topics={topics}
      onClose={() => selectContent(undefined)}
      onOpenThread={openContextThread}
      onViewConversation={(channelId) =>
        selectContent(`${activityConversationPrefix}${activeItem.id}`, {
          surface: `conversation:${channelId}`,
        })
      }
    />
  ) : undefined;
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
      <AppShellMainSlot className="size-full ">{context ?? content ?? master}</AppShellMainSlot>
    );
  }

  if (!content) {
    return <AppShellMainSlot className="flex h-full min-w-0 flex-1">{master}</AppShellMainSlot>;
  }

  return (
    <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
      <ResizablePanel
        id="playground-activity-master"
        defaultSize={560}
        minSize={480}
        maxSize={720}
        groupResizeBehavior="preserve-pixel-size"
        className="relative min-w-0"
      >
        <AppShellSidebarSlot className="relative flex h-full w-auto min-w-0 flex-1">
          {master}
        </AppShellSidebarSlot>
      </ResizablePanel>
      <ResizableHandle className={theme === "elegant" ? "translate-x-[10px]" : undefined} />
      <ResizablePanel id="playground-activity-content" minSize={320} className="relative min-w-0">
        <AppShellMainSlot overlay className="flex h-full min-w-0 flex-1">
          {content}
          {context && !hasContextColumn ? (
            <AppShellOverlaySlot>{context}</AppShellOverlaySlot>
          ) : null}
        </AppShellMainSlot>
      </ResizablePanel>
      {context && hasContextColumn ? (
        <>
          <ResizableHandle className={theme === "elegant" ? "z-50 translate-x-[7px]" : "z-50"} />
          <ResizablePanel
            id="playground-activity-context"
            defaultSize={400}
            minSize={360}
            maxSize="60vw"
            groupResizeBehavior="preserve-pixel-size"
            className="relative z-20 min-w-0 overflow-visible!"
          >
            <AppShellPanelSlot className="flex h-full min-w-0 flex-1">{context}</AppShellPanelSlot>
          </ResizablePanel>
        </>
      ) : null}
    </ResizableGroup>
  );
}

function parseActivityContentId(contentId: string | undefined) {
  if (contentId?.startsWith(activityConversationPrefix)) {
    return {
      activeItemId: contentId.slice(activityConversationPrefix.length),
      showConversation: true,
    };
  }
  if (contentId?.startsWith(activityContentPrefix)) {
    return { activeItemId: contentId.slice(activityContentPrefix.length), showConversation: false };
  }
  return { activeItemId: undefined, showConversation: false };
}

function getContextualThread(contextId: string | undefined) {
  if (!contextId?.startsWith(threadContextPrefix)) return undefined;
  const threadId = contextId.slice(threadContextPrefix.length);
  return isPlaygroundThreadId(threadId) ? getPlaygroundThread(threadId) : undefined;
}

function PlaygroundActivityContent({
  item,
  kind,
  showConversation,
  topics,
  onClose,
  onOpenThread,
  onViewConversation,
}: {
  item: PlaygroundActivityItem;
  kind: ActivityCompositionItem["kind"] | undefined;
  showConversation: boolean;
  topics: readonly PlaygroundTopic[];
  onClose: () => void;
  onOpenThread: (threadId: string) => void;
  onViewConversation: (channelId: string) => void;
}) {
  if (item.source === "topic") {
    const topic = topics.find((candidate) => candidate.id === item.topicId);
    if (!topic) return null;
    return (
      <PlaygroundTopicPanel
        key={topic.id}
        channel={getPlaygroundTopicChannel(topic.channelId)}
        topic={topic}
        onClose={onClose}
      />
    );
  }

  const channel = getPlaygroundChannel(item.channelId);
  const threadContext =
    kind === "thread" && !showConversation ? getPlaygroundThread(item.messageId) : undefined;
  if (threadContext) {
    return (
      <PlaygroundThreadPanel
        key={threadContext.thread.parent.id}
        channel={threadContext.channel}
        thread={threadContext.thread}
        onClose={onClose}
        onViewConversation={() => onViewConversation(channel.id)}
      />
    );
  }
  return channel.kind === "dm" ? (
    <PlaygroundDmPanel
      key={channel.id}
      dm={channel}
      edge="attached"
      onBack={onClose}
      onOpenThread={onOpenThread}
    />
  ) : (
    <PlaygroundChannelPanel
      key={channel.id}
      channel={channel}
      edge="attached"
      onBack={onClose}
      onOpenThread={onOpenThread}
    />
  );
}

function toCompositionItem(
  activity: PlaygroundActivityItem,
  topics: readonly PlaygroundTopic[],
): ActivityCompositionItem {
  return activity.source === "topic"
    ? toTopicCompositionItem(activity, topics)
    : toChatCompositionItem(activity);
}

function toTopicCompositionItem(
  activity: Extract<PlaygroundActivityItem, { source: "topic" }>,
  topics: readonly PlaygroundTopic[],
): ActivityCompositionItem {
  const topic = topics.find((candidate) => candidate.id === activity.topicId);
  if (!topic) throw new Error(`Unknown activity topic: ${activity.topicId}`);
  const channel = getPlaygroundTopicChannel(topic.channelId);
  const actor = getPlaygroundActor(activity.actorId);
  const reply =
    activity.kind === "resolved"
      ? undefined
      : topic.replies.find((candidate) => candidate.id === activity.replyId);

  return {
    id: activity.id,
    kind: activity.kind === "mention" ? "mention_action" : "thread",
    channelKind: "channel",
    title: topic.title,
    // Topic channels are a separate namespace from chat channels.
    channelId: `topics:${channel.id}`,
    channelLabel: `#${channel.name}`,
    sender: actor.name,
    preview: reply ? reply.content : "Marked this topic as resolved.",
    timestamp: activity.occurredAt,
    sortAt: activity.sortAt,
    unreadCount: activity.unread ? 1 : 0,
    hasMention: activity.kind === "mention" || undefined,
    replyCount: topic.replies.length,
    saved: activity.saved,
    done: activity.done,
    following: activity.following,
  };
}

function toChatCompositionItem(
  activity: Extract<PlaygroundActivityItem, { source: "chat" }>,
): ActivityCompositionItem {
  const thread = getPlaygroundThread(activity.messageId);
  if (!thread) throw new Error(`Unknown activity thread: ${activity.messageId}`);
  const channel = getPlaygroundChannel(activity.channelId);
  const actor = getPlaygroundActor(activity.actorId);
  const kind =
    activity.kind === "mention" ? "mention_action" : isPlaygroundDmId(channel.id) ? "dm" : "thread";
  const preview =
    activity.kind === "reaction"
      ? `${activity.reaction} reacted to this conversation.`
      : (thread.thread.replies.at(-1)?.content ?? thread.thread.parent.content);

  return {
    id: activity.id,
    kind,
    channelKind: channel.kind === "dm" ? "dm" : "channel",
    title: kind === "thread" ? thread.thread.parent.content : channel.name,
    channelId: activity.channelId,
    channelLabel: channel.kind === "dm" ? channel.name : `#${channel.name}`,
    sender: actor.name,
    preview,
    timestamp: activity.occurredAt,
    sortAt: activity.sortAt,
    unreadCount: activity.unread ? 1 : 0,
    hasMention: activity.kind === "mention" || undefined,
    replyCount: kind === "thread" ? thread.thread.replies.length : undefined,
    saved: activity.saved,
    done: activity.done,
    following: activity.following,
  };
}
