"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { KeyboardSensor, useDndContext, useSensor, useSensors } from "@dnd-kit/core";
import type {
  CollisionDetection,
  KeyboardCoordinateGetter,
  KeyboardSensorOptions,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useHoldThenMoveTouchSensor, useMouseOnlyPointerSensor } from "../../lib/touch-drag";
import type { HoldThenMoveOptions } from "../../lib/touch-drag";

/**
 * A mouse or a pen picks an item up once it has moved this far, so a click
 * never moves anything (design/patterns/drag-and-drop.md#starting-a-drag).
 */
export const MOUSE_DRAG_DISTANCE_PX = 6;

/**
 * Space picks up and drops, Escape puts back, the arrow keys move. Enter
 * never starts a drag: on an item that can also be opened or activated, Enter
 * does that.
 */
export const DRAG_KEYBOARD_CODES: NonNullable<KeyboardSensorOptions["keyboardCodes"]> = {
  start: ["Space"],
  cancel: ["Escape"],
  end: ["Space"],
};

export type DragSensorsOptions = {
  /**
   * How the arrow keys move a lifted item. Defaults to
   * `dragKeyboardCoordinates`, which steps through a sortable list.
   */
  coordinateGetter?: KeyboardCoordinateGetter;
  /** Leave the keyboard out, for a surface whose keyboard path is a button. */
  keyboard?: boolean;
  /** The touch hold, distance and tolerance; the defaults are the system's. */
  touch?: HoldThenMoveOptions;
};

const NO_TOUCH: HoldThenMoveOptions = {};

/**
 * The one sensor set for everything that can be dragged
 * (design/patterns/drag-and-drop.md#starting-a-drag):
 *
 * - a mouse or a pen: after 6px of movement;
 * - a finger: hold still 500ms, then move 10px (`useHoldThenMoveTouchSensor`);
 * - the keyboard: Space picks up, the arrows move, Space drops, Escape puts
 *   back. Enter never starts a drag.
 */
export function useDragSensors({
  coordinateGetter = dragKeyboardCoordinates,
  keyboard = true,
  touch = NO_TOUCH,
}: DragSensorsOptions = {}) {
  const keyboardOptions = useMemo<KeyboardSensorOptions>(
    () => ({ keyboardCodes: DRAG_KEYBOARD_CODES, coordinateGetter }),
    [coordinateGetter],
  );
  const mouse = useMouseOnlyPointerSensor(MOUSE_DRAG_DISTANCE_PX);
  const finger = useHoldThenMoveTouchSensor(touch);
  const keys = useSensor(KeyboardSensor, keyboardOptions);
  return useSensors(mouse, finger, keyboard ? keys : null);
}

/**
 * dnd-kit's sortable keyboard steps, measured from where the item's place
 * actually is (its own node, slid into the landing spot) rather than from the
 * lifted copy. After an item moves into another list the two differ, and the
 * arrows would skip a place. Use it for lists inside one `DndContext`.
 */
export const dragKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  const { context } = args;
  const node =
    context.active == null ? null : context.draggableNodes.get(context.active.id)?.node.current;
  if (!node) return sortableKeyboardCoordinates(event, args);
  const rect = node.getBoundingClientRect();
  const collisionRect = {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom,
    right: rect.right,
  };
  return sortableKeyboardCoordinates(event, { ...args, context: { ...context, collisionRect } });
};

export type DragAcrossLists = {
  /** The caller's collision detection, holding the item over itself right after it moves list. */
  collisionDetection: CollisionDetection;
  /** Pass to `useDragSensors({ coordinateGetter })`. */
  coordinateGetter: KeyboardCoordinateGetter;
  /**
   * Call when the item has just been moved into another list. By keyboard it
   * then stays over itself until the next arrow; by pointer, for one frame.
   */
  moved: (viaKeyboard: boolean) => void;
  /** Call when the drag ends or is cancelled. */
  reset: () => void;
};

/**
 * The keyboard fix for an item that moves between lists while it is dragged
 * (a sidebar's sections, a board's columns). Without it, dnd-kit still counts
 * the row the item was put next to as the place under it, projects one more
 * move, and the next arrow skips a place: what is announced and where the item
 * drops disagree. With it:
 *
 * - right after it moves list, the item is over itself (by keyboard until the
 *   next arrow, by pointer for one frame);
 * - the arrows are measured from the item's real place (`dragKeyboardCoordinates`).
 *
 * Render `DragRemeasure` too, so the lists are measured again after the move.
 */
export function useDragAcrossLists(collisionDetection: CollisionDetection): DragAcrossLists {
  // Shared by the handlers; read only inside them, never while rendering.
  const box = useRef({ overSelf: false, justMoved: false, frame: 0 });

  return useMemo<DragAcrossLists>(() => {
    const clearFrame = () => {
      const state = box.current;
      if (state.frame && typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(state.frame);
      }
      state.frame = 0;
    };
    return {
      collisionDetection: (args) =>
        (box.current.justMoved || box.current.overSelf) && args.active
          ? [{ id: args.active.id }]
          : collisionDetection(args),
      coordinateGetter: (event, args) => {
        box.current.overSelf = false;
        return dragKeyboardCoordinates(event, args);
      },
      moved: (viaKeyboard) => {
        const state = box.current;
        state.justMoved = true;
        if (viaKeyboard) state.overSelf = true;
        clearFrame();
        if (typeof requestAnimationFrame === "undefined") {
          state.justMoved = false;
          return;
        }
        // Two frames: the move has rendered and been measured.
        state.frame = requestAnimationFrame(() => {
          state.frame = requestAnimationFrame(() => {
            state.justMoved = false;
            state.frame = 0;
          });
        });
      },
      reset: () => {
        clearFrame();
        box.current.overSelf = false;
        box.current.justMoved = false;
      },
    };
  }, [collisionDetection]);
}

export type DragRemeasureProps = {
  /** Anything that changes when an item moves list, such as the lists' items. */
  version: unknown;
};

/**
 * Measures every drop target again once an item's move into another list has
 * rendered. dnd-kit's own observers skip targets whose size didn't change,
 * even when they moved. Render it inside the `DndContext`.
 */
export function DragRemeasure({ version }: DragRemeasureProps) {
  const context = useDndContext();
  const latest = useRef(context);
  useLayoutEffect(() => {
    latest.current = context;
  });
  useLayoutEffect(() => {
    const { active, droppableContainers } = latest.current;
    if (active) latest.current.measureDroppableContainers([...droppableContainers.keys()]);
  }, [version]);
  return null;
}
