import { useSyncExternalStore } from "react";

const desktopBreakpoint = 768;
const largeDesktopBreakpoint = 1024;
const wideDesktopBreakpoint = 1536;

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

function getWideDesktopSnapshot() {
  return window.innerWidth >= wideDesktopBreakpoint;
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

export function usePlaygroundWideDesktop() {
  return useSyncExternalStore(subscribe, getWideDesktopSnapshot, getServerSnapshot);
}
