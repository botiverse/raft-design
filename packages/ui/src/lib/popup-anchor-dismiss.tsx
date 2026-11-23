import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";
import { ownerWindow } from "./owner-window";
import { findPopupAnchor, resolvePopupAnchor } from "./popup-boundary";
import type { PopupAnchor, PopupVirtualAnchor } from "./popup-boundary";

/**
 * How an anchored popup responds when its trigger or anchor leaves view:
 * - `"close-on-hidden"` (focus-holding / disclosure popups with a DOM trigger:
 *   Popover, Menu, Select, Combobox, NotificationCenter): close whenever the
 *   trigger is clipped out of its scroll container or removed from the
 *   document, so focus returns to the trigger and `aria-expanded` stays
 *   truthful. Virtual anchors (no DOM trigger button, e.g. a text selection)
 *   stay hidden while clipped and close only if their `contextElement` leaves
 *   the document.
 * - `"close-on-gone"` (hover-only popups: Tooltip, PreviewCard): stay open and
 *   hidden while the anchor is merely clipped so scrolling back restores it,
 *   but close if the anchor unmounts or collapses to 0x0.
 */
export type PopupCloseMode = "close-on-hidden" | "close-on-gone";

type PopupCloseContextValue = {
  close: () => void;
  closeAsOutsidePress: ((event: Event) => void) | undefined;
};

const PopupAnchorCloseContext = createContext<PopupCloseContextValue | null>(null);

export function PopupAnchorCloseProvider({
  close,
  closeAsOutsidePress,
  children,
}: {
  close: () => void;
  /**
   * Closes the popup as a press outside it would (`reason: "outside-press"`),
   * for presses Base UI can't see: a click into an `<iframe>`. Given only by
   * dismissible disclosure popups; hover popups (Tooltip, PreviewCard) leave
   * it out.
   */
  closeAsOutsidePress?: (event: Event) => void;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ close, closeAsOutsidePress }), [close, closeAsOutsidePress]);
  return (
    <PopupAnchorCloseContext.Provider value={value}>{children}</PopupAnchorCloseContext.Provider>
  );
}

type OpenChangeDetails = { reason: string; event: Event };

/**
 * Exposes a stable `close` callback backed by Base UI's `actionsRef` without
 * interfering with a caller-supplied `actionsRef`.
 *
 * `closeAsOutsidePress(event)` closes through the same `actionsRef` but reports
 * the close to `onOpenChange` as Base UI reports a press outside:
 * `reason: "outside-press"`, with `event`. Pass the root's `onOpenChange` here
 * and give Base UI the returned one, which rewrites that close's details.
 */
export function usePopupCloseAction<
  T extends { close: () => void },
  D extends OpenChangeDetails = OpenChangeDetails,
>(
  callerActionsRef: RefObject<T | null> | undefined,
  onOpenChange?: (open: boolean, details: D) => void,
): {
  actionsRef: RefObject<T | null>;
  close: () => void;
  closeAsOutsidePress: (event: Event) => void;
  onOpenChange: (open: boolean, details: D) => void;
} {
  const internalRef = useRef<T | null>(null);
  const actionsRef = callerActionsRef ?? internalRef;
  const outsideEventRef = useRef<Event | null>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);
  const close = useCallback(() => {
    actionsRef.current?.close();
  }, [actionsRef]);
  const closeAsOutsidePress = useCallback(
    (event: Event) => {
      // Base UI calls `onOpenChange` synchronously inside `close()`.
      outsideEventRef.current = event;
      try {
        actionsRef.current?.close();
      } finally {
        outsideEventRef.current = null;
      }
    },
    [actionsRef],
  );
  const handleOpenChange = useCallback((open: boolean, details: D) => {
    const outsideEvent = outsideEventRef.current;
    if (!open && outsideEvent) {
      outsideEventRef.current = null;
      // The details object is fresh for this close, and Base UI reads its
      // reason again after `onOpenChange`, so the close is handled as an
      // outside press throughout.
      (details as OpenChangeDetails).reason = "outside-press";
      (details as OpenChangeDetails).event = outsideEvent;
    }
    onOpenChangeRef.current?.(open, details);
  }, []);
  return { actionsRef, close, closeAsOutsidePress, onOpenChange: handleOpenChange };
}

/**
 * Whether the window's blur is focus moving into an `<iframe>` of its own
 * document outside `popup`: a click into a frame, even a cross-origin one
 * (a Raft Artifact, a Porthole page), reaches the frame's document and never
 * the page's, so Base UI never sees the press, but the frame element takes
 * focus and the page's window blurs. Switching apps blurs the window too, and
 * leaves `activeElement` where it was, not on a frame.
 *
 * `localName`, not `instanceof HTMLIFrameElement`: a popup portalled into
 * another window's document (an object window's about:blank) has elements of
 * that window, which aren't instances of this window's classes.
 */
export function isFocusInOutsideFrame(popup: Element): boolean {
  const active = popup.ownerDocument.activeElement;
  return active?.localName === "iframe" && !popup.contains(active);
}

function isElement(value: object): value is Element {
  return typeof (value as Element).nodeType === "number";
}

function contextElementOf(resolved: Element | PopupVirtualAnchor | null): Element | null {
  if (!resolved) return null;
  if (isElement(resolved)) return resolved;
  const contextElement = (resolved as PopupVirtualAnchor & { contextElement?: Element })
    .contextElement;
  return contextElement && isElement(contextElement) ? contextElement : null;
}

function hasRealViewport(positioner: Element): boolean {
  const docEl = positioner.ownerDocument.documentElement;
  return docEl.clientWidth > 0 || docEl.clientHeight > 0;
}

function isAnchorGone(
  resolved: Element | PopupVirtualAnchor | null,
  trackedElement: Element | null,
): boolean {
  if (resolved) {
    if (isElement(resolved)) {
      if (!resolved.isConnected) return true;
      const rect = resolved.getBoundingClientRect();
      return rect.width === 0 && rect.height === 0;
    }
    const contextElement = contextElementOf(resolved);
    if (contextElement && !contextElement.isConnected) return true;
    const rect = resolved.getBoundingClientRect();
    return (
      rect.right - rect.left === 0 &&
      rect.bottom - rect.top === 0 &&
      rect.left === 0 &&
      rect.top === 0 &&
      rect.right === 0 &&
      rect.bottom === 0
    );
  }
  if (trackedElement) {
    if (!trackedElement.isConnected) return true;
    const rect = trackedElement.getBoundingClientRect();
    return rect.width === 0 && rect.height === 0;
  }
  return false;
}

/**
 * Watches an anchored Base UI positioner for `data-anchor-hidden` and detached
 * anchors, closing the popup according to `mode` (design/foundations/elevation.md#popups).
 * Where the root gives `closeAsOutsidePress`, it also closes the popup when
 * focus moves into an `<iframe>` outside it ({@link isFocusInOutsideFrame}).
 *
 * Acts only where there is layout (a viewport with a size): jsdom has none
 * and Base UI sets `data-anchor-hidden` there on mount, so jsdom tests, even
 * ones that stub element sizes, are never falsely dismissed, while a popup
 * opened on an already-clipped anchor in a real browser still closes.
 */
export function usePopupAnchorDismiss(
  anchor: PopupAnchor,
  mode: PopupCloseMode,
): (node: HTMLDivElement | null) => void {
  const closeContext = useContext(PopupAnchorCloseContext);
  const close = closeContext?.close ?? null;
  const closeAsOutsidePress = closeContext?.closeAsOutsidePress;
  const [positioner, setPositioner] = useState<HTMLDivElement | null>(null);
  const anchorRef = useRef<PopupAnchor>(anchor);
  const closeRef = useRef(close);
  const closeAsOutsidePressRef = useRef(closeAsOutsidePress);

  useLayoutEffect(() => {
    anchorRef.current = anchor;
    closeRef.current = close;
    closeAsOutsidePressRef.current = closeAsOutsidePress;
  }, [anchor, close, closeAsOutsidePress]);

  useEffect(() => {
    if (!positioner) return;

    let trackedElement: Element | null = null;
    let dismissed = false;

    const dismiss = () => {
      if (dismissed || !closeRef.current) return;
      dismissed = true;
      closeRef.current();
    };

    const check = () => {
      if (!positioner.hasAttribute("data-open")) {
        trackedElement = null;
        dismissed = false;
        return;
      }
      if (dismissed) return;

      const explicit = resolvePopupAnchor(anchorRef.current);
      const resolved = explicit ?? findPopupAnchor(positioner);
      const contextElement = contextElementOf(resolved);
      if (contextElement?.isConnected) {
        trackedElement = contextElement;
      }

      // A previously connected anchor removed from the document will not return.
      if (trackedElement && !trackedElement.isConnected) {
        dismiss();
        return;
      }

      if (!positioner.hasAttribute("data-anchor-hidden")) {
        return;
      }

      // Skip environments with no layout (jsdom: every viewport size is 0, and
      // Base UI sets `data-anchor-hidden` on mount). A real browser always has
      // a viewport; the anchor's size alone is no evidence, since a test may
      // stub `getBoundingClientRect` (it used to close a menu as it opened).
      if (!hasRealViewport(positioner)) {
        return;
      }

      // Virtual anchors (e.g. a text selection) have no disclosure trigger
      // button; stay hidden while clipped and close only if their context
      // element disconnects (handled above).
      const isVirtualAnchor = explicit !== null && !isElement(explicit);
      if (isVirtualAnchor) {
        return;
      }

      if (mode === "close-on-hidden" || isAnchorGone(resolved, trackedElement)) {
        dismiss();
      }
    };

    check();

    const observer = new MutationObserver(check);
    observer.observe(positioner, {
      attributes: true,
      attributeFilter: ["data-anchor-hidden", "data-open", "data-side"],
    });

    // Re-run `check()` on scroll/resize so a swapped anchor refreshes
    // `trackedElement` before checking whether the current anchor detached.
    const win = positioner.ownerDocument.defaultView;
    win?.addEventListener("scroll", check, { capture: true, passive: true });
    win?.addEventListener("resize", check);

    // A press into an `<iframe>` is a press outside (popover.md#closing),
    // though it never reaches this document. The popup's own window: it may
    // be portalled into another one.
    const popupWindow = ownerWindow(positioner);
    const handleWindowBlur = (event: FocusEvent) => {
      if (event.target !== popupWindow || !positioner.hasAttribute("data-open")) return;
      if (!isFocusInOutsideFrame(positioner)) return;
      closeAsOutsidePressRef.current?.(event);
    };
    popupWindow.addEventListener("blur", handleWindowBlur);

    return () => {
      observer.disconnect();
      win?.removeEventListener("scroll", check, true);
      win?.removeEventListener("resize", check);
      popupWindow.removeEventListener("blur", handleWindowBlur);
    };
  }, [positioner, mode]);

  return setPositioner;
}
