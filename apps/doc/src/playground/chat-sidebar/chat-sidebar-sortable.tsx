import { useDraggable, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { SidebarList, type SidebarListProps } from "raft-ui";
import { cn } from "raft-ui/cn";

import type { PlaygroundChannelId } from "../mock/index.ts";
import type { ChatSidebarDragSection } from "./chat-sidebar-dnd-ids.ts";

type SortableChatSidebarListProps = SidebarListProps & {
  items: readonly string[];
};

export function SortableChatSidebarList({ items, ...props }: SortableChatSidebarListProps) {
  return (
    <SortableContext items={[...items]} strategy={verticalListSortingStrategy}>
      <SidebarList {...props} />
    </SortableContext>
  );
}

export function ChatSidebarDropTarget({
  id,
  section,
  empty,
  children,
  className,
  disabled = false,
}: {
  id: string;
  section: ChatSidebarDragSection;
  empty: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { kind: "section", section, empty },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      data-slot="chat-sidebar-drop-target"
      data-over={isOver ? "true" : undefined}
      className={cn("min-h-1 transition-colors data-over:bg-ink-6", className)}
    >
      {children}
    </div>
  );
}

type SortableChatSidebarItemProps = HTMLAttributes<HTMLDivElement> & {
  id: string;
  section: ChatSidebarDragSection;
  channelId: PlaygroundChannelId;
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
};

export function SortableChatSidebarItem({
  id,
  section,
  channelId,
  active = false,
  children,
  className,
  disabled = false,
  style,
  ...props
}: SortableChatSidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { kind: "item", section, channelId, active },
    disabled,
  });
  const verticalTransform = transform ? { ...transform, x: 0 } : null;
  const sortableStyle: CSSProperties = {
    transform: CSS.Transform.toString(verticalTransform),
    transition,
    opacity: isDragging ? 0 : 1,
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

export function ChatSidebarProjectionSlot({
  beforeChannelId,
  anchorChannelId,
  height,
}: {
  beforeChannelId?: PlaygroundChannelId;
  anchorChannelId?: PlaygroundChannelId;
  height?: number;
}) {
  if (beforeChannelId !== anchorChannelId) return null;

  return (
    <div
      aria-hidden
      data-slot="chat-sidebar-drop-placeholder"
      className="pointer-events-none mb-0.5 h-(--chat-sidebar-dnd-placeholder-height,33.5px) w-full shrink-0 [[data-theme=brutal]_&]:mb-1"
      style={
        height == null
          ? undefined
          : ({ "--chat-sidebar-dnd-placeholder-height": `${height}px` } as CSSProperties)
      }
    />
  );
}

type DraggableChatSidebarItemProps = HTMLAttributes<HTMLDivElement> & {
  id: string;
  section: ChatSidebarDragSection;
  channelId: PlaygroundChannelId;
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
};

export function DraggableChatSidebarItem({
  id,
  section,
  channelId,
  active = false,
  children,
  className,
  disabled = false,
  style,
  ...props
}: DraggableChatSidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { kind: "item", section, channelId, active },
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
