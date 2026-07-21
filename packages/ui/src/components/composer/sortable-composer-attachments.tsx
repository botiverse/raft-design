import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
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
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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
  unregister: (id: string) => void;
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
  const [overlay, setOverlay] = useState<ReactNode>(null);
  const overlaysRef = useRef(new Map<string, ReactNode>());
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const registry = useMemo<OverlayRegistry>(
    () => ({
      register: (id, node) => {
        overlaysRef.current.set(id, node);
      },
      unregister: (id) => {
        overlaysRef.current.delete(id);
      },
    }),
    [],
  );

  const itemIds = useMemo(() => items.map(String), [items]);
  const horizontal = axis === "x";
  // Scroll: participate in ComposerAttachmentsScrollArea viewport flex.
  // Wrap: own the flex row so DnD a11y nodes are not flex siblings of tiles.
  const listClassName = horizontal
    ? "contents"
    : "flex w-full min-w-0 flex-wrap items-start gap-2 py-1.5";

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    const id = String(active.id);
    setActiveId(id);
    setOverlay(overlaysRef.current.get(id) ?? null);
  }, []);

  const handleDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      if (!over || active.id === over.id) return;
      const next = reorderItems(itemsRef.current, active.id, over.id);
      if (next) onReorder(next);
    },
    [onReorder],
  );

  const clearDrag = useCallback(() => {
    setActiveId(null);
    setOverlay(null);
  }, []);

  const handleDragEnd = useCallback(
    (_event: DragEndEvent) => {
      clearDrag();
    },
    [clearDrag],
  );

  const modifiers = horizontal ? [restrictToHorizontalAxis] : undefined;

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
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
      onDragCancel={clearDrag}
      onDragEnd={handleDragEnd}
    >
      <OverlayRegistryContext.Provider value={registry}>
        <div data-slot="sortable-composer-attachments-list" className={listClassName}>
          <SortableContext items={itemIds} strategy={strategy}>
            {children}
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
 * pointer ghost. Live arrayMove disables strategy transforms; FLIP via
 * animateLayoutChanges eases siblings into their new flex slots.
 */
export function SortableComposerAttachment({
  id,
  label,
  children,
}: SortableComposerAttachmentProps) {
  const registry = use(OverlayRegistryContext);
  const childrenRef = useRef(children);
  childrenRef.current = children;

  useEffect(() => {
    registry?.register(id, childrenRef.current);
    return () => registry?.unregister(id);
  }, [children, id, registry]);

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
