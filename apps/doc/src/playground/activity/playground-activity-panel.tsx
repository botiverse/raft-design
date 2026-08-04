import { useNavigate } from "@tanstack/react-router";
import { useThemeFamily } from "raft-ui";
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
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { PlaygroundThreadPanel } from "../thread/playground-thread-panel.tsx";
import { usePlaygroundActivityState } from "./activity-state.tsx";

export function PlaygroundActivityPanel() {
  const theme = useThemeFamily();
  const navigate = useNavigate();
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

    if (activation.compact || activation.detail >= 2) {
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

  return (
    <div className="flex min-w-0 flex-1">
      <div
        className={
          activeChannel
            ? theme === "brutal"
              ? "flex min-w-0 flex-[0_1_48rem] border-r-2 border-black"
              : "flex min-w-0 flex-[0_1_48rem]"
            : "flex min-w-0 flex-1"
        }
      >
        <ActivityInboxComposition
          items={compositionItems}
          onItemsChange={commitCompositionItems}
          onBack={() => selectRailView("chat")}
          onOpenItem={activateItem}
        />
      </div>
      {activeChannel ? (
        <div
          className={
            theme === "brutal"
              ? "hidden min-w-0 flex-1 md:flex"
              : "relative hidden min-w-0 flex-1 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-30 before:w-px before:bg-line-subtle before:content-[''] md:flex"
          }
        >
          {activeThread ? (
            <PlaygroundThreadPanel channel={activeChannel} thread={activeThread} />
          ) : activeChannel.kind === "dm" ? (
            <PlaygroundDmPanel dm={activeChannel} />
          ) : (
            <PlaygroundChannelPanel channel={activeChannel} />
          )}
        </div>
      ) : null}
    </div>
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
