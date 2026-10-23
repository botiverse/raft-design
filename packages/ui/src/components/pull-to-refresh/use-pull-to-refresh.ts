import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { useLatestRef } from "../virtual-list/hooks/use-latest-ref";
import {
  DEFAULT_PULL_GESTURE_CONFIG,
  IDLE_PULL_GESTURE,
  PULL_TO_REFRESH_IGNORE_SELECTOR,
  PULL_TO_REFRESH_LONG_PRESS_MS,
  pullProgress,
  pullState,
  stepPullGesture,
} from "./pull-to-refresh-gesture";
import type { PullGesture, PullGestureEvent, PullToRefreshState } from "./pull-to-refresh-gesture";

/** A primary pointer that is a finger: the only input pull to refresh answers. */
export const PULL_TO_REFRESH_POINTER_QUERY = "(pointer: coarse)";

/**
 * How the pull looks. `default` (iOS and every other touch screen), as in
 * the iOS app: the content moves down with the pull and the indicator sits in
 * the space it opens. `android` follows Material 3: the indicator travels
 * down over the content, which stays still, and arming the pull gives a
 * short vibration.
 */
export type PullToRefreshPlatform = "default" | "android";

/** The one platform check: Android, by its user agent (Client Hints first). */
export function detectPullToRefreshPlatform(): PullToRefreshPlatform {
  if (typeof navigator === "undefined") return "default";
  const hints = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (hints?.platform) return hints.platform === "Android" ? "android" : "default";
  return /\bAndroid\b/i.test(navigator.userAgent) ? "android" : "default";
}

/** The haptic tick on Android when the pull arms, where the browser has one. */
export const PULL_TO_REFRESH_HAPTIC_MS = 10;

function hapticTick() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(PULL_TO_REFRESH_HAPTIC_MS);
  }
}

const subscribeNever = () => () => undefined;
const defaultSnapshot = (): PullToRefreshPlatform => "default";

export type UsePullToRefreshOptions = {
  /**
   * Reload the page's snapshot. The indicator holds until the promise
   * settles. Handle a failure here (keep the content, show the same toast as
   * a failed first load): a rejection only ends the refresh.
   */
  onRefresh: () => Promise<unknown>;
  /** Turn the gesture off, such as while the first load is still running or a search is empty. */
  disabled?: boolean;
  /** Pull distance, after damping, that arms the refresh. Default 100px. */
  threshold?: number;
  /** The furthest the indicator follows the finger. Default 140px. */
  maxDistance?: number;
  /** The indicator's height while refreshing. Default 60px. */
  holdDistance?: number;
  /** Override the detected platform, such as in a preview. */
  platform?: PullToRefreshPlatform;
};

export type PullToRefresh = {
  /** `idle`, `pulling` while a finger pulls the indicator down, `refreshing` until `onRefresh` settles. */
  state: PullToRefreshState;
  /** The indicator's height in px. */
  distance: number;
  /** How far towards the threshold the pull is, from 0 to 1; 1 once armed and while refreshing. */
  progress: number;
  /** Which platform's look the indicator takes. */
  platform: PullToRefreshPlatform;
};

function subscribeCoarse(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }
  const media = window.matchMedia(PULL_TO_REFRESH_POINTER_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function coarseSnapshot() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(PULL_TO_REFRESH_POINTER_QUERY).matches
  );
}

function ignoredTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest(PULL_TO_REFRESH_IGNORE_SELECTOR) !== null;
}

/**
 * Pull to refresh for a scroll container on a touch screen
 * (pull-to-refresh.md). Pulling down from the top of `scrollRef` past the
 * threshold calls `onRefresh`; render a `PullToRefreshIndicator` with the
 * result as the scroller's first child.
 *
 * On Android it takes Material 3's look (`PullToRefreshPlatform`). It does
 * nothing on a fine pointer. While it is on, the scroller gets
 * `overscroll-behavior-y: contain`, so a browser tab's own pull to reload
 * doesn't run as well. `scrollRef` is read when the hook turns on; a
 * scroller that is replaced later needs the hook remounted (a `key`).
 */
export function usePullToRefresh(
  scrollRef: RefObject<HTMLElement | null>,
  {
    onRefresh,
    disabled = false,
    threshold = DEFAULT_PULL_GESTURE_CONFIG.threshold,
    maxDistance = DEFAULT_PULL_GESTURE_CONFIG.maxDistance,
    holdDistance = DEFAULT_PULL_GESTURE_CONFIG.holdDistance,
    platform: platformOverride,
  }: UsePullToRefreshOptions,
): PullToRefresh {
  const coarse = useSyncExternalStore(subscribeCoarse, coarseSnapshot, () => false);
  const detected = useSyncExternalStore(
    subscribeNever,
    detectPullToRefreshPlatform,
    defaultSnapshot,
  );
  const platform = platformOverride ?? detected;
  const enabled = coarse && !disabled;
  const [gesture, setGesture] = useState<PullGesture>(IDLE_PULL_GESTURE);
  const gestureRef = useRef<PullGesture>(IDLE_PULL_GESTURE);
  const onRefreshRef = useLatestRef(onRefresh);

  useEffect(() => {
    const element = scrollRef.current;
    if (!enabled || !element) return;
    const config = { threshold, maxDistance, holdDistance };
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    let live = true;

    const dispatch = (event: PullGestureEvent, native?: Event) => {
      const next = stepPullGesture(gestureRef.current, event, config);
      if (next.preventDefault && native?.cancelable) native.preventDefault();
      if (next.gesture !== gestureRef.current) {
        gestureRef.current = next.gesture;
        setGesture(next.gesture);
      }
      if (next.gesture.phase !== "tracking") clearTimeout(holdTimer);
      if (next.armed && platform === "android") hapticTick();
      if (next.refresh) {
        const settle = () => {
          if (live) dispatch({ type: "settle" });
        };
        let result: Promise<unknown>;
        try {
          result = Promise.resolve(onRefreshRef.current());
        } catch (error) {
          result = Promise.reject(error);
        }
        void result.then(settle, settle);
      }
    };

    const atTop = () => element.scrollTop <= 0;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      dispatch({
        type: "start",
        x: touch?.clientX ?? 0,
        y: touch?.clientY ?? 0,
        fingers: event.touches.length,
        atTop: atTop(),
        ignored: ignoredTarget(event.target),
      });
      if (gestureRef.current.phase === "tracking") {
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => dispatch({ type: "hold" }), PULL_TO_REFRESH_LONG_PRESS_MS);
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      // Something under the finger already took this move (a drag sensor).
      if (event.defaultPrevented && gestureRef.current.phase === "tracking") {
        dispatch({ type: "cancel" });
        return;
      }
      const touch = event.touches[0];
      dispatch(
        {
          type: "move",
          x: touch?.clientX ?? 0,
          y: touch?.clientY ?? 0,
          fingers: event.touches.length,
          atTop: atTop(),
        },
        event,
      );
    };
    const onTouchEnd = () => dispatch({ type: "end" });
    const onCancel = () => dispatch({ type: "cancel" });

    const previousOverscroll = element.style.overscrollBehaviorY;
    element.style.overscrollBehaviorY = "contain";
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchmove", onTouchMove, { passive: false });
    element.addEventListener("touchend", onTouchEnd, { passive: true });
    element.addEventListener("touchcancel", onCancel, { passive: true });
    element.addEventListener("contextmenu", onCancel);
    element.addEventListener("dragstart", onCancel);

    return () => {
      live = false;
      clearTimeout(holdTimer);
      element.style.overscrollBehaviorY = previousOverscroll;
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchmove", onTouchMove);
      element.removeEventListener("touchend", onTouchEnd);
      element.removeEventListener("touchcancel", onCancel);
      element.removeEventListener("contextmenu", onCancel);
      element.removeEventListener("dragstart", onCancel);
      gestureRef.current = IDLE_PULL_GESTURE;
      setGesture(IDLE_PULL_GESTURE);
    };
  }, [enabled, scrollRef, onRefreshRef, threshold, maxDistance, holdDistance, platform]);

  const state = pullState(gesture);
  const distance = state === "idle" ? 0 : gesture.distance;
  return {
    state,
    distance,
    progress: state === "refreshing" || gesture.armed ? 1 : pullProgress(distance, threshold),
    platform,
  };
}
