import { TOUCH_DRAG_HOLD_MS, TOUCH_DRAG_TOLERANCE_PX } from "../../lib/touch-drag";

/**
 * The pull-to-refresh gesture as a pure state machine (pull-to-refresh.md,
 * "Behavior"). `usePullToRefresh` feeds it the scroller's touch events; this
 * file owns every decision, so the rules can be tested without a DOM.
 */

/** How far the indicator has to be pulled, after damping, for a release to refresh. */
export const PULL_TO_REFRESH_THRESHOLD = 56;
/** The furthest the indicator follows the finger. */
export const PULL_TO_REFRESH_MAX_DISTANCE = 72;
/** The indicator's height while the refresh runs. */
export const PULL_TO_REFRESH_HOLD_DISTANCE = 36;
/** The indicator moves this fraction of the finger's travel: it lags, so the pull reads as resistance. */
export const PULL_TO_REFRESH_DAMPING = 0.42;
/** Finger travel before the page stops scrolling and the pull takes over. */
export const PULL_TO_REFRESH_SLOP = 6;
/** A finger held this long before it pulls is a long press (a menu, a drag), not a pull. */
export const PULL_TO_REFRESH_LONG_PRESS_MS = TOUCH_DRAG_HOLD_MS;
/** How far the finger may drift while it could still be a long press. */
export const PULL_TO_REFRESH_TOLERANCE = TOUCH_DRAG_TOLERANCE_PX;

/** Where a touch must not start a pull: text entry, and anything the consumer marks. */
export const PULL_TO_REFRESH_IGNORE_SELECTOR = [
  "input",
  "textarea",
  "select",
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[contenteditable="plaintext-only"]',
  "[data-pull-to-refresh-ignore]",
].join(", ");

export type PullToRefreshState = "idle" | "pulling" | "refreshing";

export type PullGestureConfig = {
  threshold: number;
  maxDistance: number;
  holdDistance: number;
};

export const DEFAULT_PULL_GESTURE_CONFIG: PullGestureConfig = {
  threshold: PULL_TO_REFRESH_THRESHOLD,
  maxDistance: PULL_TO_REFRESH_MAX_DISTANCE,
  holdDistance: PULL_TO_REFRESH_HOLD_DISTANCE,
};

export type PullGesture = {
  /**
   * `tracking`: a finger is down at the top but hasn't pulled past the slop
   * yet; nothing shows. `pulling`: the indicator follows the finger.
   */
  phase: "idle" | "tracking" | "pulling" | "refreshing";
  startX: number;
  startY: number;
  distance: number;
};

export const IDLE_PULL_GESTURE: PullGesture = { phase: "idle", startX: 0, startY: 0, distance: 0 };

export type PullGestureEvent =
  | { type: "start"; x: number; y: number; fingers: number; atTop: boolean; ignored: boolean }
  | { type: "move"; x: number; y: number; fingers: number; atTop: boolean }
  /** The finger has been down for the long-press time. */
  | { type: "hold" }
  | { type: "end" }
  /** The browser or another gesture took the touch: touchcancel, a menu, a drag. */
  | { type: "cancel" }
  /** The refresh's promise settled. */
  | { type: "settle" };

export type PullGestureStep = {
  gesture: PullGesture;
  /** Stop the browser scrolling or bouncing for this touchmove. */
  preventDefault: boolean;
  /** Call `onRefresh` now. */
  refresh: boolean;
};

/** How far the indicator is for a finger that has travelled `delta` px down. */
export function pullDistance(delta: number, maxDistance = PULL_TO_REFRESH_MAX_DISTANCE): number {
  if (delta <= 0) return 0;
  return Math.min(maxDistance, delta * PULL_TO_REFRESH_DAMPING);
}

/** How far towards the threshold the pull is, from 0 to 1. */
export function pullProgress(distance: number, threshold = PULL_TO_REFRESH_THRESHOLD): number {
  if (threshold <= 0) return 1;
  return Math.min(1, Math.max(0, distance / threshold));
}

/**
 * Which of the spinner's 4 pixels is lit while pulling, clockwise from the
 * top left: one step per quarter of the threshold, the last from the
 * threshold on (the same walk as the native apps' indicator).
 */
export function pullStep(progress: number): 0 | 1 | 2 | 3 {
  return Math.min(3, Math.floor(Math.max(0, progress) * 4)) as 0 | 1 | 2 | 3;
}

/** The state the indicator shows for a gesture. */
export function pullState(gesture: PullGesture): PullToRefreshState {
  if (gesture.phase === "refreshing") return "refreshing";
  return gesture.phase === "pulling" && gesture.distance > 0 ? "pulling" : "idle";
}

function step(gesture: PullGesture, preventDefault = false, refresh = false): PullGestureStep {
  return { gesture, preventDefault, refresh };
}

/** The next gesture for an event. */
export function stepPullGesture(
  gesture: PullGesture,
  event: PullGestureEvent,
  config: PullGestureConfig = DEFAULT_PULL_GESTURE_CONFIG,
): PullGestureStep {
  if (gesture.phase === "refreshing") {
    return step(event.type === "settle" ? IDLE_PULL_GESTURE : gesture);
  }

  switch (event.type) {
    case "start":
      if (event.fingers !== 1 || !event.atTop || event.ignored) return step(IDLE_PULL_GESTURE);
      return step({ phase: "tracking", startX: event.x, startY: event.y, distance: 0 });

    case "move": {
      if (gesture.phase === "idle") return step(gesture);
      if (event.fingers !== 1 || !event.atTop) return step(IDLE_PULL_GESTURE);
      const dx = event.x - gesture.startX;
      const dy = event.y - gesture.startY;
      if (gesture.phase === "tracking") {
        // Sideways first: a swipe on a row, a carousel. Upwards: scrolling.
        if (Math.abs(dx) > PULL_TO_REFRESH_TOLERANCE && Math.abs(dx) > dy) {
          return step(IDLE_PULL_GESTURE);
        }
        if (dy < -PULL_TO_REFRESH_SLOP) return step(IDLE_PULL_GESTURE);
        if (dy <= PULL_TO_REFRESH_SLOP) return step(gesture);
      }
      const distance = pullDistance(dy, config.maxDistance);
      return step({ ...gesture, phase: "pulling", distance }, dy > PULL_TO_REFRESH_SLOP);
    }

    case "hold":
      // Still within the slop after the long-press time: a menu or a drag is
      // starting, and the pull lets go. A pull already under way keeps going.
      return step(gesture.phase === "tracking" ? IDLE_PULL_GESTURE : gesture);

    case "end":
      if (gesture.phase === "pulling" && gesture.distance >= config.threshold) {
        return step(
          { ...gesture, phase: "refreshing", distance: config.holdDistance },
          false,
          true,
        );
      }
      return step(IDLE_PULL_GESTURE);

    case "cancel":
    case "settle":
      return step(IDLE_PULL_GESTURE);
  }
}
