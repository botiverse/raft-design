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
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  defaultAnimateLayoutChanges,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  type SortingStrategy,
} from "@dnd-kit/sortable";
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
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { ComposerAttachmentsScrollArea } from "./composer-attachments-scroll-area";

export type SortableComposerAttachmentsProps = {
  items: readonly string[];
  onReorder: (items: string[]) => void;
  children: ReactNode;
};

type SortableAttachmentsAxis = "x" | "xy";

type OverlayRegistry = {
  register: (id: string, node: ReactNode) => void;
};

const OverlayRegistryContext = createContext<OverlayRegistry | null>(null);

const SORTABLE_TRANSITION = {
  duration: 160,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
} as const;

const restrictToHorizontalAxis: Modifier = ({ transform }) => ({
  ...transform,
  y: 0,
});

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

function orderChildrenByIds(children: ReactNode, ids: readonly string[]) {
  const byId = new Map<string, ReactElement>();
  Children.forEach(children, (child) => {
    if (!isValidElement<{ id?: string }>(child) || child.props.id == null) return;
    byId.set(String(child.props.id), child);
  });
  return ids.flatMap((id) => {
    const child = byId.get(id);
    return child ? [child] : [];
  });
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [overlay, setOverlay] = useState<ReactNode>(null);
  const overlaysRef = useRef(new Map<string, ReactNode>());
  const draftIdsRef = useRef(draftIds);
  draftIdsRef.current = draftIds;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  // Ignore collision flips caused by our own layout update while the pointer is still.
  const lastReorderPointerRef = useRef<{ x: number; y: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Rebuild overlay nodes each render; tiles register during render (no effect).
  overlaysRef.current = new Map();
  const registry = useMemo<OverlayRegistry>(
    () => ({
      register: (id, node) => {
        overlaysRef.current.set(id, node);
      },
    }),
    [],
  );

  const itemIds = useMemo(() => items.map(String), [items]);
  const displayIds = activeId !== null ? draftIds : itemIds;
  const orderedChildren = useMemo(
    () => orderChildrenByIds(children, displayIds),
    [children, displayIds],
  );

  const horizontal = axis === "x";
  // Scroll: participate in ComposerAttachmentsScrollArea viewport flex.
  // Wrap: own the flex row so DnD a11y nodes are not flex siblings of tiles.
  const listClassName = horizontal
    ? "contents"
    : "flex w-full min-w-0 flex-wrap items-start gap-2 py-1.5";

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    const id = String(active.id);
    const nextDraft = itemsRef.current.map(String);
    draftIdsRef.current = nextDraft;
    lastReorderPointerRef.current = null;
    setDraftIds(nextDraft);
    setActiveId(id);
    setOverlay(overlaysRef.current.get(id) ?? null);
  }, []);

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
    setActiveId(null);
    setDraftIds([]);
    setOverlay(null);
  }, []);

  const handleDragCancel = useCallback(() => {
    clearDrag();
  }, [clearDrag]);

  const handleDragEnd = useCallback(
    (_event: DragEndEvent) => {
      onReorder(draftIdsRef.current);
      clearDrag();
    },
    [clearDrag, onReorder],
  );

  const modifiers = horizontal ? [restrictToHorizontalAxis] : undefined;

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={sortableCollisionDetection}
      modifiers={modifiers}
      autoScroll={
        horizontal
          ? {
              threshold: { x: 0.15, y: 0 },
              canScroll: (element) => element.scrollWidth > element.clientWidth + 1,
            }
          : false
      }
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <OverlayRegistryContext.Provider value={registry}>
        <div data-slot="sortable-composer-attachments-list" className={listClassName}>
          <SortableContext items={displayIds} strategy={strategy}>
            {orderedChildren}
          </SortableContext>
        </div>
      </OverlayRegistryContext.Provider>
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
  return <SortableComposerAttachmentsRoot {...props} axis="xy" strategy={rectSortingStrategy} />;
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
 * pointer ghost. Live draft arrayMove disables strategy transforms; FLIP via
 * animateLayoutChanges eases siblings into their new flex slots. Parent
 * `onReorder` commits once on drag end.
 */
export function SortableComposerAttachment({
  id,
  label,
  children,
}: SortableComposerAttachmentProps) {
  const registry = use(OverlayRegistryContext);
  registry?.register(id, children);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
    transition: SORTABLE_TRANSITION,
  });
  // Keep Base UI / consumer controls as the interactive roles (e.g. remove button).
  const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
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
