/*
 * What VirtualList reads about the platform: iOS (for the momentum-scroll compensation), the pointer and
 * the wheel's scale.
 */

/** Running in a browser. */
const isBrowser = typeof document !== "undefined" && typeof window !== "undefined";

/**
 * An iPhone, iPad or iPod, or an iPad that reports itself as a Mac with touch points
 * (`navigator.platform` is deprecated, but it still tells iPadOS from macOS here).
 */
export const isIOS =
  !!isBrowser &&
  (/iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
  !(window as Window & { MSStream?: unknown }).MSStream;

/* What the wheel handling reads once per page, cached at module scope. */

let coarsePointerCache: boolean | undefined;
let devicePixelRatioCache: number | undefined;
let nextFrameCallback: (() => void) | undefined;
let nextFrameHandle: number | undefined;

/** Whether the primary pointer is coarse (a touch screen); read once. */
export function isCoarsePointer(): boolean {
  if (coarsePointerCache === undefined) {
    coarsePointerCache = "matchMedia" in window && window.matchMedia("(pointer:coarse)").matches;
  }
  return coarsePointerCache;
}

/**
 * What wheel deltas are divided by: `devicePixelRatio` in Chromium (`"chrome" in window`), else 1;
 * read once.
 */
export function getWheelDeltaScale(): number {
  if (typeof document === "undefined") {
    return 1;
  }
  if (devicePixelRatioCache === undefined) {
    devicePixelRatioCache = "chrome" in window ? window.devicePixelRatio : 1;
  }
  return devicePixelRatioCache;
}

/**
 * Runs `callback` in the next animation frame. One frame is requested at a time: a callback given
 * before it fires replaces the previous one.
 */
export function runLatestInNextFrame(callback: () => void): void {
  nextFrameCallback = callback;
  if (nextFrameHandle === undefined) {
    nextFrameHandle = requestAnimationFrame(() => {
      nextFrameCallback?.();
      nextFrameHandle = undefined;
    });
  }
}
