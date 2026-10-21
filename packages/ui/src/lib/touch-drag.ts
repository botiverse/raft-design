import { useMemo } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { PointerSensor, TouchSensor, useSensor } from "@dnd-kit/core";
import type { PointerSensorOptions, TouchSensorOptions } from "@dnd-kit/core";

/**
 * How a finger picks up something that can be dragged
 * (design/foundations/states.md#dragging-on-a-touch-screen):
 *
 * - hold still for `TOUCH_DRAG_HOLD_MS`: the item is armed, the same moment a
 *   long press opens a menu (raft-ui's ContextMenuTrigger, iOS: 500ms);
 * - then move by `TOUCH_DRAG_DISTANCE_PX`: the drag starts, and whoever owns a
 *   menu that opened closes it in `onDragStart`;
 * - move by more than `TOUCH_DRAG_TOLERANCE_PX` before the hold is up, or put a
 *   second finger down: it was a scroll or a pinch, and the item lets go.
 *
 * dnd-kit's delay constraint starts the drag the moment the hold is up, at the
 * same time as the long press opens the menu, so the two fight. Starting on the
 * first move after the hold lets holding still mean "menu" and holding then
 * moving mean "drag", as on iOS.
 *
 * Pair it with `MouseOnlyPointerSensor`, not dnd-kit's PointerSensor: a phone
 * sends `pointerdown` (pointerType "touch") before `touchstart`, and the sensor
 * that takes the press first keeps it, so a PointerSensor would pick up every
 * touch on its distance and this sensor would never run.
 */
export const TOUCH_DRAG_HOLD_MS = 500;
export const TOUCH_DRAG_DISTANCE_PX = 10;
export const TOUCH_DRAG_TOLERANCE_PX = 10;

export type HoldThenMoveOptions = {
  /** How long the finger stays still before a move can start the drag. */
  holdMs?: number;
  /** How far the finger moves after the hold to start the drag. */
  distance?: number;
  /** How far the finger may drift during the hold before it counts as a scroll. */
  tolerance?: number;
};

type Point = { x: number; y: number };

// The fields and methods dnd-kit's pointer sensors keep (its typings mark them
// private); the subclass reads the same ones the base class does.
type SensorInternals = {
  activated: boolean;
  initialCoordinates: Point | null;
  props: { options: HoldThenMoveOptions };
  handleStart(): void;
  handleCancel(): void;
};

type HoldState = { timer: ReturnType<typeof setTimeout>; heldAt: Point | null; last: Point | null };

// Per-gesture state lives outside the instance: the base constructor calls
// `attach()` before a subclass's own fields would be initialized.
const holds = new WeakMap<object, HoldState>();

function touchPoint(event: Event): Point | null {
  const touch = (event as TouchEvent).touches?.[0] ?? (event as TouchEvent).changedTouches?.[0];
  return touch ? { x: touch.clientX, y: touch.clientY } : null;
}

function farther(from: Point, to: Point, limit: number) {
  return Math.hypot(to.x - from.x, to.y - from.y) > limit;
}

type SensorMethods = { attach(): void; detach(): void; handleMove(event: Event): void };

class HoldThenMoveTouchSensorImpl extends (TouchSensor as unknown as new (
  ...args: never[]
) => SensorMethods) {
  static activators = TouchSensor.activators;
  // Called through, not copied: an app may replace TouchSensor.setup at
  // runtime (to scope its touchmove listener, for one).
  static setup() {
    return TouchSensor.setup();
  }

  attach() {
    super.attach();
    const self = this as unknown as SensorInternals;
    const { holdMs = TOUCH_DRAG_HOLD_MS } = self.props.options;
    const state: HoldState = {
      heldAt: null,
      last: null,
      timer: setTimeout(() => {
        state.heldAt = state.last ?? self.initialCoordinates;
      }, holdMs),
    };
    holds.set(this, state);
  }

  handleMove(event: Event) {
    const self = this as unknown as SensorInternals;
    const state = holds.get(this);
    if (self.activated || !state) {
      super.handleMove(event);
      return;
    }
    // A second finger is a pinch or a scroll, not a pick-up.
    if (((event as TouchEvent).touches?.length ?? 1) > 1) {
      self.handleCancel();
      return;
    }
    const point = touchPoint(event);
    const start = self.initialCoordinates;
    if (!point || !start) return;
    state.last = point;
    const { distance = TOUCH_DRAG_DISTANCE_PX, tolerance = TOUCH_DRAG_TOLERANCE_PX } =
      self.props.options;
    if (!state.heldAt) {
      if (farther(start, point, tolerance)) self.handleCancel();
      return;
    }
    // Held: the page must not scroll under the finger while it decides.
    if (event.cancelable) event.preventDefault();
    if (farther(state.heldAt, point, distance)) self.handleStart();
  }

  detach() {
    const state = holds.get(this);
    if (state) clearTimeout(state.timer);
    holds.delete(this);
    super.detach();
  }
}

/** A TouchSensor that starts a drag on the first move after a still hold (see above). */
export const HoldThenMoveTouchSensor = HoldThenMoveTouchSensorImpl as unknown as typeof TouchSensor;

/**
 * dnd-kit's PointerSensor for a mouse and a pen only: a finger's pointerdown is
 * left to `HoldThenMoveTouchSensor`.
 */
export class MouseOnlyPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: (event: ReactPointerEvent, options: PointerSensorOptions) =>
        event.nativeEvent.pointerType === "touch"
          ? false
          : PointerSensor.activators[0].handler(event, options),
    },
  ];
}

/**
 * `useSensor(HoldThenMoveTouchSensor, …)` with the activation the sensor relies
 * on: no constraint dnd-kit would act on by itself, so only a move after the
 * hold starts the drag.
 */
export function useHoldThenMoveTouchSensor({
  holdMs = TOUCH_DRAG_HOLD_MS,
  distance = TOUCH_DRAG_DISTANCE_PX,
  tolerance = TOUCH_DRAG_TOLERANCE_PX,
}: HoldThenMoveOptions = {}) {
  const options = useMemo(
    () =>
      ({
        holdMs,
        distance,
        tolerance,
        activationConstraint: { distance: Number.POSITIVE_INFINITY },
      }) as TouchSensorOptions,
    [holdMs, distance, tolerance],
  );
  return useSensor(HoldThenMoveTouchSensor, options);
}

/** The mouse / pen sensor that goes with it: picks up after `distance` px. */
export function useMouseOnlyPointerSensor(distance: number) {
  const options = useMemo(() => ({ activationConstraint: { distance } }), [distance]);
  return useSensor(MouseOnlyPointerSensor, options);
}
