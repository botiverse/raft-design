"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useCallback,
  useId,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";
import { ChatSidebarList, type ChatSidebarListProps } from "./chat-sidebar-section";

export type SortableChatSidebarListProps = ChatSidebarListProps & {
  /** Stable item ids for this section only — do not mix ids across sections. */
  items: readonly string[];
  onReorder: (items: string[]) => void;
};

/**
 * Within-section reorder container (source Sidebar `DndContext` + `SortableContext`).
 * Each Pinned / Joint / Channels / DM list gets its own instance — no cross-section drag.
 */
export function SortableChatSidebarList({
  items,
  onReorder,
  ...props
}: SortableChatSidebarListProps) {
  const dndContextId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const itemIds = useMemo(() => [...items], [items]);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const oldIndex = itemIds.indexOf(String(active.id));
      const newIndex = itemIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      onReorder(arrayMove([...itemIds], oldIndex, newIndex));
    },
    [itemIds, onReorder],
  );

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <ChatSidebarList {...props} />
      </SortableContext>
    </DndContext>
  );
}

export type SortableChatSidebarItemProps = HTMLAttributes<HTMLDivElement> & {
  id: string;
  children: ReactNode;
  disabled?: boolean;
};

/** Source `SortableSidebarItem` — vertical-only transform, whole-row grab handle. */
export function SortableChatSidebarItem({
  id,
  children,
  className,
  disabled = false,
  style,
  ...props
}: SortableChatSidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });
  const verticalTransform = transform ? { ...transform, x: 0 } : null;
  const sortableStyle: CSSProperties = {
    transform: CSS.Transform.toString(verticalTransform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
    ...style,
  };

  return (
    <div
      ref={setNodeRef}
      data-slot="chat-sidebar-sortable-item"
      data-dragging={isDragging ? "true" : undefined}
      className={cn("cursor-grab active:cursor-grabbing", className)}
      style={sortableStyle}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children}
    </div>
  );
}
