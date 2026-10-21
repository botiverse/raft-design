/*
 * Keyboard scrolling of VirtualList.
 */
import { useCallback, useRef } from "react";
import type { KeyboardEvent } from "react";

import type { VirtualListScrollToOptions, ScrollPosition } from "../public-types";

/**
 * PageUp / PageDown / Space (Shift+Space up) scroll by the list's height minus `pageBottomOcclusion`
 * (what covers the bottom of the list, e.g. an input box) minus 32 px; Home / End and Cmd+Up / Cmd+Down
 * call `scrollTo({ position: "top" | "bottom" })`. Only keys pressed on the list itself (the scroll
 * container has focus) scroll it: a key pressed in a row (a button, a checkbox, a text field, a segmented
 * control) is left to that control, and so is a key a handler has already taken (`defaultPrevented`).
 */
export function useKeyboardScroll(
  scrollTo: (options: VirtualListScrollToOptions) => void,
  { pageBottomOcclusion = 0 }: { pageBottomOcclusion?: number } = {},
) {
  const occlusionRef = useRef(0);
  // oxlint-disable-next-line react/refs -- the latest value, read by the key handler
  occlusionRef.current = pageBottomOcclusion;
  return {
    onKeyDown: useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.defaultPrevented || event.target !== event.currentTarget) {
          return;
        }
        if (
          event.key === "PageDown" ||
          event.key === "PageUp" ||
          event.key === " " ||
          event.key === "Spacebar"
        ) {
          const page = Math.max(event.currentTarget.clientHeight - occlusionRef.current - 32, 0);
          if (page <= 0) {
            return;
          }
          event.preventDefault();
          event.currentTarget.scrollTop +=
            event.key === "PageUp" ||
            ((event.key === " " || event.key === "Spacebar") && event.shiftKey)
              ? -page
              : page;
          return;
        }
        let position: ScrollPosition | null = null;
        switch (event.key) {
          case "Home":
            position = "top";
            break;
          case "ArrowUp":
            if (event.metaKey) {
              position = "top";
            }
            break;
          case "End":
            position = "bottom";
            break;
          case "ArrowDown":
            if (event.metaKey) {
              position = "bottom";
            }
            break;
        }
        if (position) {
          event.preventDefault();
          scrollTo({ position });
        }
      },
      [scrollTo],
    ),
  };
}
