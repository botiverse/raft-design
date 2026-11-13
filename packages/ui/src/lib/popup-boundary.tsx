import { createContext, useContext, useMemo } from "react";
import type { ReactNode, RefObject } from "react";

/** A collision boundary as a rect in window coordinates, as Base UI's positioners take it. */
export type PopupBoundaryRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type MaybeElement = Element | null | undefined;

/** WebKit, by floating-ui's own test (`isWebKit` in @floating-ui/utils). */
function isWebKit() {
  return typeof CSS !== "undefined" && CSS.supports?.("-webkit-backdrop-filter", "none") === true;
}

const NOT_NONE = (value: string | undefined) => !!value && value !== "none";
const WILL_CHANGE = /transform|translate|scale|rotate|perspective|filter/;
const CONTAIN = /paint|layout|strict|content/;

/**
 * Whether floating-ui takes the window as `popup`'s offset parent: it is
 * `position: fixed` and no ancestor is a containing block for fixed boxes
 * (`getOffsetParent` and `isContainingBlock` in @floating-ui 1.8, as they
 * read in WebKit, where a filter doesn't count). With no popup to look at,
 * yes: a raft-ui popup is fixed and portaled beside its dialog or to the body.
 */
function offsetParentIsWindow(popup: MaybeElement): boolean {
  if (!popup) return true;
  if (getComputedStyle(popup).position !== "fixed") return false;
  for (let node = popup.parentElement; node; node = node.parentElement) {
    const css = getComputedStyle(node);
    if (
      NOT_NONE(css.transform) ||
      NOT_NONE(css.translate) ||
      NOT_NONE(css.scale) ||
      NOT_NONE(css.rotate) ||
      NOT_NONE(css.perspective) ||
      WILL_CHANGE.test(css.willChange || "") ||
      CONTAIN.test(css.contain || "")
    ) {
      return false;
    }
  }
  return true;
}

/**
 * How far to move a boundary rect so floating-ui (@floating-ui/dom 1.8, under
 * Base UI) reads it where the window draws it: 0 outside WebKit, and in WebKit
 * the visual viewport's offset, twice for a fixed popup whose offset parent is
 * the window and once for any other.
 *
 * In WebKit (floating-ui's own test: `-webkit-backdrop-filter` is supported)
 * the visual viewport has an offset while the page is panned under it: the
 * on-screen keyboard is up on iOS, or the page is pinch-zoomed. floating-ui
 * SUBTRACTS that offset from a boundary given as a rect
 * (`getClientRectFromClippingAncestor`), whatever the popup. For a
 * `position: fixed` popup whose offset parent is the window, which every
 * raft-ui popup is by default, it also ADDS the offset to the trigger's rect
 * (`getBoundingClientRect` with `shouldAddVisualOffsets`). A rect in window
 * coordinates therefore lands twice the offset away from the trigger it
 * bounds: with the keyboard up, a list bounded under a sheet's head ran under
 * the head again. For a popup with `positionMethod="absolute"`, or one
 * portaled into an element that is a containing block for fixed boxes (a
 * drawer's popup, which is transformed), the trigger gets no offset and the
 * rect is off by once. An element as the boundary gets no offset at all, so it
 * is no way around this.
 *
 * `popup` is the positioner being placed; without one the popup is taken to be
 * fixed to the window.
 */
export function visualViewportShift(popup?: MaybeElement): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  const viewport = window.visualViewport;
  if (!viewport || !isWebKit()) return { x: 0, y: 0 };
  if (viewport.offsetLeft === 0 && viewport.offsetTop === 0) return { x: 0, y: 0 };
  const times = offsetParentIsWindow(popup) ? 2 : 1;
  return { x: times * viewport.offsetLeft, y: times * viewport.offsetTop };
}

/**
 * The element an open popup is anchored to, found from its positioner, or
 * `null` when it can't be told. Base UI keeps this in each primitive's own
 * store, so it is read from the DOM Base UI renders:
 *
 * - a menu, a submenu, a popover, a select or a combobox: the open trigger
 *   (`data-popup-open`) whose `aria-controls` names an element inside the
 *   positioner;
 * - a tooltip or a preview card, which nothing names: the open trigger of its
 *   kind, when exactly one is open.
 *
 * A context menu is anchored to a point and has none. An `anchor` passed to
 * the popup isn't read here: sheetPopupBoundary takes it before this lookup.
 */
export function findPopupAnchor(positioner: MaybeElement): Element | null {
  if (!positioner) return null;
  const root = positioner.ownerDocument;
  for (const trigger of root.querySelectorAll("[data-popup-open][aria-controls]")) {
    const controlled = root.getElementById(trigger.getAttribute("aria-controls") ?? "");
    if (controlled && positioner.contains(controlled)) return trigger;
  }
  const unnamed = positioner.querySelector('[data-slot="tooltip-content"]')
    ? "[data-base-ui-tooltip-trigger][data-popup-open]"
    : positioner.querySelector('[data-slot="preview-card-content"]')
      ? '[data-slot="preview-card-trigger"][data-popup-open]'
      : null;
  if (!unnamed) return null;
  const open = root.querySelectorAll(unnamed);
  return open.length === 1 ? open[0]! : null;
}

/**
 * A sheet, for the popups opened in it: its head, which stays put, and its
 * surface, both read each time a popup is placed.
 */
export type PopupSheet = {
  head: () => MaybeElement;
  surface: () => MaybeElement;
};

// Far past any window: floating-ui cuts the boundary to the viewport, so a
// side this far out is the viewport's own.
const UNBOUNDED = 1e6;

/** An anchor that is no element: a point or a range, as Base UI's `anchor` takes it. */
export type PopupVirtualAnchor = {
  getBoundingClientRect: () => {
    readonly top: number;
    readonly bottom: number;
    readonly left: number;
    readonly right: number;
  };
};

/**
 * What a popup's `anchor` prop takes in Base UI: an element, a ref to one, a
 * virtual element, or a function that returns an element or a virtual one.
 */
export type PopupAnchor =
  | Element
  | PopupVirtualAnchor
  | { readonly current: Element | null }
  | (() => Element | PopupVirtualAnchor | null)
  | null
  | undefined;

const isElement = (value: object): value is Element =>
  typeof (value as Element).nodeType === "number";

/** The element or virtual element an `anchor` prop stands for now, or `null`: an empty ref, or none passed. */
export function resolvePopupAnchor(anchor: PopupAnchor): Element | PopupVirtualAnchor | null {
  const value = typeof anchor === "function" ? anchor() : anchor;
  if (!value) return null;
  if (!isElement(value) && "current" in value) return value.current;
  return value;
}

/** Runs `clear` before the next frame is drawn, or as soon as the caller is done where there are no frames. */
function nextFrame(clear: () => void) {
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(clear);
  else queueMicrotask(clear);
}

/**
 * The part of a sheet a popup opened in it may cover: from the bottom of the
 * sheet's head to the bottom of what is visible of the sheet (its own bottom
 * edge, or the visual viewport's when the on-screen keyboard covers it), the
 * window's full width. A list bounded by it flips and shrinks under the head
 * instead of opening over it and past the sheet's top edge.
 *
 * Decided for each popup, each time Base UI places it (it copies the rect's
 * fields, which are getters), so the rect follows the sheet as the keyboard
 * resizes it. The sheet bounds nothing, and the popup keeps to the window as
 * outside a sheet, when:
 *
 * - the popup's anchor is inside the head (a tooltip or a menu on a head
 *   button belongs above or over the head, not under it);
 * - the sheet has no head, or nothing visible under it.
 *
 * While the anchor is in the sheet's body the area always bounds the popup,
 * however little of it either side of the anchor has: the list takes the
 * larger side and scrolls. On a small phone with the keyboard up a field in
 * the middle of a sheet has about 130px each side; a short list there can be
 * used, and one let over the head covers it, or, portaled into the sheet's
 * scrolling body, is drawn under it, where its first rows can't be pressed.
 *
 * The anchor is the popup's own `anchor` prop when `anchor` returns one that
 * resolves to something (resolvePopupAnchor), and the trigger found in the
 * page otherwise (findPopupAnchor). A virtual anchor has no element, so it is
 * inside the head when the middle of its rect is. A popup whose anchor can't
 * be found stays bounded.
 *
 * Floating-ui reads `y` and `height` one after the other, several times in
 * one placement (once for each of flip, shift, size and hide). The two reads
 * share one measurement: it is kept until the caller yields (a microtask), so
 * a sheet that resized or a keyboard that came up is measured again by the
 * next read. The trigger found in the page is kept longer, until the next
 * frame, for the same positioner and while it is still in the page and open:
 * which element a popup is anchored to doesn't change with layout, and finding
 * it is a query over the whole document. A lookup that found nothing isn't
 * kept.
 *
 * The rect is moved by `visualViewportShift`, so it is in the coordinates
 * floating-ui reads it in, not the window's.
 */
export function sheetPopupBoundary(
  sheet: PopupSheet,
  popup: () => MaybeElement = () => null,
  anchor: () => PopupAnchor = () => undefined,
): PopupBoundaryRect {
  let found: { positioner: Element; anchor: Element } | null = null;
  const lookUp = (positioner: MaybeElement) => {
    if (
      found &&
      found.positioner === positioner &&
      found.anchor.isConnected &&
      found.anchor.hasAttribute("data-popup-open")
    ) {
      return found.anchor;
    }
    found = null;
    const trigger = findPopupAnchor(positioner);
    if (trigger && positioner) {
      found = { positioner, anchor: trigger };
      nextFrame(() => {
        found = null;
      });
    }
    return trigger;
  };

  const measure = () => {
    const head = sheet.head();
    const headBox = head?.getBoundingClientRect();
    const surfaceBox = sheet.surface()?.getBoundingClientRect();
    if (!head || !headBox || !surfaceBox) return null;
    const viewport = window.visualViewport;
    const top = headBox.bottom;
    const bottom = viewport
      ? Math.min(surfaceBox.bottom, viewport.offsetTop + viewport.height)
      : surfaceBox.bottom;
    if (bottom <= top) return null;
    const positioner = popup();
    const target = resolvePopupAnchor(anchor()) ?? lookUp(positioner);
    if (target) {
      if (isElement(target)) {
        if (head.contains(target)) return null;
      } else {
        const anchorBox = target.getBoundingClientRect();
        const x = (anchorBox.left + anchorBox.right) / 2;
        const y = (anchorBox.top + anchorBox.bottom) / 2;
        if (x >= headBox.left && x <= headBox.right && y >= headBox.top && y <= headBox.bottom) {
          return null;
        }
      }
    }
    return { top: top + visualViewportShift(positioner).y, height: bottom - top };
  };

  let measured: { value: ReturnType<typeof measure> } | null = null;
  const read = () => {
    if (!measured) {
      measured = { value: measure() };
      queueMicrotask(() => {
        measured = null;
      });
    }
    return measured.value;
  };
  return {
    x: -UNBOUNDED,
    width: 2 * UNBOUNDED,
    get y() {
      return read()?.top ?? -UNBOUNDED;
    },
    get height() {
      return read()?.height ?? 2 * UNBOUNDED;
    },
  };
}

/**
 * The sheet around a popup, or `undefined` outside one. Set by a phone sheet
 * (`DialogSheetContent`), a `Drawer` and `SheetPopupBoundary`; every modal
 * surface (a dialog, an alert dialog, a drawer, a lightbox, an app's own under
 * `OverlayLayerProvider`) and every sheet's head start without one.
 */
export const PopupSheetContext = createContext<PopupSheet | undefined>(undefined);

/** The sheet a popup is in, whose area it takes when its caller passes no `collisionBoundary`. */
export function usePopupSheet(): PopupSheet | undefined {
  return useContext(PopupSheetContext);
}

/** Starts its children outside any sheet: a new surface, or a sheet's head. */
export function PopupSheetReset({ children }: { children?: ReactNode }) {
  return <PopupSheetContext.Provider value={undefined}>{children}</PopupSheetContext.Provider>;
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
 * NotificationCenter) flips and sizes inside the sheet, under its head
 * (sheetPopupBoundary says when it doesn't). Wrap the sheet's body in it, or
 * the head and the body: a popup anchored in the head is left alone either
 * way. Put it inside the sheet's own `OverlayLayerProvider`, which starts
 * without one. raft-ui's own sheets, `DialogSheetContent` on a phone and
 * `Drawer`, do this by themselves, and a `collisionBoundary` passed to a popup
 * still wins. It renders no element.
 */
export function SheetPopupBoundary({ head, surface, children }: SheetPopupBoundaryProps) {
  const sheet = useMemo<PopupSheet>(
    () => ({
      head: () => head.current,
      surface: () => (surface ? surface.current : head.current?.parentElement),
    }),
    [head, surface],
  );
  return <PopupSheetContext.Provider value={sheet}>{children}</PopupSheetContext.Provider>;
}
