import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { CollisionDetection, DragOverEvent, DragStartEvent, Modifier } from "@dnd-kit/core";
import {
  arrayMove,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import type { SortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Children, isValidElement, useCallback, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { ComposerAttachmentsScrollArea } from "./composer-attachments-scroll-area";

export type SortableComposerAttachmentsProps = {
  items: readonly string[];
  onReorder: (items: string[]) => void;
  children: ReactNode;
};

type SortableAttachmentsAxis = "x" | "xy";

type SortableAttachmentElement = ReactElement<{ children?: ReactNode }>;

const SORTABLE_TRANSITION = {
  duration: 160,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
} as const;

/**
 * Mixed-width flex-wrap cannot be predicted by rectSortingStrategy. Preview
 * position by live DOM reorder on dragOver instead; strategy returns null so
 * siblings are not shifted by incorrect transforms on top of that reflow.
 * @see https://github.com/clauderic/dnd-kit/issues/44
 */
const liveReorderStrategy: SortingStrategy = () => null;

const restrictToHorizontalAxis: Modifier = ({ transform }) => ({
  ...transform,
  y: 0,
});

const HORIZONTAL_MODIFIERS = [restrictToHorizontalAxis];

const HORIZONTAL_AUTO_SCROLL = {
  threshold: { x: 0.15, y: 0 },
  canScroll: (element: Element) => element.scrollWidth > element.clientWidth + 1,
};

/**
 * Prefer pointer hits; if the active droppable is still under the pointer /
 * closest center, keep it so layout reflow alone cannot claim a neighbor.
 */
const sortableCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  const collisions = pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args);
  const self = collisions.find((collision) => collision.id === args.active.id);
  return self ? [self] : collisions;
};

function reorderItems(
  items: readonly string[],
  activeId: string | number,
  overId: string | number,
): string[] | null {
  const oldIndex = items.indexOf(String(activeId));
  const newIndex = items.indexOf(String(overId));
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;
  return arrayMove([...items], oldIndex, newIndex);
}

function pointerFromDragEvent(event: Pick<DragOverEvent, "activatorEvent" | "delta">) {
  const { activatorEvent, delta } = event;
  if (
    !activatorEvent ||
    !("clientX" in activatorEvent) ||
    !("clientY" in activatorEvent) ||
    typeof activatorEvent.clientX !== "number" ||
    typeof activatorEvent.clientY !== "number"
  ) {
    return null;
  }
  return {
    x: activatorEvent.clientX + delta.x,
    y: activatorEvent.clientY + delta.y,
  };
}

function samePointer(a: { x: number; y: number }, b: { x: number; y: number }, tolerance = 0.5) {
  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
}

/** Attachment tiles keyed by id; also the source of the DragOverlay ghost content. */
function attachmentsById(children: ReactNode) {
  const byId = new Map<string, SortableAttachmentElement>();
  Children.forEach(children, (child) => {
    if (!isValidElement<{ id?: string; children?: ReactNode }>(child) || child.props.id == null) {
      return;
    }
    byId.set(String(child.props.id), child);
  });
  return byId;
}

function SortableComposerAttachmentsRoot({
  items,
  onReorder,
  children,
  axis,
  strategy,
}: SortableComposerAttachmentsProps & {
  axis: SortableAttachmentsAxis;
  strategy: SortingStrategy;
}) {
  const dndContextId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [overlay, setOverlay] = useState<ReactNode>(null);
  const [listMinHeight, setListMinHeight] = useState<number | undefined>();
  // Mirrors draftIds for the drag handlers; owned by them, reset on every drag start.
  const draftIdsRef = useRef<string[]>([]);
  // Ignore collision flips caused by our own layout update while the pointer is still.
  const lastReorderPointerRef = useRef<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const attachments = useMemo(() => attachmentsById(children), [children]);
  const itemIds = useMemo(() => items.map(String), [items]);
  const horizontal = axis === "x";
  // Live draft order drives the DOM during drag so the opacity-0 slot tracks the
  // drop index. Wrap uses liveReorderStrategy (null); horizontal keeps its strategy.
  const displayIds = activeId !== null ? draftIds : itemIds;
  const orderedChildren = useMemo(
    () =>
      displayIds.flatMap((id) => {
        const child = attachments.get(id);
        return child ? [child] : [];
      }),
    [attachments, displayIds],
  );

  const listClassName = horizontal
    ? "contents"
    : // content-start: default align-content:stretch expands row gaps when the
      // list is taller than its lines (e.g. minHeight locked while packing to fewer rows).
      "flex w-full min-w-0 flex-wrap content-start items-start gap-2 py-1.5";

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      const id = String(active.id);
      lastReorderPointerRef.current = null;
      const nextDraft = [...itemIds];
      draftIdsRef.current = nextDraft;
      setDraftIds(nextDraft);
      // Lock wrap height so packing reflow cannot collapse the shell mid-drag.
      if (!horizontal && listRef.current) {
        setListMinHeight(listRef.current.getBoundingClientRect().height);
      }
      setActiveId(id);
      setOverlay(attachments.get(id)?.props.children ?? null);
    },
    [attachments, horizontal, itemIds],
  );

  const handleDragOver = useCallback(({ active, over, activatorEvent, delta }: DragOverEvent) => {
    if (!over || active.id === over.id) return;
    const next = reorderItems(draftIdsRef.current, active.id, over.id);
    if (!next) return;

    const pointer = pointerFromDragEvent({ activatorEvent, delta });
    if (
      pointer &&
      lastReorderPointerRef.current &&
      samePointer(pointer, lastReorderPointerRef.current)
    ) {
      return;
    }
    if (pointer) lastReorderPointerRef.current = pointer;

    draftIdsRef.current = next;
    setDraftIds(next);
  }, []);

  const clearDrag = useCallback(() => {
    lastReorderPointerRef.current = null;
    draftIdsRef.current = [];
    setActiveId(null);
    setDraftIds([]);
    setOverlay(null);
    setListMinHeight(undefined);
  }, []);

  const handleDragCancel = useCallback(() => {
    clearDrag();
  }, [clearDrag]);

  const handleDragEnd = useCallback(() => {
    onReorder(draftIdsRef.current);
    clearDrag();
  }, [clearDrag, onReorder]);

  const modifiers = horizontal ? HORIZONTAL_MODIFIERS : undefined;

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={sortableCollisionDetection}
      modifiers={modifiers}
      autoScroll={horizontal ? HORIZONTAL_AUTO_SCROLL : false}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={listRef}
        data-slot="sortable-composer-attachments-list"
        className={listClassName}
        style={listMinHeight != null ? { minHeight: listMinHeight } : undefined}
      >
        <SortableContext items={displayIds} strategy={strategy}>
          {orderedChildren}
        </SortableContext>
      </div>
      <DragOverlay dropAnimation={null} modifiers={modifiers}>
        {activeId && overlay ? (
          <div className="w-max max-w-full shrink-0 cursor-grabbing">{overlay}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/** Wrap / flex-pack attachment reorder (mixed widths). */
export function SortableComposerAttachments(props: SortableComposerAttachmentsProps) {
  return <SortableComposerAttachmentsRoot {...props} axis="xy" strategy={liveReorderStrategy} />;
}

/** Horizontal scroll strip reorder — wraps `ComposerAttachmentsScrollArea`. */
export function SortableComposerAttachmentsScroll(props: SortableComposerAttachmentsProps) {
  return (
    <ComposerAttachmentsScrollArea>
      <SortableComposerAttachmentsRoot
        {...props}
        axis="x"
        strategy={horizontalListSortingStrategy}
      />
    </ComposerAttachmentsScrollArea>
  );
}

export type SortableComposerAttachmentProps = {
  id: string;
  label: string;
  children: ReactNode;
};

/**
 * Sized placeholder stays in the flex flow (opacity 0). DragOverlay is the
 * pointer ghost — the root reads these `children` for it. Live draft reorder
 * moves this slot to the drop index; wrap skips strategy transforms so siblings
 * FLIP via layout instead of wrong gaps.
 */
export function SortableComposerAttachment({
  id,
  label,
  children,
}: SortableComposerAttachmentProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
    transition: SORTABLE_TRANSITION,
  });
  // Keep Base UI / consumer controls as the interactive roles (e.g. remove button).
  const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;
  const style: CSSProperties = {
    // DragOverlay owns the pointer ghost; keep the opacity-0 slot in flow.
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0 : undefined,
    zIndex: isDragging ? 0 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      aria-label={`Reorder ${label}`}
      className="w-max max-w-full shrink-0 cursor-grab touch-none active:cursor-grabbing"
      data-dragging={isDragging ? "true" : undefined}
      data-slot="sortable-composer-attachment"
      style={style}
      {...sortableAttributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
