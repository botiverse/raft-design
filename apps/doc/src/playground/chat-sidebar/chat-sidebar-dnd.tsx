import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import {
  PLAYGROUND_CHANNELS,
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  type PlaygroundChannelId,
  type PlaygroundChannelRecord,
} from "../mock/index.ts";
import { SidebarItem } from "raft-ui";
import { ChatSidebarChannelRowContent } from "./chat-sidebar-channel-row-content.tsx";
import {
  ChatSidebarDndContext,
  type ChatSidebarDndValue,
  type ChatSidebarDragProjection as ChatSidebarSectionProjection,
} from "./chat-sidebar-dnd-context.ts";
import {
  createChatSidebarDragId,
  parseChatSidebarDropTargetId,
  readChatSidebarDragItemData,
  readChatSidebarDropTargetData,
  type ChatSidebarDragSection,
} from "./chat-sidebar-dnd-ids.ts";
import { ChatSidebarDirectMessageRowContent } from "./chat-sidebar-direct-message-row-content.tsx";
import { ChatSidebarProjectionSlot } from "./chat-sidebar-sortable.tsx";

type ChatSidebarOrderSection = Exclude<ChatSidebarDragSection, "pinned">;

type ChatSidebarOrders = Record<ChatSidebarOrderSection, readonly PlaygroundChannelId[]>;

type ChatSidebarDndState = {
  orders: ChatSidebarOrders;
  pinnedChannelIds: readonly PlaygroundChannelId[];
};

type ChatSidebarInternalDragProjection = {
  channelId: PlaygroundChannelId;
  to: ChatSidebarDragSection | null;
  beforeChannelId?: PlaygroundChannelId;
};

type ChatSidebarActiveDrag = {
  channelId: PlaygroundChannelId;
  sourceSection: ChatSidebarDragSection;
  active: boolean;
  height?: number;
  width?: number;
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
  const [activeDrag, setActiveDrag] = useState<ChatSidebarActiveDrag | null>(null);
  const activeDragRef = useRef<ChatSidebarActiveDrag | null>(null);
  const [projection, setProjection] = useState<ChatSidebarInternalDragProjection | null>(null);
  const projectionRef = useRef<ChatSidebarInternalDragProjection | null>(null);
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
    const activeItem = readChatSidebarDragItemData(active.data.current);
    if (!activeItem) return;
    const nextActiveDrag = {
      channelId: activeItem.channelId,
      sourceSection: activeItem.section,
      active: activeItem.active,
      height: active.rect.current.initial?.height,
      width: active.rect.current.initial?.width,
    };
    activeDragRef.current = nextActiveDrag;
    setActiveDrag(nextActiveDrag);
  }, []);

  const clearActiveDrag = useCallback(() => {
    activeDragRef.current = null;
    projectionRef.current = null;
    setActiveDrag(null);
    setProjection(null);
  }, []);

  const updateProjection = useCallback(
    (
      resolve: (
        current: ChatSidebarInternalDragProjection | null,
      ) => ChatSidebarInternalDragProjection | null,
    ) => {
      const next = resolve(projectionRef.current);
      projectionRef.current = next;
      setProjection(next);
    },
    [],
  );

  const detachActiveProjection = useCallback(
    (channelId: PlaygroundChannelId, preserveTarget?: ChatSidebarDragSection) => {
      updateProjection((current) => {
        if (current?.channelId === channelId && current.to === preserveTarget) return current;
        return current?.channelId === channelId && current.to === null
          ? current
          : { channelId, to: null };
      });
    },
    [updateProjection],
  );

  const onDragOver = useCallback(
    ({ over }: DragOverEvent) => {
      const activeItem = activeDragRef.current;
      if (!activeItem) {
        updateProjection(() => null);
        return;
      }
      if (!over) {
        detachActiveProjection(activeItem.channelId);
        return;
      }

      const overId = String(over.id);
      const overItem = readChatSidebarDragItemData(over.data.current);
      const overSection = readChatSidebarDropTargetData(over.data.current);
      const targetSection =
        overItem?.section ?? overSection?.section ?? parseChatSidebarDropTargetId(overId);
      if (!targetSection) {
        detachActiveProjection(activeItem.channelId);
        return;
      }
      if (targetSection === activeItem.sourceSection) {
        updateProjection(() => null);
        return;
      }

      const homeSection = getChatSidebarHomeSection(activeItem.channelId);
      if (!canMoveChatSidebarItem(activeItem.sourceSection, targetSection, homeSection)) {
        detachActiveProjection(activeItem.channelId);
        return;
      }
      if (!overItem && overSection && !overSection.empty) {
        detachActiveProjection(activeItem.channelId, targetSection);
        return;
      }

      updateProjection((current) => {
        const beforeChannelId =
          (!overItem || overItem.channelId === activeItem.channelId) &&
          current?.channelId === activeItem.channelId &&
          current.to === targetSection
            ? current.beforeChannelId
            : overItem?.channelId;
        if (
          current?.channelId === activeItem.channelId &&
          current.to === targetSection &&
          current.beforeChannelId === beforeChannelId
        ) {
          return current;
        }

        return {
          channelId: activeItem.channelId,
          to: targetSection,
          beforeChannelId,
        };
      });
    },
    [detachActiveProjection, updateProjection],
  );

  const onDragEnd = useCallback(
    ({ over }: DragEndEvent) => {
      const activeItem = activeDragRef.current;
      const finalProjection = projectionRef.current;
      clearActiveDrag();
      if (!activeItem || !over) return;
      const overId = String(over.id);
      const overItem = readChatSidebarDragItemData(over.data.current);
      const overSection = readChatSidebarDropTargetData(over.data.current);
      const targetSection =
        overItem?.section ?? overSection?.section ?? parseChatSidebarDropTargetId(overId);
      if (!targetSection) return;
      const homeSection = getChatSidebarHomeSection(activeItem.channelId);
      if (!canMoveChatSidebarItem(activeItem.sourceSection, targetSection, homeSection)) return;
      if (
        !overItem &&
        overSection &&
        !overSection.empty &&
        (finalProjection?.channelId !== activeItem.channelId ||
          finalProjection.to !== targetSection)
      ) {
        return;
      }
      if (
        activeItem.sourceSection === targetSection &&
        overItem?.channelId === activeItem.channelId
      ) {
        return;
      }
      const beforeChannelId =
        (!overItem || overItem.channelId === activeItem.channelId) &&
        finalProjection?.channelId === activeItem.channelId &&
        finalProjection.to === targetSection
          ? finalProjection.beforeChannelId
          : overItem?.channelId;

      setState((current) => {
        if (activeItem.sourceSection === targetSection && overItem) {
          return reorderChatSidebarSection(
            current,
            targetSection,
            activeItem.channelId,
            overItem.channelId,
          );
        }

        if (targetSection === "pinned") {
          return {
            ...current,
            pinnedChannelIds: moveBefore(
              current.pinnedChannelIds,
              activeItem.channelId,
              beforeChannelId,
            ),
          };
        }

        if (activeItem.sourceSection === "pinned") {
          return {
            ...current,
            pinnedChannelIds: current.pinnedChannelIds.filter((id) => id !== activeItem.channelId),
            orders: moveChatSidebarOrder(
              current.orders,
              targetSection,
              activeItem.channelId,
              beforeChannelId,
            ),
          };
        }

        return {
          ...current,
          orders: moveChatSidebarOrder(
            current.orders,
            targetSection,
            activeItem.channelId,
            beforeChannelId,
          ),
        };
      });
    },
    [clearActiveDrag],
  );

  const activeChannel = useMemo(() => {
    return activeDrag
      ? PLAYGROUND_CHANNELS.find((channel) => channel.id === activeDrag.channelId)
      : undefined;
  }, [activeDrag]);

  const value = useMemo<ChatSidebarDndValue>(
    () => ({
      getDragId: createChatSidebarDragId,
      getProjection: (section) => getChatSidebarProjection(section, projection, activeDrag),
      isPinned: (channelId) => state.pinnedChannelIds.includes(channelId),
      orderRows: (section, rows) => orderChatSidebarRows(section, rows, state),
      togglePinned,
    }),
    [projection, state, togglePinned],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragCancel={clearActiveDrag}
      onDragEnd={onDragEnd}
    >
      <ChatSidebarDndContext.Provider value={value}>{children}</ChatSidebarDndContext.Provider>
      <DragOverlay dropAnimation={null}>
        {activeChannel ? (
          <ChatSidebarDragPreview
            channel={activeChannel}
            active={activeDrag?.active}
            width={activeDrag?.width}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function ChatSidebarDragPreview({
  channel,
  active = false,
  width,
}: {
  channel: PlaygroundChannelRecord;
  active?: boolean;
  width?: number;
}) {
  return (
    <SidebarItem
      active={active}
      aria-hidden
      className={
        active
          ? "pointer-events-none w-full bg-layer-panel shadow-raft-lg [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:shadow-raft-sm"
          : "pointer-events-none w-full bg-layer-panel shadow-raft-lg [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-white [[data-theme=brutal]_&]:shadow-raft-sm"
      }
      render={<div />}
      style={{ width }}
    >
      {channel.kind === "dm" ? (
        <ChatSidebarDirectMessageRowContent row={channel} />
      ) : (
        <ChatSidebarChannelRowContent row={channel} />
      )}
    </SidebarItem>
  );
}

export function ChatSidebarProjectionPreview({
  anchorChannelId,
  projection,
}: {
  anchorChannelId?: PlaygroundChannelId;
  projection: ChatSidebarSectionProjection | null;
}) {
  if (!projection) return null;

  return (
    <ChatSidebarProjectionSlot
      anchorChannelId={anchorChannelId}
      beforeChannelId={projection.beforeChannelId}
      height={projection.height}
    />
  );
}

function orderChatSidebarRows<TRow extends { id: PlaygroundChannelId }>(
  section: ChatSidebarDragSection,
  rows: readonly TRow[],
  state: ChatSidebarDndState,
) {
  const order = section === "pinned" ? state.pinnedChannelIds : state.orders[section];
  const byId = new Map(rows.map((row) => [row.id, row]));
  const orderedRows = order
    .map((id) => byId.get(id))
    .filter((row): row is TRow => row != null)
    .filter((row) => isChatSidebarRowVisible(section, row.id, state));
  const orderedIds = new Set(orderedRows.map((row) => row.id));
  const remainingRows = rows.filter(
    (row) => !orderedIds.has(row.id) && isChatSidebarRowVisible(section, row.id, state),
  );
  return [...orderedRows, ...remainingRows];
}

function isChatSidebarRowVisible(
  section: ChatSidebarDragSection,
  channelId: PlaygroundChannelId,
  state: ChatSidebarDndState,
) {
  return section === "pinned"
    ? state.pinnedChannelIds.includes(channelId)
    : !state.pinnedChannelIds.includes(channelId);
}

function getChatSidebarProjection(
  section: ChatSidebarDragSection,
  projection: ChatSidebarInternalDragProjection | null,
  activeDrag: ChatSidebarActiveDrag | null,
): ChatSidebarSectionProjection | null {
  if (!activeDrag || projection?.to !== section) return null;
  return {
    beforeChannelId: projection.beforeChannelId,
    channelId: projection.channelId,
    height: activeDrag.height,
  };
}

function moveChatSidebarOrder(
  orders: ChatSidebarOrders,
  section: ChatSidebarOrderSection,
  channelId: PlaygroundChannelId,
  beforeChannelId?: PlaygroundChannelId,
) {
  return { ...orders, [section]: moveBefore(orders[section], channelId, beforeChannelId) };
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
    orders: { ...state.orders, [section]: arrayMove([...order], oldIndex, newIndex) },
  };
}

function moveBefore(
  ids: readonly PlaygroundChannelId[],
  channelId: PlaygroundChannelId,
  targetChannelId?: PlaygroundChannelId,
) {
  const nextIds = ids.filter((id) => id !== channelId);
  const targetIndex = targetChannelId ? nextIds.indexOf(targetChannelId) : -1;
  nextIds.splice(targetIndex === -1 ? nextIds.length : targetIndex, 0, channelId);
  return nextIds;
}

function getChatSidebarHomeSection(channelId: PlaygroundChannelId): ChatSidebarOrderSection {
  const channel = PLAYGROUND_CHANNELS.find((candidate) => candidate.id === channelId);
  if (channel?.kind === "dm") return "dms";
  return channel?.kind === "joint" ? "joint" : "channels";
}

function canMoveChatSidebarItem(
  from: ChatSidebarDragSection,
  to: ChatSidebarDragSection,
  home: ChatSidebarOrderSection,
) {
  if (from === to) return true;
  return to === "pinned" || (from === "pinned" && to === home);
}
