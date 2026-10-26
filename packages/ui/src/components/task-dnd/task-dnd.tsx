"use client";

import {
  closestCorners,
  DndContext,
  getFirstCollision,
  KeyboardCode,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import type {
  ClientRect,
  DndContextProps,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  DroppableContainer,
  KeyboardCoordinateGetter,
  UniqueIdentifier,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ComponentPropsWithRef, CSSProperties, Ref, ReactNode } from "react";
import { DragLift } from "../drag/drag-lift";
import { dragInstructions } from "../drag/drag-announcements";
import { useDragSensors } from "../drag/drag-sensors";
import { drag } from "../drag/drag.recipe";
import { taskDnd } from "./task-dnd.recipe";

export type TaskDropState = "idle" | "allowed" | "blocked";
export type TaskDropPlacement = "before" | "after";
export type TaskDropData = Record<string, unknown>;

type TaskDndContextValue = {
  activeId: UniqueIdentifier | null;
  /** The drop target of the dragged card itself: over it, the card would stay where it is. */
  activeDropId: UniqueIdentifier | null;
  activeHeight: number | null;
  /** A TaskDragOverlay is rendered: its copy follows the hand, and the card stays in place. */
  overlay: boolean;
  setOverlay: (mounted: boolean) => void;
  isDropAllowed: (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    overData: TaskDropData | undefined,
  ) => boolean;
};

const TaskDndContext = createContext<TaskDndContextValue | null>(null);
type TaskDndOverSnapshot = {
  overId: UniqueIdentifier | null;
  overPlacement: TaskDropPlacement | null;
  overData: TaskDropData | undefined;
};
type TaskDndOverStore = {
  getSnapshot: () => TaskDndOverSnapshot;
  subscribe: (listener: () => void) => () => void;
  update: (snapshot: TaskDndOverSnapshot) => void;
};

const EMPTY_OVER_SNAPSHOT: TaskDndOverSnapshot = {
  overId: null,
  overPlacement: null,
  overData: undefined,
};
const EMPTY_OVER_STORE = createTaskDndOverStore();
const TaskDndOverContext = createContext<TaskDndOverStore | null>(null);
const allowTaskDrop = () => true;
const NO_SENSORS: ReturnType<typeof useSensors> = [];

export type TaskMoveDetails = {
  activeId: UniqueIdentifier;
  overId: UniqueIdentifier;
  overData: TaskDropData | undefined;
  placement: TaskDropPlacement | null;
};

export type TaskDndAccessibility = NonNullable<DndContextProps["accessibility"]>;

export type TaskDndProviderProps = {
  children: ReactNode;
  accessibility?: TaskDndAccessibility;
  disabled?: boolean;
  isDropAllowed?: (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    overData: TaskDropData | undefined,
  ) => boolean;
  onMove?: (details: TaskMoveDetails) => void | Promise<void>;
  onMoveError?: (error: unknown, details: TaskMoveDetails) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragMove?: (event: DragMoveEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragCancel?: (event: DragCancelEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
};

export function TaskDndProvider({
  children,
  accessibility,
  disabled = false,
  isDropAllowed = allowTaskDrop,
  onMove,
  onMoveError,
  onDragStart,
  onDragMove,
  onDragOver,
  onDragCancel,
  onDragEnd,
}: TaskDndProviderProps) {
  const id = useId();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeDropId, setActiveDropId] = useState<UniqueIdentifier | null>(null);
  const [activeHeight, setActiveHeight] = useState<number | null>(null);
  const [overlay, setOverlay] = useState(false);
  const [overStore] = useState(createTaskDndOverStore);
  const sensors = useDragSensors({ coordinateGetter: taskKeyboardCoordinates });
  const resolvedAccessibility = useMemo<TaskDndAccessibility>(
    () => ({ screenReaderInstructions: dragInstructions(), ...accessibility }),
    [accessibility],
  );
  const context = useMemo(
    () =>
      ({
        activeId,
        activeDropId,
        activeHeight,
        isDropAllowed,
        overlay,
        setOverlay,
      }) satisfies TaskDndContextValue,
    [activeDropId, activeHeight, activeId, isDropAllowed, overlay],
  );
  const reset = useCallback(() => {
    setActiveId(null);
    setActiveDropId(null);
    setActiveHeight(null);
    overStore.update(EMPTY_OVER_SNAPSHOT);
  }, [overStore]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      overStore.update(EMPTY_OVER_SNAPSHOT);
      setActiveId(event.active.id);
      setActiveDropId(getOwnDropId(event.active.data.current));
      setActiveHeight(event.active.rect.current.initial?.height ?? null);
      onDragStart?.(event);
    },
    [overStore, onDragStart],
  );

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      const current = overStore.getSnapshot();
      overStore.update({
        ...current,
        overPlacement: getDropPlacement(event),
      });
      onDragMove?.(event);
    },
    [overStore, onDragMove],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      overStore.update({
        overId: event.over?.id ?? null,
        overPlacement: getDropPlacement(event),
        overData: event.over?.data.current as TaskDropData | undefined,
      });
      onDragOver?.(event);
    },
    [overStore, onDragOver],
  );

  const handleDragCancel = useCallback(
    (event: DragCancelEvent) => {
      reset();
      onDragCancel?.(event);
    },
    [reset, onDragCancel],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const nextActiveId = event.active.id;
      const nextOverId = event.over?.id;
      const nextOverData = event.over?.data.current as TaskDropData | undefined;
      const ownDropId = getOwnDropId(event.active.data.current);
      if (
        nextOverId != null &&
        nextOverId !== ownDropId &&
        isDropAllowed(nextActiveId, nextOverId, nextOverData)
      ) {
        const details = {
          activeId: nextActiveId,
          overId: nextOverId,
          overData: nextOverData,
          placement: getDropPlacement(event),
        };
        void Promise.resolve(onMove?.(details)).catch((error: unknown) => {
          onMoveError?.(error, details);
        });
      }
      reset();
      onDragEnd?.(event);
    },
    [isDropAllowed, onMove, onMoveError, reset, onDragEnd],
  );

  return (
    <DndContext
      id={id}
      accessibility={resolvedAccessibility}
      autoScroll={!overlay}
      sensors={disabled ? NO_SENSORS : sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <TaskDndContext value={context}>
        <TaskDndOverContext value={overStore}>{children}</TaskDndOverContext>
      </TaskDndContext>
    </DndContext>
  );
}

export type TaskDraggableProps = ComponentPropsWithRef<"div"> & {
  id: UniqueIdentifier;
  disabled?: boolean;
  dropId?: UniqueIdentifier;
  dropData?: TaskDropData;
  dropDisabled?: boolean;
};

export function TaskDraggable({
  id,
  disabled = false,
  dropId,
  dropData,
  dropDisabled = false,
  className,
  ref: consumerRef,
  style,
  ...props
}: TaskDraggableProps) {
  const { draggable } = taskDnd();
  const context = use(TaskDndContext);
  const ownDrop = useMemo(() => (dropId == null ? undefined : { [OWN_DROP_ID]: dropId }), [dropId]);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
    data: ownDrop,
  });
  // With a TaskDragOverlay the copy follows the hand and the card stays in
  // place, faded, until it drops; without one the card itself moves.
  const lifted = isDragging && context?.overlay === true;
  const { setNodeRef: setDropNodeRef, isOver: isDropOver } = useDroppable({
    id: dropId ?? id,
    data: dropData,
    disabled: dropId == null || dropDisabled,
  });
  const dragStyle: CSSProperties = {
    transform: lifted ? undefined : CSS.Translate.toString(transform),
    ...style,
  };
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      setDropNodeRef(node);
      assignRef(consumerRef, node);
    },
    [consumerRef, setDropNodeRef, setNodeRef],
  );
  const mergedProps = mergeProps<"div">(attributes, listeners, props);

  return (
    <div
      {...mergedProps}
      ref={mergedRef}
      data-slot="task-draggable"
      data-dragging={isDragging ? "true" : undefined}
      data-drag-origin={lifted ? "" : undefined}
      data-drop-over={isDropOver ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      className={draggable({ className })}
      style={dragStyle}
    />
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

export type TaskDropZoneState = { dropState: TaskDropState };
export type TaskDropZoneProps = useRender.ComponentProps<"div", TaskDropZoneState> & {
  id: UniqueIdentifier;
  disabled?: boolean;
  data?: TaskDropData;
};

export function TaskDropZone({ id, data, disabled = false, render, ...props }: TaskDropZoneProps) {
  const context = use(TaskDndContext);
  const { setNodeRef, isOver } = useDroppable({ id, data, disabled });
  const dropState = getDropState(context, id, isOver, data);

  return useRender({
    defaultTagName: "div",
    render,
    ref: setNodeRef,
    state: { dropState },
    props: {
      "data-slot": "task-drop-zone",
      "data-drop-state": dropState,
      ...props,
    },
  });
}

export type TaskDropPlaceholderProps = useRender.ComponentProps<"div", TaskDropZoneState> & {
  id: UniqueIdentifier;
  placement?: TaskDropPlacement;
};

export function TaskDropPlaceholder({
  id,
  placement,
  className,
  render,
  style,
  ...props
}: TaskDropPlaceholderProps) {
  const context = use(TaskDndContext);
  const overStore = use(TaskDndOverContext) ?? EMPTY_OVER_STORE;
  const { placeholder } = taskDnd();
  const { placeholder: dropPlaceholder } = drag();
  const dropState = useSyncExternalStore<TaskDropState>(
    overStore.subscribe,
    () => getPlaceholderDropState(context, overStore.getSnapshot(), id, placement),
    () => "idle",
  );
  const placeholderStyle: CSSProperties = {
    ...style,
    ...(context?.activeHeight == null
      ? {}
      : { "--task-dnd-placeholder-height": `${context.activeHeight}px` }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    state: { dropState },
    props: {
      "aria-hidden": true,
      "data-slot": "task-drop-placeholder",
      "data-drop-state": dropState,
      className: dropPlaceholder({ className: placeholder({ className }) }),
      style: placeholderStyle,
      ...props,
    },
  });
}

export type TaskDragOverlayProps = {
  children?: ReactNode;
  className?: string;
  /** Render the copy in another element, such as `document.body` when an ancestor has a transform. */
  container?: Element | DocumentFragment | null;
};

/**
 * The copy of the dragged card that follows the hand: a `DragLift` with the
 * card's radius. On a drop it glides into the card's new place, and on a
 * cancel back home. While it is rendered, the dragged card stays in its place
 * at 40% instead of moving.
 */
export function TaskDragOverlay({ children, className, container }: TaskDragOverlayProps) {
  const { overlay } = taskDnd();
  const setOverlay = use(TaskDndContext)?.setOverlay;
  useEffect(() => {
    if (!setOverlay) return;
    setOverlay(true);
    return () => setOverlay(false);
  }, [setOverlay]);

  return (
    <DragLift className="rounded-container" container={container}>
      {children == null ? null : (
        <div data-slot="task-drag-overlay" data-dragging="true" className={overlay({ className })}>
          {children}
        </div>
      )}
    </DragLift>
  );
}

const OWN_DROP_ID = "taskDndDropId";

function getOwnDropId(data: Record<string, unknown> | undefined): UniqueIdentifier | null {
  const value = data?.[OWN_DROP_ID];
  return typeof value === "string" || typeof value === "number" ? value : null;
}

/**
 * dnd-kit's `sortableKeyboardCoordinates` only moves when the dragged item is
 * itself a registered droppable under its own id (as with `useSortable`). Task
 * cards drop under `dropId` and may leave their column while dragged, so it
 * never found a target. This getter steps between the enabled drop targets
 * instead: ArrowDown/ArrowUp go through the slots of the column (before/after
 * each target), ArrowLeft/ArrowRight jump to the nearest target in that
 * direction.
 */
const taskKeyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  const direction = event.code;
  if (
    direction !== KeyboardCode.Down &&
    direction !== KeyboardCode.Up &&
    direction !== KeyboardCode.Left &&
    direction !== KeyboardCode.Right
  ) {
    return undefined;
  }
  event.preventDefault();

  const { active, activeNode, collisionRect, droppableContainers, droppableRects, over } = context;
  if (active == null || collisionRect == null) return undefined;

  const isVertical = direction === KeyboardCode.Down || direction === KeyboardCode.Up;
  const center = getRectCenter(collisionRect);
  const overRect = over == null ? undefined : droppableRects.get(over.id);
  if (overRect != null && isVertical) {
    const placement = center.y < getRectCenter(overRect).y ? "before" : "after";
    if (direction === KeyboardCode.Down && placement === "before") {
      return getKeyboardLanding(collisionRect, overRect, "after");
    }
    if (direction === KeyboardCode.Up && placement === "after") {
      return getKeyboardLanding(collisionRect, overRect, "before");
    }
  }

  const candidates: DroppableContainer[] = [];
  for (const entry of droppableContainers.getEnabled()) {
    if (entry.disabled || entry.id === over?.id) continue;
    if (activeNode != null && entry.node.current === activeNode) continue;
    const rect = droppableRects.get(entry.id);
    if (rect == null) continue;
    const target = getRectCenter(rect);
    const isInDirection =
      direction === KeyboardCode.Down
        ? target.y > center.y && rect.left <= center.x && center.x <= rect.right
        : direction === KeyboardCode.Up
          ? target.y < center.y && rect.left <= center.x && center.x <= rect.right
          : direction === KeyboardCode.Right
            ? target.x > center.x + 1
            : target.x < center.x - 1;
    if (isInDirection) candidates.push(entry);
  }

  const targetId = getFirstCollision(
    closestCorners({
      active,
      collisionRect,
      droppableRects,
      droppableContainers: candidates,
      pointerCoordinates: null,
    }),
    "id",
  );
  const targetRect = targetId == null ? undefined : droppableRects.get(targetId);
  if (targetRect == null) return undefined;
  return getKeyboardLanding(
    collisionRect,
    targetRect,
    direction === KeyboardCode.Down ? "after" : "before",
  );
};

function getRectCenter(rect: ClientRect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** Top-left for the dragged card so `getDropPlacement` reads `placement` over `target`. */
function getKeyboardLanding(card: ClientRect, target: ClientRect, placement: TaskDropPlacement) {
  const alignTop = target.top;
  const alignBottom = target.bottom - card.height;
  return {
    x: target.left,
    y:
      placement === "before"
        ? Math.min(alignTop, alignBottom) - 1
        : Math.max(alignTop, alignBottom) + 1,
  };
}

function getDropPlacement(event: DragMoveEvent | DragEndEvent): TaskDropPlacement | null {
  const activeRect = event.active.rect.current.translated ?? event.active.rect.current.initial;
  const overRect = event.over?.rect;
  if (activeRect == null || overRect == null) return null;

  const activeCenter = activeRect.top + activeRect.height / 2;
  const overCenter = overRect.top + overRect.height / 2;
  return activeCenter < overCenter ? "before" : "after";
}

function getDropState(
  context: TaskDndContextValue | null,
  id: UniqueIdentifier,
  isOver: boolean,
  overData: TaskDropData | undefined,
): TaskDropState {
  const activeId = context?.activeId ?? null;
  if (!isOver || activeId == null) return "idle";
  return context?.isDropAllowed(activeId, id, overData) ? "allowed" : "blocked";
}

function getPlaceholderDropState(
  context: TaskDndContextValue | null,
  over: TaskDndOverSnapshot,
  id: UniqueIdentifier,
  placement: TaskDropPlacement | undefined,
) {
  // Over its own card the card would stay where it is: no place opens.
  if (context?.activeDropId != null && context.activeDropId === id) return "idle";
  const isOver = over.overId === id && (placement == null || over.overPlacement === placement);
  return getDropState(context, id, isOver, over.overData);
}

function createTaskDndOverStore(): TaskDndOverStore {
  let snapshot = EMPTY_OVER_SNAPSHOT;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update: (nextSnapshot) => {
      if (
        snapshot.overId === nextSnapshot.overId &&
        snapshot.overPlacement === nextSnapshot.overPlacement &&
        snapshot.overData === nextSnapshot.overData
      ) {
        return;
      }
      snapshot = nextSnapshot;
      listeners.forEach((listener) => listener());
    },
  };
}
