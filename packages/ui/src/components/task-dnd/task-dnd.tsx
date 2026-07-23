"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import {
  createContext,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type Ref,
  type ReactNode,
} from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { taskDnd } from "./task-dnd.recipe";

export type TaskDropState = "idle" | "allowed" | "blocked";
export type TaskDropPlacement = "before" | "after";
export type TaskDropData = Record<string, unknown>;

type TaskDndContextValue = {
  activeId: UniqueIdentifier | null;
  activeHeight: number | null;
  overId: UniqueIdentifier | null;
  overPlacement: TaskDropPlacement | null;
  overData: TaskDropData | undefined;
  isDropAllowed: (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
    overData: TaskDropData | undefined,
  ) => boolean;
};

const TaskDndContext = createContext<TaskDndContextValue | null>(null);
const allowTaskDrop = () => true;

export type TaskMoveDetails = {
  activeId: UniqueIdentifier;
  overId: UniqueIdentifier;
  overData: TaskDropData | undefined;
  placement: TaskDropPlacement | null;
};

export type TaskDndProviderProps = {
  children: ReactNode;
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
  const [activeHeight, setActiveHeight] = useState<number | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [overPlacement, setOverPlacement] = useState<TaskDropPlacement | null>(null);
  const [overData, setOverData] = useState<TaskDropData | undefined>(undefined);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const context = useMemo(
    () =>
      ({
        activeId,
        activeHeight,
        overId,
        overPlacement,
        overData,
        isDropAllowed,
      }) satisfies TaskDndContextValue,
    [activeHeight, activeId, overData, overId, overPlacement, isDropAllowed],
  );
  const reset = useCallback(() => {
    setActiveId(null);
    setActiveHeight(null);
    setOverId(null);
    setOverPlacement(null);
    setOverData(undefined);
  }, []);

  return (
    <DndContext
      id={id}
      sensors={disabled ? [] : sensors}
      onDragStart={(event) => {
        setActiveId(event.active.id);
        setActiveHeight(event.active.rect.current.initial?.height ?? null);
        onDragStart?.(event);
      }}
      onDragMove={(event) => {
        setOverPlacement(getDropPlacement(event));
        onDragMove?.(event);
      }}
      onDragOver={(event) => {
        setOverId(event.over?.id ?? null);
        setOverPlacement(getDropPlacement(event));
        setOverData(event.over?.data.current as TaskDropData | undefined);
        onDragOver?.(event);
      }}
      onDragCancel={(event) => {
        reset();
        onDragCancel?.(event);
      }}
      onDragEnd={(event) => {
        const nextActiveId = event.active.id;
        const nextOverId = event.over?.id;
        const nextOverData = event.over?.data.current as TaskDropData | undefined;
        if (nextOverId != null && isDropAllowed(nextActiveId, nextOverId, nextOverData)) {
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
      }}
    >
      <TaskDndContext value={context}>{children}</TaskDndContext>
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
  const theme = useThemeFamily();
  const { draggable } = taskDnd({ theme });
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });
  const { setNodeRef: setDropNodeRef, isOver: isDropOver } = useDroppable({
    id: dropId ?? id,
    data: dropData,
    disabled: dropId == null || dropDisabled,
  });
  const dragStyle: CSSProperties = {
    transform: CSS.Translate.toString(transform),
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
  const dropState = getDropState(context, id, isOver);

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
  const theme = useThemeFamily();
  const context = use(TaskDndContext);
  const { placeholder } = taskDnd({ theme });
  const dropState = getDropState(
    context,
    id,
    context?.overId === id && (placement == null || context?.overPlacement === placement),
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
      className: placeholder({ className }),
      style: placeholderStyle,
      ...props,
    },
  });
}

export type TaskDragOverlayProps = {
  children?: ReactNode;
  className?: string;
};

export function TaskDragOverlay({ children, className }: TaskDragOverlayProps) {
  const theme = useThemeFamily();
  const { overlay } = taskDnd({ theme });

  return (
    <DragOverlay dropAnimation={null}>
      {children == null ? null : (
        <div data-slot="task-drag-overlay" data-dragging="true" className={overlay({ className })}>
          {children}
        </div>
      )}
    </DragOverlay>
  );
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
): TaskDropState {
  const activeId = context?.activeId ?? null;
  if (!isOver || activeId == null) return "idle";
  return context?.isDropAllowed(activeId, id, context.overData) ? "allowed" : "blocked";
}
