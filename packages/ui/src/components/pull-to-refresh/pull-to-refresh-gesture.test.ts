import { describe, expect, test } from "vite-plus/test";
import {
  DEFAULT_PULL_GESTURE_CONFIG,
  IDLE_PULL_GESTURE,
  PULL_TO_REFRESH_DAMPING,
  PULL_TO_REFRESH_HOLD_DISTANCE,
  PULL_TO_REFRESH_MAX_DISTANCE,
  PULL_TO_REFRESH_SNAP_BACK_MS,
  PULL_TO_REFRESH_THRESHOLD,
  pullDistance,
  pullProgress,
  pullState,
  pullStep,
  stepPullGesture,
} from "./pull-to-refresh-gesture";
import type { PullGesture, PullGestureEvent } from "./pull-to-refresh-gesture";

const start = (y = 100, extra: Partial<Extract<PullGestureEvent, { type: "start" }>> = {}) =>
  ({ type: "start", x: 50, y, fingers: 1, atTop: true, ignored: false, ...extra }) as const;
const move = (y: number, extra: Partial<Extract<PullGestureEvent, { type: "move" }>> = {}) =>
  ({ type: "move", x: 50, y, fingers: 1, atTop: true, ...extra }) as const;

const ANDROID = { ...DEFAULT_PULL_GESTURE_CONFIG, latch: false };

function run(
  events: PullGestureEvent[],
  from: PullGesture = IDLE_PULL_GESTURE,
  config = DEFAULT_PULL_GESTURE_CONFIG,
) {
  let gesture = from;
  let refreshed = 0;
  let prevented = 0;
  let armed = 0;
  for (const event of events) {
    const next = stepPullGesture(gesture, event, config);
    gesture = next.gesture;
    if (next.refresh) refreshed += 1;
    if (next.preventDefault) prevented += 1;
    if (next.armed) armed += 1;
  }
  return { gesture, refreshed, prevented, armed };
}

// A finger travel that damps to just past the threshold, and one just short of it.
const PAST = Math.ceil(PULL_TO_REFRESH_THRESHOLD / PULL_TO_REFRESH_DAMPING) + 1;
const SHORT = Math.floor(PULL_TO_REFRESH_THRESHOLD / PULL_TO_REFRESH_DAMPING) - 2;

describe("the tuning", () => {
  test("matches the iOS app (mobile #3553)", () => {
    expect(PULL_TO_REFRESH_THRESHOLD).toBe(100);
    expect(PULL_TO_REFRESH_HOLD_DISTANCE).toBe(60);
    expect(PULL_TO_REFRESH_DAMPING).toBe(0.55);
    expect(PULL_TO_REFRESH_MAX_DISTANCE).toBe(140);
    expect(PULL_TO_REFRESH_SNAP_BACK_MS).toBe(300);
  });
});

describe("pullDistance", () => {
  test("damps the finger's travel by 0.55 and stops at the ceiling", () => {
    expect(pullDistance(0)).toBe(0);
    expect(pullDistance(-20)).toBe(0);
    expect(pullDistance(100)).toBeCloseTo(55);
    // The threshold takes about 182px of finger travel, the ceiling about 255px.
    expect(pullDistance(181)).toBeLessThan(PULL_TO_REFRESH_THRESHOLD);
    expect(pullDistance(182)).toBeGreaterThanOrEqual(PULL_TO_REFRESH_THRESHOLD);
    expect(pullDistance(250)).toBeCloseTo(137.5);
    expect(pullDistance(1000)).toBe(PULL_TO_REFRESH_MAX_DISTANCE);
  });
});

describe("pullProgress and pullStep", () => {
  test("progress runs from 0 to 1 at the threshold", () => {
    expect(pullProgress(0)).toBe(0);
    expect(pullProgress(25)).toBe(0.25);
    expect(pullProgress(50)).toBe(0.5);
    expect(pullProgress(99)).toBe(0.99);
    expect(pullProgress(100)).toBe(1);
    expect(pullProgress(PULL_TO_REFRESH_MAX_DISTANCE)).toBe(1);
  });

  test("the lit pixel walks one step per quarter, the last from the threshold on", () => {
    expect(pullStep(0)).toBe(0);
    expect(pullStep(0.3)).toBe(1);
    expect(pullStep(0.6)).toBe(2);
    expect(pullStep(0.8)).toBe(3);
    expect(pullStep(1)).toBe(3);
    expect(pullStep(1.5)).toBe(3);
  });
});

describe("stepPullGesture", () => {
  test("a pull past the threshold refreshes on release and holds the indicator", () => {
    const { gesture, refreshed } = run([start(), move(100 + PAST), { type: "end" }]);
    expect(refreshed).toBe(1);
    expect(gesture.phase).toBe("refreshing");
    expect(gesture.distance).toBe(PULL_TO_REFRESH_HOLD_DISTANCE);
    expect(pullState(gesture)).toBe("refreshing");
  });

  test("latches by default (iOS): past the threshold, then back above it, a release still refreshes", () => {
    const pulled = run([start(), move(100 + PAST), move(100 + SHORT), move(100 + 20)]);
    expect(pulled.armed).toBe(1);
    expect(pulled.gesture.armed).toBe(true);
    expect(pulled.gesture.distance).toBeLessThan(PULL_TO_REFRESH_THRESHOLD);
    expect(pullState(pulled.gesture)).toBe("pulling");
    const released = run([{ type: "end" }], pulled.gesture);
    expect(released.refreshed).toBe(1);
    expect(released.gesture.phase).toBe("refreshing");
    expect(released.gesture.distance).toBe(PULL_TO_REFRESH_HOLD_DISTANCE);
  });

  test("latches on every platform but Android (the default config)", () => {
    expect(DEFAULT_PULL_GESTURE_CONFIG.latch).toBe(true);
  });

  test("on Android, moving back above the threshold disarms: the release doesn't refresh", () => {
    const pulled = run([start(), move(100 + PAST), move(100 + SHORT)], IDLE_PULL_GESTURE, ANDROID);
    expect(pulled.armed).toBe(1);
    expect(pulled.gesture.armed).toBe(false);
    expect(pullState(pulled.gesture)).toBe("pulling");
    const released = run([{ type: "end" }], pulled.gesture, ANDROID);
    expect(released.refreshed).toBe(0);
    expect(released.gesture).toEqual(IDLE_PULL_GESTURE);
  });

  test("on Android, a pull still past the threshold on release refreshes", () => {
    const { gesture, refreshed } = run(
      [start(), move(100 + PAST), move(100 + SHORT), move(100 + PAST), { type: "end" }],
      IDLE_PULL_GESTURE,
      ANDROID,
    );
    expect(refreshed).toBe(1);
    expect(gesture.phase).toBe("refreshing");
  });

  test("on Android, each crossing of the threshold arms again (one haptic per crossing)", () => {
    expect(
      run(
        [start(), move(100 + PAST), move(100 + SHORT), move(100 + PAST)],
        IDLE_PULL_GESTURE,
        ANDROID,
      ).armed,
    ).toBe(2);
  });

  test("an armed pull keeps the touch, even back past where it started", () => {
    const { gesture, refreshed, prevented } = run([
      start(),
      move(100 + PAST),
      move(80),
      move(70, { atTop: false }),
      { type: "end" },
    ]);
    expect(prevented).toBe(3);
    expect(refreshed).toBe(1);
    expect(gesture.phase).toBe("refreshing");
  });

  test("arms once, on the move that crosses the threshold (the Android haptic)", () => {
    expect(run([start(), move(100 + SHORT)]).armed).toBe(0);
    const crossed = run([start(), move(100 + SHORT), move(100 + PAST), move(100 + PAST + 40)]);
    expect(crossed.armed).toBe(1);
    expect(run([start(), move(100 + PAST), move(100 + SHORT), move(100 + PAST)]).armed).toBe(1);
  });

  test("a cancel still drops an armed pull", () => {
    const { gesture, refreshed } = run([start(), move(100 + PAST), { type: "cancel" }]);
    expect(refreshed).toBe(0);
    expect(gesture).toEqual(IDLE_PULL_GESTURE);
  });

  test("a pull short of the threshold springs back without refreshing", () => {
    const pulled = run([start(), move(100 + SHORT)]);
    expect(pullState(pulled.gesture)).toBe("pulling");
    const { gesture, refreshed } = run([{ type: "end" }], pulled.gesture);
    expect(refreshed).toBe(0);
    expect(gesture).toEqual(IDLE_PULL_GESTURE);
  });

  test("starts only at the top, with one finger, outside ignored elements", () => {
    expect(run([start(100, { atTop: false }), move(100 + PAST)]).gesture.phase).toBe("idle");
    expect(run([start(100, { fingers: 2 }), move(100 + PAST)]).gesture.phase).toBe("idle");
    expect(run([start(100, { ignored: true }), move(100 + PAST)]).gesture.phase).toBe("idle");
  });

  test("lets the page scroll until the finger passes the slop", () => {
    const small = run([start(), move(104)]);
    expect(small.gesture.phase).toBe("tracking");
    expect(small.prevented).toBe(0);
    const pulled = run([start(), move(120)]);
    expect(pulled.gesture.phase).toBe("pulling");
    expect(pulled.prevented).toBe(1);
  });

  test("a sideways or upward move is not a pull", () => {
    expect(run([start(), move(103, { x: 80 }), move(100 + PAST)]).gesture.phase).toBe("idle");
    expect(run([start(), move(90), move(100 + PAST)]).gesture.phase).toBe("idle");
  });

  test("a long press before the pull cancels it; one during the pull does not", () => {
    expect(run([start(), { type: "hold" }, move(100 + PAST)]).gesture.phase).toBe("idle");
    const pulling = run([start(), move(100 + PAST), { type: "hold" }, { type: "end" }]);
    expect(pulling.refreshed).toBe(1);
  });

  test("leaving the top or a second finger ends the pull", () => {
    expect(run([start(), move(150), move(160, { atTop: false })]).gesture.phase).toBe("idle");
    expect(run([start(), move(150), move(160, { fingers: 2 })]).gesture.phase).toBe("idle");
  });

  test("a cancel drops the pull without refreshing", () => {
    const { gesture, refreshed } = run([
      start(),
      move(100 + PAST),
      { type: "cancel" },
      { type: "end" },
    ]);
    expect(refreshed).toBe(0);
    expect(gesture.phase).toBe("idle");
  });

  test("while refreshing, touches are ignored until the refresh settles", () => {
    const refreshing = run([start(), move(100 + PAST), { type: "end" }]).gesture;
    const again = run([start(), move(100 + PAST), { type: "end" }, { type: "cancel" }], refreshing);
    expect(again.refreshed).toBe(0);
    expect(again.gesture).toBe(refreshing);
    expect(run([{ type: "settle" }], refreshing).gesture).toEqual(IDLE_PULL_GESTURE);
  });
});
