import { useSyncExternalStore } from "react";

const desktopBreakpoint = 768;

function subscribe(onStoreChange: () => void) {
  const viewport = window.visualViewport;

  window.addEventListener("resize", onStoreChange);
  viewport?.addEventListener("resize", onStoreChange);

  return () => {
    window.removeEventListener("resize", onStoreChange);
    viewport?.removeEventListener("resize", onStoreChange);
  };
}

function getSnapshot() {
  return window.innerWidth >= desktopBreakpoint;
}

function getServerSnapshot() {
  return false;
}

export function usePlaygroundDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
