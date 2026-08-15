import { useSyncExternalStore } from "react";
import { getMediaQueryMatches, subscribeMediaQuery } from "./media-query";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobileViewport(onStoreChange: () => void) {
  return subscribeMediaQuery(MOBILE_QUERY, onStoreChange);
}

function getMobileViewportSnapshot() {
  return getMediaQueryMatches(MOBILE_QUERY);
}

export function useMobileViewport() {
  return useSyncExternalStore(subscribeMobileViewport, getMobileViewportSnapshot, () => false);
}
