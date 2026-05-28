import { useSyncExternalStore } from "react";

// Single source of truth for the desktop/mobile breakpoint on the web app.
// Matches Tailwind's `md:` (>= 768px) — anything narrower is treated as mobile.
//
// Design contract: the mobile path is a fully separate component tree under
// `components/layout/mobile/*` (MobileShell + per-mode masters). Desktop code
// must never branch on this; mobile code must never branch back to desktop.
// If a piece of UI needs to differ subtly within the mobile branch, prefer
// keeping the difference inside the mobile component, not by mixing modes.
//
// Originating direction: stdrc 2026-04-29 #proj-uiux:c8711d2a — "完全重写
// 移动端的导航，现在这样完全是错误的。就你应该完全不复用".
const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";

export function isMobileViewportNow(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
}

function subscribeMobileViewport(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

// useSyncExternalStore handles SSR (server snapshot returns false) and
// subscribes to media-query changes via a single contract. Replaces the
// earlier useState+useEffect dance that needed an on-mount re-sync to catch
// the gap between initial useState and the matchMedia listener attaching.
export function useIsMobileViewport(): boolean {
  return useSyncExternalStore(
    subscribeMobileViewport,
    isMobileViewportNow,
    () => false,
  );
}
