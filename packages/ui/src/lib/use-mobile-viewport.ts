import { useMemo, useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

// No matchMedia (a server render, jsdom) reads as not a phone.
function canMatchMedia() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

function subscribeMobileViewport(onStoreChange: () => void) {
  if (!canMatchMedia()) return () => undefined;

  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getMobileViewportSnapshot() {
  return canMatchMedia() && window.matchMedia(MOBILE_QUERY).matches;
}

/**
 * Whether the window is narrower than 768px: `view`, a window of its own
 * (usePortalWindow, under PortalContainerProvider), or the page's by default.
 */
export function useMobileViewport(view?: Window) {
  const target =
    view !== undefined && view !== window && typeof view.matchMedia === "function"
      ? view
      : undefined;
  const store = useMemo(
    () =>
      target
        ? {
            subscribe: (onStoreChange: () => void) => {
              const media = target.matchMedia(MOBILE_QUERY);
              media.addEventListener("change", onStoreChange);
              return () => media.removeEventListener("change", onStoreChange);
            },
            getSnapshot: () => target.matchMedia(MOBILE_QUERY).matches,
          }
        : { subscribe: subscribeMobileViewport, getSnapshot: getMobileViewportSnapshot },
    [target],
  );
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => false);
}
