import { useSyncExternalStore } from "react";

/**
 * The keyboard a shortcut is written for: `mac` (macOS, iOS and iPadOS, whose
 * keyboards have Command and Option) or `other` (Windows, Linux, ChromeOS,
 * Android), whose keyboards have Ctrl and Alt.
 */
export type KeyboardPlatform = "mac" | "other";

type NavigatorWithHints = Pick<Navigator, "platform"> & {
  userAgentData?: { platform?: string };
};

const APPLE = /mac|iphone|ipad|ipod/i;

/**
 * The platform of a navigator: Client Hints first (`userAgentData.platform`,
 * "macOS"), then the deprecated `navigator.platform` ("MacIntel", "iPhone",
 * "iPad"), which Safari and Firefox still fill in. Without a navigator (on the
 * server) it is `other`.
 */
export function detectKeyboardPlatform(
  nav: NavigatorWithHints | undefined = typeof navigator === "undefined" ? undefined : navigator,
): KeyboardPlatform {
  if (!nav) return "other";
  const platform = nav.userAgentData?.platform || nav.platform || "";
  return APPLE.test(platform) ? "mac" : "other";
}

// Detected once, on the first client read: the platform never changes while a
// page is open.
let detected: KeyboardPlatform | undefined;

const subscribeNever = () => () => undefined;
const clientSnapshot = (): KeyboardPlatform => (detected ??= detectKeyboardPlatform());
const serverSnapshot = (): KeyboardPlatform => "other";

/**
 * The platform the page runs on. The server render and hydration use `other`,
 * so the markup matches; the client then renders with the detected platform.
 */
export function usePlatform(): KeyboardPlatform {
  return useSyncExternalStore(subscribeNever, clientSnapshot, serverSnapshot);
}

/** Forget the detected platform, for tests that change the navigator. */
export function resetDetectedPlatform() {
  detected = undefined;
}
