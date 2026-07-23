"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
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

type TaskDndContextValue = {
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  isDropAllowed: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => boolean;
};

const TaskDndContext = createContext<TaskDndContextValue | null>(null);
const allowTaskDrop = () => true;

export type TaskMoveDetails = {
  activeId: UniqueIdentifier;
  overId: UniqueIdentifier;
};

export type TaskDndProviderProps = {
  children: ReactNode;
  disabled?: boolean;
  isDropAllowed?: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => boolean;
  onMove?: (details: TaskMoveDetails) => void | Promise<void>;
  onMoveError?: (error: unknown, details: TaskMoveDetails) => void;
  onDragStart?: (event: DragStartEvent) => void;
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
  onDragOver,
  onDragCancel,
  onDragEnd,
}: TaskDndProviderProps) {
  const id = useId();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const context = useMemo(
    () => ({ activeId, overId, isDropAllowed }) satisfies TaskDndContextValue,
    [activeId, overId, isDropAllowed],
  );
  const reset = useCallback(() => {
    setActiveId(null);
    setOverId(null);
  }, []);

  return (
    <DndContext
      id={id}
      sensors={disabled ? [] : sensors}
      onDragStart={(event) => {
        setActiveId(event.active.id);
        onDragStart?.(event);
      }}
      onDragOver={(event) => {
        setOverId(event.over?.id ?? null);
        onDragOver?.(event);
      }}
      onDragCancel={(event) => {
        reset();
        onDragCancel?.(event);
      }}
      onDragEnd={(event) => {
        const nextActiveId = event.active.id;
        const nextOverId = event.over?.id;
        if (nextOverId != null && isDropAllowed(nextActiveId, nextOverId)) {
          const details = { activeId: nextActiveId, overId: nextOverId };
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
};

export function TaskDraggable({
  id,
  disabled = false,
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
  const dragStyle: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    ...style,
  };
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      assignRef(consumerRef, node);
    },
    [consumerRef, setNodeRef],
  );
  const mergedProps = mergeProps<"div">(attributes, listeners, props);

  return (
    <div
      {...mergedProps}
      ref={mergedRef}
      data-slot="task-draggable"
      data-dragging={isDragging ? "true" : undefined}
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
};

export function TaskDropZone({ id, disabled = false, render, ...props }: TaskDropZoneProps) {
  const context = use(TaskDndContext);
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  const activeId = context?.activeId ?? null;
  const dropState: TaskDropState =
    !isOver || activeId == null
      ? "idle"
      : context?.isDropAllowed(activeId, id)
        ? "allowed"
        : "blocked";

  return useRender({
    defaultTagName: "div",
    render,
    ref: setNodeRef,
    state: { dropState },
    props: {
      "data-slot": "task-drop-zone",
      "data-drop-state": dropState,
      "aria-disabled": disabled || undefined,
      ...props,
    },
  });
}
