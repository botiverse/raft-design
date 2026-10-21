import { useMemo } from "react";
import { TouchSensor, useSensor } from "@dnd-kit/core";
import type { TouchSensorOptions } from "@dnd-kit/core";

/**
 * How a finger picks up something that can be dragged
 * (design/foundations/states.md#dragging-on-a-touch-screen):
 *
 * - hold still for `TOUCH_DRAG_HOLD_MS`: the item is armed, and if it has a
 *   menu the platform's long press opens it;
 * - then move by `TOUCH_DRAG_DISTANCE_PX`: the drag starts, and the app closes
 *   that menu in its `onDragStart`;
 * - move by more than `TOUCH_DRAG_TOLERANCE_PX` before the hold is up: it was a
 *   scroll, and the item lets go.
 *
 * dnd-kit's delay constraint starts the drag the moment the hold is up, at the
 * same time as the long press opens the menu, so the two fight. Starting on the
 * first move after the hold lets holding still mean "menu" and holding then
 * moving mean "drag", as on iOS.
 */
export const TOUCH_DRAG_HOLD_MS = 400;
export const TOUCH_DRAG_DISTANCE_PX = 8;
export const TOUCH_DRAG_TOLERANCE_PX = 8;

export type HoldThenMoveTouchSensorOptions = Omit<TouchSensorOptions, "activationConstraint"> & {
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
  props: { options: HoldThenMoveTouchSensorOptions };
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

type SensorClass = new (...args: never[]) => object;
const Base = TouchSensor as unknown as SensorClass & {
  prototype: { attach(): void; detach(): void; handleMove(event: Event): void };
};

class HoldThenMoveTouchSensorImpl extends (Base as unknown as new (...args: never[]) => {
  attach(): void;
  detach(): void;
  handleMove(event: Event): void;
}) {
  static activators = TouchSensor.activators;
  // Called through, not copied: an app may replace TouchSensor.setup at
  // runtime (slock scopes its touchmove listener that way).
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
 * `useSensor(HoldThenMoveTouchSensor, …)` with the activation the sensor
 * relies on: no constraint dnd-kit would act on by itself, so only a move after
 * the hold starts the drag.
 */
export function useHoldThenMoveTouchSensor({
  holdMs = TOUCH_DRAG_HOLD_MS,
  distance = TOUCH_DRAG_DISTANCE_PX,
  tolerance = TOUCH_DRAG_TOLERANCE_PX,
}: Pick<HoldThenMoveTouchSensorOptions, "holdMs" | "distance" | "tolerance"> = {}) {
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
