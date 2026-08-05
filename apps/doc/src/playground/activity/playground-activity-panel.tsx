import {
  AppShellMainSlot,
  AppShellPanelSlot,
  AppShellSidebarSlot,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
  useThemeFamily,
} from "raft-ui";
import { useEffect, useMemo, useRef } from "react";

import { type ActivityCompositionItem } from "#/modules/activity/activity.fixtures.ts";
import { ActivityInboxComposition } from "#/modules/activity/compositions/activity-inbox.composition.tsx";

import {
  getPlaygroundActor,
  getPlaygroundChannel,
  getPlaygroundThread,
  isPlaygroundDmId,
  isPlaygroundThreadId,
  type PlaygroundActivity,
} from "../mock/index.ts";
import {
  usePlaygroundDesktop,
  usePlaygroundWideDesktop,
} from "../app-shell/use-playground-desktop.ts";
import { PlaygroundChannelPanel } from "../conversation/playground-channel-panel.tsx";
import { PlaygroundDmPanel } from "../conversation/playground-dm-panel.tsx";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { PlaygroundThreadPanel } from "../thread/playground-thread-panel.tsx";
import { usePlaygroundActivityState } from "./activity-state.tsx";

const activityContentPrefix = "activity:";
const activityConversationPrefix = "activity-conversation:";
const threadContextPrefix = "thread:";

export function PlaygroundActivityPanel() {
  const theme = useThemeFamily();
  const isDesktop = usePlaygroundDesktop();
  const hasContextColumn = usePlaygroundWideDesktop();
  const { items, setItems } = usePlaygroundActivityState();
  const { contentId, contextId, selectContent, selectContext, selectRailView } =
    usePlaygroundNavigation();
  const activationTimerRef = useRef<number | null>(null);
  const compositionItems = useMemo(() => items.map(toCompositionItem), [items]);
  const activeItemId = contentId?.startsWith(activityConversationPrefix)
    ? contentId.slice(activityConversationPrefix.length)
    : contentId?.startsWith(activityContentPrefix)
      ? contentId.slice(activityContentPrefix.length)
      : undefined;
  const showConversation = contentId?.startsWith(activityConversationPrefix) ?? false;
  const activeItem = items.find((item) => item.id === activeItemId);
  const activeChannel = activeItem ? getPlaygroundChannel(activeItem.channelId) : undefined;
  const activeCompositionItem = compositionItems.find((item) => item.id === activeItemId);
  const activeThreadContext =
    activeItem && activeCompositionItem?.kind === "thread" && !showConversation
      ? getPlaygroundThread(activeItem.messageId)
      : undefined;
  const contextualThreadId = contextId?.startsWith(threadContextPrefix)
    ? contextId.slice(threadContextPrefix.length)
    : undefined;
  const contextualThread =
    contextualThreadId && isPlaygroundThreadId(contextualThreadId)
      ? getPlaygroundThread(contextualThreadId)
      : undefined;

  useEffect(
    () => () => {
      if (activationTimerRef.current !== null) {
        window.clearTimeout(activationTimerRef.current);
      }
    },
    [],
  );

  function commitCompositionItems(nextItems: readonly ActivityCompositionItem[]) {
    const nextById = new Map(nextItems.map((item) => [item.id, item]));
    setItems((current) =>
      current.map((item) => {
        const next = nextById.get(item.id);
        return next
          ? {
              ...item,
              unread: next.unreadCount > 0,
              saved: next.saved,
              done: next.done,
              following: next.following,
            }
          : item;
      }),
    );
  }

  function markRead(itemId: string) {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, unread: false } : item)),
    );
  }

  function activateItem(item: ActivityCompositionItem) {
    const source = items.find((activity) => activity.id === item.id);
    if (activationTimerRef.current !== null) {
      window.clearTimeout(activationTimerRef.current);
    }

    activationTimerRef.current = window.setTimeout(() => {
      activationTimerRef.current = null;
      markRead(item.id);
      selectContent(`${activityContentPrefix}${item.id}`, {
        surface:
          item.kind === "thread" && source
            ? `thread:${source.messageId}`
            : `conversation:${item.channelId}`,
      });
    }, 160);
  }

  const master = (
    <ActivityInboxComposition
      items={compositionItems}
      layout={isDesktop ? "wide" : "compact"}
      openItemId={activeItemId ?? null}
      onItemsChange={commitCompositionItems}
      onBack={() => selectRailView("chat")}
      onOpenItem={activateItem}
    />
  );

  const openContextThread = (threadId: string) =>
    selectContext(`${threadContextPrefix}${threadId}`);
  const content = activeThreadContext ? (
    <PlaygroundThreadPanel
      key={activeThreadContext.thread.parent.id}
      channel={activeThreadContext.channel}
      thread={activeThreadContext.thread}
      onClose={() => selectContent(undefined)}
      onViewConversation={() =>
        selectContent(`${activityConversationPrefix}${activeItemId}`, {
          surface: `conversation:${activeChannel?.id}`,
        })
      }
    />
  ) : activeChannel?.kind === "dm" ? (
    <PlaygroundDmPanel
      key={activeChannel.id}
      dm={activeChannel}
      onBack={() => selectContent(undefined)}
      onOpenThread={openContextThread}
    />
  ) : activeChannel ? (
    <PlaygroundChannelPanel
      key={activeChannel.id}
      channel={activeChannel}
      onBack={() => selectContent(undefined)}
      onOpenThread={openContextThread}
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
      <ResizableHandle />
      <ResizablePanel id="playground-activity-content" minSize={320} className="relative min-w-0">
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
          <ResizableHandle className="z-50" />
          <ResizablePanel
            id="playground-activity-context"
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

function toCompositionItem(activity: PlaygroundActivity): ActivityCompositionItem {
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
