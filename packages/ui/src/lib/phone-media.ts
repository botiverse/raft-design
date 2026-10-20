import { useSyncExternalStore } from "react";

/**
 * A phone: a touch screen narrower than the desktop layout. The complement, on
 * both axes, of the desktop query `(width >= 48rem) and (pointer: fine)`
 * (design/foundations/spacing.md): a narrow window with a mouse keeps the
 * desktop behaviour, and so does a tablet used by touch, which is wide.
 */
export const PHONE_MEDIA_QUERY = "(width < 48rem) and (pointer: coarse)";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => undefined;
  }
  const media = window.matchMedia(PHONE_MEDIA_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(PHONE_MEDIA_QUERY).matches
  );
}

/** Whether `PHONE_MEDIA_QUERY` matches. `false` on the server and before hydration. */
export function usePhoneMedia() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
