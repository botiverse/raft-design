import { createContext, useContext, useMemo } from "react";
import type { ReactNode, RefObject } from "react";

/** A collision boundary as a rect in window coordinates, as Base UI's positioners take it. */
export type PopupBoundaryRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * How far to move a boundary rect so floating-ui (@floating-ui/dom 1.8, under
 * Base UI) reads it where the window draws it: twice the visual viewport's
 * offset in WebKit, 0 everywhere else.
 *
 * In WebKit (floating-ui's own test: `-webkit-backdrop-filter` is supported)
 * the visual viewport has an offset while the page is panned under it: the
 * on-screen keyboard is up on iOS, or the page is pinch-zoomed. For a
 * `position: fixed` popup whose offset parent is the window, which every
 * raft-ui popup is by default, floating-ui ADDS that offset to the trigger's
 * rect (`getBoundingClientRect`) and to the viewport (`getViewportRect`), and
 * SUBTRACTS it from a boundary given as a rect
 * (`getClientRectFromClippingAncestor`). A rect in window coordinates
 * therefore lands twice the offset away from the trigger it bounds: with the
 * keyboard up, a list bounded under a sheet's head ran under the head again.
 * An element as the boundary is no better: it gets no offset, so it is off by
 * once. Adding the offset twice puts the rect where floating-ui puts the
 * trigger.
 *
 * A popup with `positionMethod="absolute"`, or one portaled into an element
 * that is a containing block for fixed boxes (a `transform`, a `filter`), is
 * measured without the offset on its trigger; this still adds it twice.
 */
export function visualViewportShift(): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  const viewport = window.visualViewport;
  const webKit = typeof CSS !== "undefined" && CSS.supports?.("-webkit-backdrop-filter", "none");
  return viewport && webKit
    ? { x: 2 * viewport.offsetLeft, y: 2 * viewport.offsetTop }
    : { x: 0, y: 0 };
}

// Far past any window: floating-ui cuts the boundary to the viewport, so a
// side this far out is the viewport's own.
const UNBOUNDED = 1e6;

/**
 * The part of a sheet a popup opened in it may cover: from the bottom of the
 * sheet's head to the bottom of the sheet, the window's full width. A list
 * bounded by it flips and shrinks under the head instead of opening over it
 * and past the sheet's top edge, where, with the on-screen keyboard up, there
 * is no screen left.
 *
 * `head` and `surface` are read each time Base UI places the popup (it copies
 * the rect's fields), so the rect follows the sheet as the keyboard resizes
 * it. With no head, or with less than `minHeight` px under it, it bounds
 * nothing and the popup keeps to the window, as outside a sheet.
 *
 * The rect is moved by `visualViewportShift`, so it is in the coordinates
 * floating-ui reads it in, not the window's.
 */
export function sheetPopupBoundary(
  head: () => Element | null | undefined,
  surface: () => Element | null | undefined,
  minHeight = 0,
): PopupBoundaryRect {
  const measure = () => {
    const headBox = head()?.getBoundingClientRect();
    const surfaceBox = surface()?.getBoundingClientRect();
    if (!headBox || !surfaceBox) return null;
    const height = surfaceBox.bottom - headBox.bottom;
    return height > 0 && height >= minHeight ? { top: headBox.bottom, height } : null;
  };
  return {
    x: -UNBOUNDED,
    width: 2 * UNBOUNDED,
    get y() {
      const area = measure();
      return area ? area.top + visualViewportShift().y : -UNBOUNDED;
    },
    get height() {
      return measure()?.height ?? 2 * UNBOUNDED;
    },
  };
}

/**
 * The collision boundary of the sheet around a popup, or `undefined` outside
 * one. Set by a phone sheet (`DialogSheetContent`), a `Drawer` and
 * `SheetPopupBoundary`; every dialog and drawer surface starts without one.
 */
export const PopupBoundaryContext = createContext<PopupBoundaryRect | undefined>(undefined);

/** The boundary a popup takes when its caller passes no `collisionBoundary`. */
export function usePopupBoundary(): PopupBoundaryRect | undefined {
  return useContext(PopupBoundaryContext);
}

export type SheetPopupBoundaryProps = {
  /** The sheet's head: popups stay under its bottom edge. */
  head: RefObject<Element | null>;
  /**
   * The sheet's surface: popups stay above its bottom edge.
   * @default The head's parent element.
   */
  surface?: RefObject<Element | null>;
  children?: ReactNode;
};

/**
 * For a sheet an app draws itself (its own surface, a head that stays put and
 * a body that scrolls): every raft-ui popup opened under it (Select, Combobox,
 * ComboboxSelect, DropdownMenu, ContextMenu, Popover, PreviewCard, Tooltip,
 * NotificationCenter) flips and sizes inside the sheet, under its head. Wrap
 * the head and the body in it. raft-ui's own sheets, `DialogSheetContent` on a
 * phone and `Drawer`, do this by themselves, and a `collisionBoundary` passed
 * to a popup still wins. A raft-ui Dialog, AlertDialog or Drawer opened from
 * inside starts without it. It renders no element.
 */
export function SheetPopupBoundary({ head, surface, children }: SheetPopupBoundaryProps) {
  const boundary = useMemo(
    () =>
      sheetPopupBoundary(
        () => head.current,
        () => (surface ? surface.current : head.current?.parentElement),
      ),
    [head, surface],
  );
  return <PopupBoundaryContext.Provider value={boundary}>{children}</PopupBoundaryContext.Provider>;
}
