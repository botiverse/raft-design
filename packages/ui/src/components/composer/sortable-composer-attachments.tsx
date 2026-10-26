import { closestCenter, DndContext, pointerWithin } from "@dnd-kit/core";
import type { CollisionDetection, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import type { SortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { dragInstructions } from "../drag/drag-announcements";
import { DragLift, useDragSiblingTransition } from "../drag/drag-lift";
import { useDragSensors } from "../drag/drag-sensors";
import { DropPlaceholder } from "../drag/drop-placeholder";
import { ComposerAttachmentsScrollArea } from "./composer-attachments-scroll-area";

export type SortableComposerAttachmentsProps = {
  items: readonly string[];
  onReorder: (items: string[]) => void;
  children: ReactNode;
};

type SortableAttachmentsAxis = "x" | "xy";

type SortableAttachmentElement = ReactElement<{ children?: ReactNode }>;

/** Whether the lifted attachment still stands at its own index. */
const SortableAttachmentsHomeContext = createContext(true);

const DRAG_ACCESSIBILITY = { screenReaderInstructions: dragInstructions() };

/**
 * Mixed-width flex-wrap cannot be predicted by rectSortingStrategy. Preview
 * position by live DOM reorder on dragOver instead; strategy returns null so
 * siblings are not shifted by incorrect transforms on top of that reflow.
 * @see https://github.com/clauderic/dnd-kit/issues/44
 */
const liveReorderStrategy: SortingStrategy = () => null;

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

  const sensors = useDragSensors();

  const attachments = useMemo(() => attachmentsById(children), [children]);
  const itemIds = useMemo(() => items.map(String), [items]);
  const horizontal = axis === "x";
  // Live draft order drives the DOM during drag so the opacity-0 slot tracks the
  // drop index. Wrap uses liveReorderStrategy (null); horizontal keeps its strategy.
  const displayIds = activeId !== null ? draftIds : itemIds;
  const home = activeId === null || draftIds.indexOf(activeId) === itemIds.indexOf(activeId);
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

  return (
    <DndContext
      id={dndContextId}
      accessibility={DRAG_ACCESSIBILITY}
      sensors={sensors}
      collisionDetection={sortableCollisionDetection}
      autoScroll={false}
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
          <SortableAttachmentsHomeContext value={home}>
            {orderedChildren}
          </SortableAttachmentsHomeContext>
        </SortableContext>
      </div>
      <DragLift className="rounded-control">{activeId && overlay ? overlay : null}</DragLift>
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
 * The lifted attachment's own slot stays in the flex flow: at 40% while it is
 * still home, the dashed place once it stands anywhere else. DragLift holds
 * the copy that follows the hand; the root reads these `children` for it.
 * Live draft reorder moves this slot to the drop index; wrap skips strategy
 * transforms so siblings FLIP via layout instead of wrong gaps.
 */
export function SortableComposerAttachment({
  id,
  label,
  children,
}: SortableComposerAttachmentProps) {
  const home = use(SortableAttachmentsHomeContext);
  const siblingTransition = useDragSiblingTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
    transition: siblingTransition,
  });
  // Keep Base UI / consumer controls as the interactive roles (e.g. remove button).
  const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;
  const style: CSSProperties = {
    // DragLift owns the copy that follows the hand; this slot stays in flow.
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 0 : undefined,
  };
  const place = isDragging && !home;

  return (
    <div
      ref={setNodeRef}
      aria-label={`Reorder ${label}`}
      className="relative w-max max-w-full shrink-0 cursor-grab touch-manipulation select-none [-webkit-touch-callout:none] active:cursor-grabbing data-drop-place:[&>:not([data-slot=drop-placeholder])]:invisible"
      data-dragging={isDragging ? "true" : undefined}
      data-drag-origin={isDragging && home ? "" : undefined}
      data-drop-place={place ? "" : undefined}
      data-slot="sortable-composer-attachment"
      style={style}
      {...sortableAttributes}
      {...listeners}
    >
      {children}
      {place ? <DropPlaceholder className="absolute inset-0" /> : null}
    </div>
  );
}
