import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";
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

const PopupAnchorCloseContext = createContext<(() => void) | null>(null);

export function PopupAnchorCloseProvider({
  close,
  children,
}: {
  close: () => void;
  children: ReactNode;
}) {
  return (
    <PopupAnchorCloseContext.Provider value={close}>{children}</PopupAnchorCloseContext.Provider>
  );
}

/**
 * Exposes a stable `close` callback backed by Base UI's `actionsRef` without
 * interfering with a caller-supplied `actionsRef`.
 */
export function usePopupCloseAction<T extends { close: () => void }>(
  callerActionsRef: RefObject<T | null> | undefined,
): { actionsRef: RefObject<T | null>; close: () => void } {
  const internalRef = useRef<T | null>(null);
  const actionsRef = callerActionsRef ?? internalRef;
  const close = useCallback(() => {
    actionsRef.current?.close();
  }, [actionsRef]);
  return { actionsRef, close };
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

function hasNonZeroGeometry(target: Element | PopupVirtualAnchor | null): boolean {
  if (!target) return false;
  const rect = target.getBoundingClientRect();
  return (
    rect.right - rect.left > 0 ||
    rect.bottom - rect.top > 0 ||
    rect.left !== 0 ||
    rect.top !== 0 ||
    rect.right !== 0 ||
    rect.bottom !== 0
  );
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
 *
 * Uses viewport/anchor geometry to distinguish real layout from jsdom (where
 * every rect and `clientWidth` is 0 and Base UI sets `data-anchor-hidden` on
 * mount), so a popup opened on an already-clipped anchor in a real browser
 * still closes while jsdom tests are never falsely dismissed.
 */
export function usePopupAnchorDismiss(
  anchor: PopupAnchor,
  mode: PopupCloseMode,
): (node: HTMLDivElement | null) => void {
  const close = useContext(PopupAnchorCloseContext);
  const [positioner, setPositioner] = useState<HTMLDivElement | null>(null);
  const anchorRef = useRef<PopupAnchor>(anchor);
  const closeRef = useRef(close);

  useLayoutEffect(() => {
    anchorRef.current = anchor;
    closeRef.current = close;
  }, [anchor, close]);

  useEffect(() => {
    if (!positioner) return;

    let hadLayout = false;
    let trackedElement: Element | null = null;
    let dismissed = false;

    const dismiss = () => {
      if (dismissed || !closeRef.current) return;
      dismissed = true;
      closeRef.current();
    };

    const check = () => {
      if (!positioner.hasAttribute("data-open")) {
        hadLayout = false;
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

      const realGeometry = hasNonZeroGeometry(resolved ?? trackedElement);
      if (realGeometry) {
        hadLayout = true;
      }

      if (!positioner.hasAttribute("data-anchor-hidden")) {
        return;
      }

      // Skip jsdom / pre-layout states where neither viewport nor anchor has geometry.
      if (!hadLayout && !hasRealViewport(positioner)) {
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

    return () => {
      observer.disconnect();
      win?.removeEventListener("scroll", check, true);
      win?.removeEventListener("resize", check);
    };
  }, [positioner, mode]);

  return setPositioner;
}
