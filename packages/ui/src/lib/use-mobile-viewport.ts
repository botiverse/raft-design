import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobileViewport(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getMobileViewportSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;
}

export function useMobileViewport() {
  return useSyncExternalStore(subscribeMobileViewport, getMobileViewportSnapshot, () => false);
}
