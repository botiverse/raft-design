import { useSyncExternalStore } from "react";

const desktopBreakpoint = 768;
const largeDesktopBreakpoint = 1024;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);

  return () => {
    window.removeEventListener("resize", onStoreChange);
  };
}

function getDesktopSnapshot() {
  return window.innerWidth >= desktopBreakpoint;
}

function getLargeDesktopSnapshot() {
  return window.innerWidth >= largeDesktopBreakpoint;
}

function getServerSnapshot() {
  return false;
}

export function usePlaygroundDesktop() {
  return useSyncExternalStore(subscribe, getDesktopSnapshot, getServerSnapshot);
}

export function usePlaygroundLargeDesktop() {
  return useSyncExternalStore(subscribe, getLargeDesktopSnapshot, getServerSnapshot);
}
