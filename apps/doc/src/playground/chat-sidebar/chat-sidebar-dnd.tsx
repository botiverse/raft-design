import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
  PLAYGROUND_CHANNELS,
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  type PlaygroundChannelId,
  type PlaygroundChannelRecord,
} from "../mock/index.ts";
import { ChatSidebarItem } from "raft-ui";
import { ChatSidebarChannelRowContent } from "./chat-sidebar-channel-row-content.tsx";
import { ChatSidebarDndContext, type ChatSidebarDndValue } from "./chat-sidebar-dnd-context.ts";
import {
  createChatSidebarDragId,
  parseChatSidebarDragId,
  PLAYGROUND_PINNED_DROP_TARGET_ID,
  type ChatSidebarDragSection,
} from "./chat-sidebar-dnd-ids.ts";
import { ChatSidebarDirectMessageRowContent } from "./chat-sidebar-direct-message-row-content.tsx";

type ChatSidebarOrderSection = Exclude<ChatSidebarDragSection, "pinned">;

type ChatSidebarOrders = Record<ChatSidebarOrderSection, readonly PlaygroundChannelId[]>;

type ChatSidebarDndState = {
  orders: ChatSidebarOrders;
  pinnedChannelIds: readonly PlaygroundChannelId[];
};

export function ChatSidebarDndProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatSidebarDndState>(() => ({
    pinnedChannelIds: PLAYGROUND_CHANNELS.filter((channel) => channel.navigation.pinned).map(
      (channel) => channel.id,
    ),
    orders: {
      joint: PLAYGROUND_JOINT_CHANNELS.map((channel) => channel.id),
      channels: PLAYGROUND_ROOM_CHANNELS.map((channel) => channel.id),
      dms: PLAYGROUND_DIRECT_MESSAGES.map((channel) => channel.id),
    },
  }));
  const [activeDrag, setActiveDrag] = useState<{ id: string; width?: number } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 10 } }),
  );

  const togglePinned = useCallback((channelId: PlaygroundChannelId) => {
    setState((current) => {
      const pinned = current.pinnedChannelIds.includes(channelId);
      return {
        ...current,
        pinnedChannelIds: pinned
          ? current.pinnedChannelIds.filter((id) => id !== channelId)
          : [...current.pinnedChannelIds, channelId],
      };
    });
  }, []);

  const onDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveDrag({ id: String(active.id), width: active.rect.current.initial?.width });
  }, []);

  const clearActiveDrag = useCallback(() => setActiveDrag(null), []);

  const onDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      clearActiveDrag();
      if (!over || active.id === over.id) return;
      const activeItem = parseChatSidebarDragId(String(active.id));
      if (!activeItem) return;
      const overId = String(over.id);
      const overItem = parseChatSidebarDragId(overId);

      setState((current) => {
        if (activeItem.section === "pinned" && overItem?.section === "pinned") {
          return reorderChatSidebarSection(
            current,
            "pinned",
            activeItem.channelId,
            overItem.channelId,
          );
        }

        if (overItem?.section === "pinned") {
          if (
            activeItem.section === "pinned" ||
            current.pinnedChannelIds.includes(activeItem.channelId)
          ) {
            return current;
          }
          return {
            ...current,
            pinnedChannelIds: insertBefore(
              current.pinnedChannelIds,
              activeItem.channelId,
              overItem.channelId,
            ),
          };
        }

        if (overId === PLAYGROUND_PINNED_DROP_TARGET_ID) {
          if (
            activeItem.section === "pinned" ||
            current.pinnedChannelIds.includes(activeItem.channelId)
          ) {
            return current;
          }
          return {
            ...current,
            pinnedChannelIds: [...current.pinnedChannelIds, activeItem.channelId],
          };
        }

        if (activeItem.section !== overItem?.section) {
          return current;
        }

        return reorderChatSidebarSection(
          current,
          activeItem.section,
          activeItem.channelId,
          overItem.channelId,
        );
      });
    },
    [clearActiveDrag],
  );

  const activeChannel = useMemo(() => {
    const activeItem = activeDrag ? parseChatSidebarDragId(activeDrag.id) : null;
    return activeItem
      ? PLAYGROUND_CHANNELS.find((channel) => channel.id === activeItem.channelId)
      : undefined;
  }, [activeDrag]);

  const value = useMemo<ChatSidebarDndValue>(
    () => ({
      getDragId: createChatSidebarDragId,
      isPinned: (channelId) => state.pinnedChannelIds.includes(channelId),
      orderRows: (section, rows) => orderChatSidebarRows(section, rows, state),
      togglePinned,
    }),
    [state, togglePinned],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragCancel={clearActiveDrag}
      onDragEnd={onDragEnd}
    >
      <ChatSidebarDndContext.Provider value={value}>{children}</ChatSidebarDndContext.Provider>
      <DragOverlay dropAnimation={null}>
        {activeChannel ? (
          <ChatSidebarDragPreview channel={activeChannel} width={activeDrag?.width} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function ChatSidebarDragPreview({
  channel,
  width,
}: {
  channel: PlaygroundChannelRecord;
  width?: number;
}) {
  return (
    <ChatSidebarItem
      aria-hidden
      className="pointer-events-none w-full shadow-lg"
      render={<div />}
      style={{ width }}
    >
      {channel.kind === "dm" ? (
        <ChatSidebarDirectMessageRowContent row={channel} />
      ) : (
        <ChatSidebarChannelRowContent row={channel} />
      )}
    </ChatSidebarItem>
  );
}

function orderChatSidebarRows<TRow extends { id: PlaygroundChannelId }>(
  section: ChatSidebarDragSection,
  rows: readonly TRow[],
  state: ChatSidebarDndState,
) {
  const order = section === "pinned" ? state.pinnedChannelIds : state.orders[section];
  const byId = new Map(rows.map((row) => [row.id, row]));
  const orderedRows = order.map((id) => byId.get(id)).filter((row): row is TRow => row != null);
  const orderedIds = new Set(orderedRows.map((row) => row.id));
  return [...orderedRows, ...rows.filter((row) => !orderedIds.has(row.id))];
}

function reorderChatSidebarSection(
  state: ChatSidebarDndState,
  section: ChatSidebarDragSection,
  activeChannelId: PlaygroundChannelId,
  overChannelId: PlaygroundChannelId,
): ChatSidebarDndState {
  const order = section === "pinned" ? state.pinnedChannelIds : state.orders[section];
  const oldIndex = order.indexOf(activeChannelId);
  const newIndex = order.indexOf(overChannelId);
  if (oldIndex === -1 || newIndex === -1) return state;

  if (section === "pinned") {
    return { ...state, pinnedChannelIds: arrayMove([...order], oldIndex, newIndex) };
  }

  return {
    ...state,
    orders: {
      ...state.orders,
      [section]: arrayMove([...order], oldIndex, newIndex),
    },
  };
}

function insertBefore(
  ids: readonly PlaygroundChannelId[],
  channelId: PlaygroundChannelId,
  targetChannelId: PlaygroundChannelId,
) {
  const targetIndex = ids.indexOf(targetChannelId);
  return targetIndex === -1
    ? [...ids, channelId]
    : [...ids.slice(0, targetIndex), channelId, ...ids.slice(targetIndex)];
}
