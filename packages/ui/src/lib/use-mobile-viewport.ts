import { useSyncExternalStore } from "react";

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

export function useMobileViewport() {
  return useSyncExternalStore(subscribeMobileViewport, getMobileViewportSnapshot, () => false);
}
