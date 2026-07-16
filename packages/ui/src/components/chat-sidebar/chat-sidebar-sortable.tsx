"use client";

import { useDraggable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ChatSidebarList, type ChatSidebarListProps } from "./chat-sidebar-section";

export type SortableChatSidebarListProps = ChatSidebarListProps & {
  /** Stable sortable ids for this section. The parent owns the shared DnD context. */
  items: readonly string[];
};

/**
 * Sortable region inside a consumer-owned DnD context.
 *
 * The parent chooses whether sections can interact; this part only registers
 * the vertical list's sortable items.
 */
export function SortableChatSidebarList({ items, ...props }: SortableChatSidebarListProps) {
  return (
    <SortableContext items={[...items]} strategy={verticalListSortingStrategy}>
      <ChatSidebarList {...props} />
    </SortableContext>
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

export type DraggableChatSidebarItemProps = HTMLAttributes<HTMLDivElement> & {
  id: string;
  children: ReactNode;
  disabled?: boolean;
};

/** Draggable row for destinations that accept a drop without supporting local reorder. */
export function DraggableChatSidebarItem({
  id,
  children,
  className,
  disabled = false,
  style,
  ...props
}: DraggableChatSidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });
  const verticalTransform = transform ? { ...transform, x: 0 } : null;
  const draggableStyle: CSSProperties = {
    transform: CSS.Transform.toString(verticalTransform),
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
    ...style,
  };

  return (
    <div
      ref={setNodeRef}
      data-slot="chat-sidebar-draggable-item"
      data-dragging={isDragging ? "true" : undefined}
      className={cn("cursor-grab active:cursor-grabbing", className)}
      style={draggableStyle}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children}
    </div>
  );
}
