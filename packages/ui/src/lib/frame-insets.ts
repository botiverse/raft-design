import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import { ownerDocument, ownerWindow } from "./owner-window";
import { sheetPopupBoundary, usePopupSheet, visualViewportShift } from "./popup-boundary";
import type { PopupAnchor } from "./popup-boundary";
import { usePortalContainer } from "./portal-container";

/**
 * The parts of the screen a host shell keeps for itself (design/patterns/
 * page-structure.md#frame-insets): the window's own controls on desktop, a
 * foldable phone's system column. The shell publishes them on the root element
 * as --raft-frame-inset-top, --raft-frame-inset-start and
 * --raft-frame-inset-end; the web sets none, so they read 0.
 *
 * The variables are logical and Base UI's collision padding is physical, so
 * they are read here as the px insets on each physical side.
 */
export interface FrameInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Base UI's collision padding: one number for every side, or one per side. */
export type CollisionPadding =
  | number
  | { top?: number; right?: number; bottom?: number; left?: number };

export type FrameInsetsContainer =
  | HTMLElement
  | ShadowRoot
  | RefObject<HTMLElement | ShadowRoot | null>
  | null
  | undefined;

/** The raw values of the three variables, as the root element computes them. */
export interface FrameInsetValues {
  top: string;
  start: string;
  end: string;
}

/** Measures a CSS length that isn't plain px, along the axis it reserves. */
export type MeasureFrameInset = (value: string, axis: "block" | "inline") => number;

export const NO_FRAME_INSETS: FrameInsets = Object.freeze({ top: 0, right: 0, bottom: 0, left: 0 });

/** Base UI's own collision padding, used where a component sets none. */
export const BASE_COLLISION_PADDING = 5;

/** The room a popover, a menu or a toast keeps from an inset. */
export const POPUP_FRAME_GAP = 8;

const PX_LENGTH = /^-?(\d+\.?\d*|\.\d+)px$/;

/**
 * Turns the variables' values into physical px insets. An unset value is 0, a
 * px value is read as written, and any other CSS length (a calc() is kept as
 * written in the computed value of an unregistered custom property) is
 * measured. In left to right -start is the left side and -end the right; in
 * right to left they swap.
 */
export function frameInsetsFrom(
  values: FrameInsetValues,
  rtl: boolean,
  measure: MeasureFrameInset,
): FrameInsets {
  const read = (raw: string, axis: "block" | "inline") => {
    const value = raw.trim();
    if (value === "") return 0;
    const px = PX_LENGTH.test(value) ? Number.parseFloat(value) : measure(value, axis);
    return Number.isFinite(px) ? Math.max(0, px) : 0;
  };
  const top = read(values.top, "block");
  const start = read(values.start, "inline");
  const end = read(values.end, "inline");
  if (top === 0 && start === 0 && end === 0) return NO_FRAME_INSETS;
  return { top, right: rtl ? start : end, bottom: 0, left: rtl ? end : start };
}

function contextElement(container: FrameInsetsContainer): Element {
  const node = container && "current" in container ? container.current : container;
  // By `nodeType`: an element of another window isn't an `instanceof Element` here.
  if (node && node.nodeType === 1) return node as Element;
  if (node && "host" in node) return node.host;
  return document.body ?? document.documentElement;
}

function measureWithProbe(root: Element): MeasureFrameInset & { done(): void } {
  let probe: HTMLDivElement | null = null;
  const measure = (value: string, axis: "block" | "inline") => {
    if (!probe) {
      probe = root.ownerDocument.createElement("div");
      probe.style.cssText =
        "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none";
      root.append(probe);
    }
    probe.style.width = "0";
    probe.style.height = "0";
    probe.style.setProperty(axis === "block" ? "height" : "width", value);
    const box = probe.getBoundingClientRect();
    return axis === "block" ? box.height : box.width;
  };
  return Object.assign(measure, { done: () => probe?.remove() });
}

/**
 * Reads the frame insets once, as physical px. The direction is the one the
 * popup renders in: the computed `direction` of its portal container (the
 * body by default), so `dir="rtl"` on the document or on the nearest ancestor
 * of the container counts. The variables are read on the root element of the
 * container's document: a window of its own (PortalContainerProvider) has the
 * insets its shell publishes there, none by default.
 */
export function readFrameInsets(container?: FrameInsetsContainer): FrameInsets {
  if (typeof document === "undefined") return NO_FRAME_INSETS;
  const context = contextElement(container);
  const view = ownerWindow(context);
  const root = ownerDocument(context).documentElement;
  const style = view.getComputedStyle(root);
  const values = {
    top: style.getPropertyValue("--raft-frame-inset-top"),
    start: style.getPropertyValue("--raft-frame-inset-start"),
    end: style.getPropertyValue("--raft-frame-inset-end"),
  };
  if (values.top.trim() === "" && values.start.trim() === "" && values.end.trim() === "") {
    return NO_FRAME_INSETS;
  }
  const rtl = view.getComputedStyle(context).direction === "rtl";
  const measure = measureWithProbe(root);
  try {
    return frameInsetsFrom(values, rtl, measure);
  } finally {
    measure.done();
  }
}

/**
 * The collision padding with the insets added: on each side with an inset,
 * at least the inset plus `gap`; elsewhere `padding` as it is. With no inset
 * the padding comes back unchanged, so nothing moves on the web.
 */
export function frameCollisionPadding(
  padding: CollisionPadding,
  insets: FrameInsets,
  gap: number,
): CollisionPadding {
  if (insets.top === 0 && insets.right === 0 && insets.bottom === 0 && insets.left === 0) {
    return padding;
  }
  const base =
    typeof padding === "number"
      ? { top: padding, right: padding, bottom: padding, left: padding }
      : padding;
  const side = (key: keyof FrameInsets) => {
    const own = base[key] ?? 0;
    return insets[key] > 0 ? Math.max(own, insets[key] + gap) : own;
  };
  return { top: side("top"), right: side("right"), bottom: side("bottom"), left: side("left") };
}

function sameInsets(a: FrameInsets, b: FrameInsets): boolean {
  return a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left;
}

/**
 * The frame insets, read when the calling component mounts and updated when
 * the window resizes (a desktop window entering or leaving fullscreen, a
 * foldable changing layout): the window the container is in. Call it from a
 * part inside the popup's portal, which mounts each time the popup opens.
 */
export function useFrameInsets(container?: FrameInsetsContainer): FrameInsets {
  const [insets, setInsets] = useState(() => readFrameInsets(container));
  useEffect(() => {
    if (typeof window === "undefined") return;
    const view = ownerWindow(contextElement(container));
    const sync = () => {
      const next = readFrameInsets(container);
      setInsets((current) => (sameInsets(current, next) ? current : next));
    };
    view.addEventListener("resize", sync);
    return () => {
      view.removeEventListener("resize", sync);
    };
  }, [container]);
  return insets;
}

/** Base UI's collision boundary: the clipping ancestors, an element or elements, or a rect. */
export type CollisionBoundary =
  | "clipping-ancestors"
  | Element
  | Element[]
  | { x: number; y: number; width: number; height: number };

/** What a popup's positioner takes to keep out of the insets. */
export interface FrameCollision {
  collisionPadding: CollisionPadding;
  collisionBoundary: CollisionBoundary | undefined;
}

function hasInset(insets: FrameInsets) {
  return insets.top !== 0 || insets.right !== 0 || insets.bottom !== 0 || insets.left !== 0;
}

/**
 * Whether a popup's portal container is the document's own: none, or the body
 * or the root of the document it is in (a window of its own counts as the page
 * does: PortalContainerProvider with that window's body).
 * A ref counts as a container of its own whatever it holds now: the caller memoizes on
 * the ref object, which never changes, so reading `.current` here would take an empty
 * ref (a first render, a keepMounted popup) for the body for good. Erring this way only
 * keeps the padding, never clips the popup.
 */
function portalsToBody(container: FrameInsetsContainer): boolean {
  if (container && "current" in container) return false;
  const node = container;
  const element = node && node.nodeType !== 1 && "host" in node ? node.host : node;
  if (element == null) return true;
  const doc = element.ownerDocument;
  return element === doc.body || element === doc.documentElement;
}

/**
 * The window inset by the frame insets, as a collision boundary rect. Its
 * fields are read each time Base UI places the popup (it copies them), so it
 * follows the window when it resizes while the popup is open, any async shell
 * update to `--raft-frame-inset-*` (via `readInsets`), and WebKit's visual
 * viewport when it pans (visualViewportShift). `doc` is the document the popup
 * renders in (the page's by default): its window is the one measured.
 */
export function frameCollisionBoundary(
  insets: FrameInsets,
  readInsets?: () => FrameInsets,
  doc?: Document,
): CollisionBoundary {
  const root = () => (doc ?? document).documentElement;
  const view = () => (doc ? ownerWindow(doc) : undefined);
  const current = () => (readInsets ? readInsets() : insets);
  return {
    get x() {
      return current().left + visualViewportShift(undefined, view()).x;
    },
    get y() {
      return current().top + visualViewportShift(undefined, view()).y;
    },
    get width() {
      const next = current();
      return Math.max(0, root().clientWidth - next.left - next.right);
    },
    get height() {
      const next = current();
      return Math.max(0, root().clientHeight - next.top - next.bottom);
    },
  };
}

/**
 * How a popup keeps out of the frame insets: `padding` from the window's edge,
 * and on each side with an inset, at least the inset plus `gap`
 * (frameCollisionPadding).
 *
 * The insets bound the collision area (frameCollisionBoundary) and the padding
 * keeps only what is left past them. They are not added to the padding,
 * because Base UI also sizes its shift limiter from the padding (limitShift
 * offset = arrow / 2 + (left + right) / 2, or top + bottom beside the trigger):
 * a padding that carried a 70px window-controls inset pushed a short tooltip
 * with an arrow up to that half-sum off its trigger with nothing in the way.
 * The area the popup is kept in is the same either way.
 *
 * Only a popup portaled to the body (no `container`, or the body or the root
 * element) takes the boundary. One portaled into a container of its own may
 * sit inside an element that clips it (a dialog's scrolling body), and an
 * explicit boundary would replace Base UI's default, the clipping ancestors,
 * so it would flip and size against the window and be cut off.
 *
 * With no inset, a `boundary` of the caller's own (it bounds the popup as it
 * is, so the insets go into the padding), or a container of its own, this is
 * frameCollisionPadding.
 */
export function frameCollision(
  padding: CollisionPadding,
  boundary: CollisionBoundary | undefined,
  insets: FrameInsets,
  gap: number,
  container?: FrameInsetsContainer,
  readInsets?: () => FrameInsets,
): FrameCollision {
  const padded = frameCollisionPadding(padding, insets, gap);
  if (
    !hasInset(insets) ||
    boundary !== undefined ||
    typeof document === "undefined" ||
    !portalsToBody(container)
  ) {
    return { collisionPadding: padded, collisionBoundary: boundary };
  }
  const full = padded as Required<Exclude<CollisionPadding, number>>;
  const side = (key: keyof FrameInsets) => Math.max(0, full[key] - insets[key]);
  return {
    collisionPadding: {
      top: side("top"),
      right: side("right"),
      bottom: side("bottom"),
      left: side("left"),
    },
    collisionBoundary: frameCollisionBoundary(
      insets,
      readInsets,
      ownerDocument(contextElement(container)),
    ),
  };
}

/**
 * What usePopupCollision gives a positioner. In a sheet it also takes the
 * positioner's `ref`, so the sheet's boundary can find the popup's anchor.
 */
export interface PopupCollision extends FrameCollision {
  ref?: RefObject<HTMLDivElement | null>;
}

/**
 * A popup's collision padding and boundary (a tooltip, a popover, a menu, a
 * select or combobox list, a preview card): `defaultPadding` where there is no
 * inset, and `gap` (8px) inside each inset, the insets as the boundary
 * (frameCollision). A `collisionPadding` the caller passes wins as it is, and
 * a `collisionBoundary` the caller passes is kept. Call it from a part inside
 * the popup's portal, which mounts each time the popup opens, and spread the
 * result on the positioner.
 *
 * In a sheet (a phone's DialogSheetContent, a Drawer, an app's own under
 * SheetPopupBoundary) a popup with no `collisionBoundary` of its own takes the
 * sheet's: the area under its head, decided for this popup each time it is
 * placed (sheetPopupBoundary), whatever its portal container. Pass the
 * positioner's own `anchor` as `anchor`: the sheet then decides by it, not by
 * the trigger it would look up in the page. Outside a sheet nothing changes,
 * and no `ref` is returned.
 *
 * With no `container` it takes the nearest PortalContainerProvider's, where
 * the popup's portal goes: the insets, the direction and the window are that
 * container's document's.
 */
export function usePopupCollision(
  collisionPadding: CollisionPadding | undefined,
  collisionBoundary: CollisionBoundary | undefined,
  defaultPadding: CollisionPadding,
  container?: FrameInsetsContainer,
  gap: number = POPUP_FRAME_GAP,
  anchor?: PopupAnchor,
): PopupCollision {
  const provided = usePortalContainer();
  const frameContainer = container !== undefined ? container : (provided ?? undefined);
  const insets = useFrameInsets(frameContainer);
  const sheet = usePopupSheet();
  // The positioner, once Base UI has rendered it: read when the popup is placed.
  const [positioner] = useState<{ current: HTMLDivElement | null }>(() => ({ current: null }));
  // The caller's anchor as of the last commit, read when the popup is placed:
  // floating-ui measures after a yield, so after this effect. Not a dependency
  // of the boundary: an anchor written inline is new each render, and a new
  // boundary has Base UI rebuild its middleware.
  const [latest] = useState(() => {
    let current = anchor;
    return {
      read: () => current,
      set: (next: PopupAnchor) => {
        current = next;
      },
    };
  });
  useLayoutEffect(() => {
    latest.set(anchor);
  }, [latest, anchor]);
  const sheetBoundary = useMemo(
    () =>
      sheet && collisionBoundary === undefined
        ? sheetPopupBoundary(sheet, () => positioner.current, latest.read)
        : undefined,
    [sheet, collisionBoundary, positioner, latest],
  );
  const boundary = collisionBoundary ?? sheetBoundary;
  // Base UI rebuilds its positioning middleware when the padding's or the
  // boundary's identity changes.
  return useMemo(() => {
    const collision =
      collisionPadding === undefined
        ? frameCollision(defaultPadding, boundary, insets, gap, frameContainer, () =>
            readFrameInsets(frameContainer),
          )
        : { collisionPadding, collisionBoundary: boundary };
    return sheetBoundary ? { ...collision, ref: positioner } : collision;
  }, [
    collisionPadding,
    boundary,
    sheetBoundary,
    positioner,
    defaultPadding,
    insets,
    gap,
    frameContainer,
  ]);
}
