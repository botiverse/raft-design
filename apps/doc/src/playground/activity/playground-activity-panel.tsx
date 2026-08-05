import { useNavigate } from "@tanstack/react-router";
import { ResizableGroup, ResizableHandle, ResizablePanel, useThemeFamily } from "raft-ui";
import { useEffect, useMemo, useRef, useState } from "react";

import { type ActivityCompositionItem } from "#/modules/activity/activity.fixtures.ts";
import { ActivityInboxComposition } from "#/modules/activity/compositions/activity-inbox.composition.tsx";

import {
  PLAYGROUND_SERVER_SLUG,
  getPlaygroundActor,
  getPlaygroundChannel,
  getPlaygroundThread,
  isPlaygroundDmId,
  type PlaygroundActivity,
} from "../mock/index.ts";
import { PlaygroundChannelPanel } from "../conversation/playground-channel-panel.tsx";
import { PlaygroundDmPanel } from "../conversation/playground-dm-panel.tsx";
import { usePlaygroundLargeDesktop } from "../app-shell/use-playground-desktop.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { PlaygroundThreadPanel } from "../thread/playground-thread-panel.tsx";
import { usePlaygroundActivityState } from "./activity-state.tsx";

export function PlaygroundActivityPanel() {
  const theme = useThemeFamily();
  const navigate = useNavigate();
  const isLargeDesktop = usePlaygroundLargeDesktop();
  const { items, setItems } = usePlaygroundActivityState();
  const { selectRailView } = usePlaygroundNavigation();
  const [activeItemId, setActiveItemId] = useState<string>();
  const activationTimerRef = useRef<number | null>(null);
  const compositionItems = useMemo(() => items.map(toCompositionItem), [items]);
  const activeItem = items.find((item) => item.id === activeItemId);
  const activeChannel = activeItem ? getPlaygroundChannel(activeItem.channelId) : undefined;
  const activeCompositionItem = compositionItems.find((item) => item.id === activeItemId);
  const activeThread =
    activeItem && activeCompositionItem?.kind === "thread"
      ? getPlaygroundThread(activeItem.messageId)?.thread
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

  function navigateToItem(item: ActivityCompositionItem) {
    const source = items.find((activity) => activity.id === item.id);
    const search = item.kind === "thread" && source ? { thread: source.messageId } : {};
    if (isPlaygroundDmId(item.channelId)) {
      void navigate({
        to: "/playground/s/$serverSlug/dm/$dmId",
        params: { dmId: item.channelId, serverSlug: PLAYGROUND_SERVER_SLUG },
        search,
      });
      return;
    }
    void navigate({
      to: "/playground/s/$serverSlug/channel/$channelId",
      params: { channelId: item.channelId, serverSlug: PLAYGROUND_SERVER_SLUG },
      search,
    });
  }

  function activateItem(
    item: ActivityCompositionItem,
    activation: { compact: boolean; detail: number },
  ) {
    if (activationTimerRef.current !== null) {
      window.clearTimeout(activationTimerRef.current);
      activationTimerRef.current = null;
    }

    if (!isLargeDesktop || activation.compact || activation.detail >= 2) {
      markRead(item.id);
      navigateToItem(item);
      return;
    }

    activationTimerRef.current = window.setTimeout(() => {
      activationTimerRef.current = null;
      markRead(item.id);
      setActiveItemId(item.id);
    }, 220);
  }

  const activityPanel = (
    <ActivityInboxComposition
      items={compositionItems}
      onItemsChange={commitCompositionItems}
      onBack={() => selectRailView("chat")}
      onOpenItem={activateItem}
    />
  );

  if (!activeChannel || !isLargeDesktop) {
    return <div className="flex min-w-0 flex-1">{activityPanel}</div>;
  }

  const detailPanel = activeThread ? (
    <PlaygroundThreadPanel
      key={activeThread.parent.id}
      channel={activeChannel}
      thread={activeThread}
    />
  ) : activeChannel.kind === "dm" ? (
    <PlaygroundDmPanel key={activeChannel.id} dm={activeChannel} />
  ) : (
    <PlaygroundChannelPanel key={activeChannel.id} channel={activeChannel} />
  );

  return (
    <ResizableGroup orientation="horizontal" className="min-w-0 flex-1">
      <ResizablePanel id="playground-activity-list" minSize={520} className="relative min-w-0">
        <div className="flex h-full min-w-0">{activityPanel}</div>
      </ResizablePanel>
      <ResizableHandle
        className={
          theme === "brutal" ? "z-50 ml-0 mr-0 w-0 border-l-2 border-black bg-transparent" : "z-50"
        }
      />
      <ResizablePanel
        id="playground-activity-detail"
        defaultSize={520}
        minSize={380}
        maxSize="65vw"
        groupResizeBehavior="preserve-pixel-size"
        className="relative z-10 min-w-0 !overflow-visible"
      >
        <div
          className={
            theme === "brutal"
              ? "flex h-full min-h-0 min-w-0 bg-white"
              : activeThread
                ? "flex h-full min-h-0 min-w-0 bg-layer-page pl-2"
                : "flex h-full min-h-0 min-w-0 bg-layer-panel"
          }
        >
          <div
            className={
              theme === "brutal"
                ? "flex min-h-0 min-w-0 flex-1"
                : activeThread
                  ? "flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-l-[10px] bg-layer-panel shadow-raft-xl"
                  : "flex min-h-0 min-w-0 flex-1"
            }
          >
            {detailPanel}
          </div>
        </div>
      </ResizablePanel>
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
