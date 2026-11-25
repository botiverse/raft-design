import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import { ownerDocument, ownerWindow } from "./owner-window";
import {
  findPopupAnchor,
  resolvePopupAnchor,
  sheetPopupBoundary,
  usePopupSheet,
  visualViewportShift,
} from "./popup-boundary";
import type { PopupAnchor } from "./popup-boundary";
import { usePortalContainer } from "./portal-container";

/**
 * The parts of the screen a host shell keeps for itself (design/patterns/
 * page-structure.md#frame-insets): a band across the top of the window and
 * its two corners, the window's own controls on desktop. The shell publishes
 * them on the root element as --raft-frame-inset-top (the band's height),
 * --raft-frame-inset-start and --raft-frame-inset-end (its corners' widths,
 * which reach no lower than the band); the web sets none, so they read 0. A
 * column down a whole side (a foldable phone's system column) has variables
 * of its own, --raft-frame-column-*, not read here yet.
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
const WCO_DIRECT_ENV = /^env\(\s*titlebar-area-(x|y|width|height)\s*(?:,\s*[^()]+\s*)?\)$/;
const WCO_END_INSET =
  /^max\(\s*0(?:px)?\s*,\s*calc\(\s*100vw\s*-\s*env\(\s*titlebar-area-x\s*(?:,\s*[^()]+\s*)?\)\s*-\s*env\(\s*titlebar-area-width\s*(?:,\s*(?:calc\([^()]+\)|[^()]+)\s*)?\)\s*\)\s*\)$/;

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

interface WindowControlsOverlayLike extends EventTarget {
  readonly visible?: boolean;
  getTitlebarAreaRect?(): { x: number; y: number; width: number; height: number };
}

interface CachedFrameInsets {
  key: string;
  insets: FrameInsets;
}

const cachedInsetsByDoc = new WeakMap<Document, CachedFrameInsets>();
const probeByDoc = new WeakMap<Document, HTMLDivElement>();

function windowControlsOverlayOf(view: Window | undefined): WindowControlsOverlayLike | undefined {
  if (!view) return undefined;
  return (view.navigator as Navigator & { windowControlsOverlay?: WindowControlsOverlayLike })
    .windowControlsOverlay;
}

function windowControlsOverlayKey(view: Window): string {
  const overlay = windowControlsOverlayOf(view);
  if (!overlay?.visible) return "";
  const rect = overlay.getTitlebarAreaRect?.();
  if (!rect) return "1";
  return `${rect.x},${rect.y},${rect.width},${rect.height}`;
}

function contextElement(container: FrameInsetsContainer): Element {
  const node = container && "current" in container ? container.current : container;
  // By `nodeType`: an element of another window isn't an `instanceof Element` here.
  if (node && node.nodeType === 1) return node as Element;
  if (node && "host" in node) return node.host;
  return document.body ?? document.documentElement;
}

function resolveWindowControlsInsetPx(value: string, view: Window): number | null {
  const overlay = windowControlsOverlayOf(view);
  if (!overlay?.visible || typeof overlay.getTitlebarAreaRect !== "function") {
    return null;
  }
  const direct = WCO_DIRECT_ENV.exec(value);
  if (direct) {
    const rect = overlay.getTitlebarAreaRect();
    const key = direct[1] as "x" | "y" | "width" | "height";
    return rect[key];
  }
  if (WCO_END_INSET.test(value)) {
    const rect = overlay.getTitlebarAreaRect();
    return Math.max(0, view.innerWidth - rect.x - rect.width);
  }
  return null;
}

/**
 * Resolves Window Controls Overlay `env(titlebar-area-*)` insets directly from
 * `navigator.windowControlsOverlay.getTitlebarAreaRect()` (zero DOM changes or
 * layout), and measures any other non-px CSS length using one persistent
 * off-layout probe per document mounted on `body` (never transiently
 * appended/removed on `<html>`, which flips `body:last-child` /
 * `body:only-child` and invalidates styles across the entire document).
 */
function measureForDocument(doc: Document, view: Window): MeasureFrameInset {
  return (value: string, axis: "block" | "inline") => {
    const wcoPx = resolveWindowControlsInsetPx(value, view);
    if (wcoPx !== null) {
      return wcoPx;
    }
    const host = doc.body ?? doc.documentElement;
    let probe = probeByDoc.get(doc);
    if (!probe) {
      probe = doc.createElement("div");
      probe.setAttribute("aria-hidden", "true");
      probe.setAttribute("data-raft-frame-inset-probe", "");
      probe.style.cssText =
        "position:fixed;top:0;left:0;width:0;height:0;contain:layout style paint;visibility:hidden;pointer-events:none";
      probeByDoc.set(doc, probe);
    }
    if (probe.parentNode !== host) {
      host.append(probe);
    }
    probe.style.width = "0";
    probe.style.height = "0";
    probe.style.setProperty(axis === "block" ? "height" : "width", value);
    const box = probe.getBoundingClientRect();
    probe.style.width = "0";
    probe.style.height = "0";
    return axis === "block" ? box.height : box.width;
  };
}

/**
 * Reads the frame insets, as physical px, caching the measured result per
 * document while the raw custom properties, direction, root font size,
 * viewport size and Window Controls Overlay geometry are unchanged. The
 * direction is the one the popup renders in: the computed `direction` of its
 * portal container (the body by default), so `dir="rtl"` on the document or on
 * the nearest ancestor of the container counts. The variables are read on the
 * root element of the container's document: a window of its own
 * (PortalContainerProvider) has the insets its shell publishes there, none by
 * default.
 */
export function readFrameInsets(container?: FrameInsetsContainer): FrameInsets {
  if (typeof document === "undefined") return NO_FRAME_INSETS;
  const context = contextElement(container);
  const doc = ownerDocument(context);
  const view = ownerWindow(context);
  const root = doc.documentElement;
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
  const cacheKey = `${values.top}\0${values.start}\0${values.end}\0${rtl ? 1 : 0}\0${style.fontSize}\0${root.clientWidth}\0${root.clientHeight}\0${view.innerWidth}\0${windowControlsOverlayKey(view)}`;
  const cached = cachedInsetsByDoc.get(doc);
  if (cached && cached.key === cacheKey) {
    return cached.insets;
  }
  const insets = frameInsetsFrom(values, rtl, measureForDocument(doc, view));
  cachedInsetsByDoc.set(doc, { key: cacheKey, insets });
  return insets;
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
    const overlay = windowControlsOverlayOf(view);
    const sync = () => {
      const next = readFrameInsets(container);
      setInsets((current) => (sameInsets(current, next) ? current : next));
    };
    view.addEventListener("resize", sync);
    overlay?.addEventListener?.("geometrychange", sync);
    return () => {
      view.removeEventListener("resize", sync);
      overlay?.removeEventListener?.("geometrychange", sync);
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

/** The collision padding as one number per side, a side left out being 0. */
function paddingSides(padding: CollisionPadding): Required<Exclude<CollisionPadding, number>> {
  if (typeof padding === "number") {
    return { top: padding, right: padding, bottom: padding, left: padding };
  }
  return {
    top: padding.top ?? 0,
    right: padding.right ?? 0,
    bottom: padding.bottom ?? 0,
    left: padding.left ?? 0,
  };
}

/**
 * Whether a popup's anchor reaches into the window's top band (the top inset,
 * from the window's top edge down), measured each time the popup is placed.
 */
export type ReachesFrameBand = (bandHeight: number) => boolean;

/**
 * Whether `anchor` (the one passed to the popup, else the open trigger found
 * from its positioner, findPopupAnchor) reaches into the top band: its top is
 * above the band's bottom edge. With no anchor to read (a context menu, anchored
 * to a point) it doesn't: the band's own controls all have a trigger to find.
 */
export function anchorReachesFrameBand(
  positioner: () => Element | null | undefined,
  anchor: () => PopupAnchor = () => undefined,
): ReachesFrameBand {
  return (bandHeight) => {
    if (bandHeight <= 0) return false;
    const target = resolvePopupAnchor(anchor()) ?? findPopupAnchor(positioner());
    if (!target) return false;
    return target.getBoundingClientRect().top < bandHeight;
  };
}

/**
 * The window inset by the frame insets, as a collision boundary rect. Its
 * fields are read each time Base UI places the popup (it copies them), so it
 * follows the window when it resizes while the popup is open, any async shell
 * update to `--raft-frame-inset-*` (via `readInsets`), and WebKit's visual
 * viewport when it pans (visualViewportShift). `doc` is the document the popup
 * renders in (the page's by default): its window is the one measured.
 *
 * The top inset is a band across the window, and the boundary starts below it.
 * The start and end insets are its two corners, not columns down the window's
 * sides: they move the boundary's left and right edges only while
 * `reachesBand` says the popup's anchor reaches into the band, to `gap` past
 * the corner (no closer than `padding`, the popup's own, which the caller
 * keeps on those sides). A popup anchored below the band can't reach into it,
 * since the boundary's top keeps it out, so it keeps to the window's edges.
 * With no `reachesBand` the corners always count.
 */
export function frameCollisionBoundary(
  insets: FrameInsets,
  readInsets?: () => FrameInsets,
  doc?: Document,
  reachesBand?: ReachesFrameBand,
  padding: CollisionPadding = 0,
  gap = 0,
): CollisionBoundary {
  const root = () => (doc ?? document).documentElement;
  const view = () => (doc ? ownerWindow(doc) : undefined);
  const own = paddingSides(padding);
  const current = () => (readInsets ? readInsets() : insets);
  // How far in from the window's left and right edges the boundary starts.
  const corners = () => {
    const next = current();
    const none = { left: 0, right: 0 };
    if (next.left === 0 && next.right === 0) return none;
    if (reachesBand && !reachesBand(next.top)) return none;
    const corner = (side: "left" | "right") =>
      next[side] > 0 ? Math.max(own[side], next[side] + gap) - own[side] : 0;
    return { left: corner("left"), right: corner("right") };
  };
  return {
    get x() {
      return corners().left + visualViewportShift(undefined, view()).x;
    },
    get y() {
      return current().top + visualViewportShift(undefined, view()).y;
    },
    get width() {
      const { left, right } = corners();
      return Math.max(0, root().clientWidth - left - right);
    },
    get height() {
      const next = current();
      return Math.max(0, root().clientHeight - next.top - next.bottom);
    },
  };
}

/**
 * How a popup keeps out of the frame insets: `padding` from the window's edge,
 * and on each side with an inset, at least the inset plus `gap`.
 *
 * The insets bound the collision area (frameCollisionBoundary) and the padding
 * keeps only what is left past them. They are not added to the padding,
 * because Base UI also sizes its shift limiter from the padding (limitShift
 * offset = arrow / 2 + (left + right) / 2, or top + bottom beside the trigger):
 * a padding that carried a 70px window-controls inset pushed a short tooltip
 * with an arrow up to that half-sum off its trigger with nothing in the way.
 * The area the popup is kept in is the same either way. The left and right
 * padding stay the popup's own: the start and end insets are corners of the
 * top band, which count only for a popup whose anchor reaches into it
 * (`reachesBand`), so the boundary takes them whole, gap included.
 *
 * Only a popup portaled to the body (no `container`, or the body or the root
 * element) takes the boundary. One portaled into a container of its own may
 * sit inside an element that clips it (a dialog's scrolling body), and an
 * explicit boundary would replace Base UI's default, the clipping ancestors,
 * so it would flip and size against the window and be cut off.
 *
 * With no inset, a `boundary` of the caller's own (it bounds the popup as it
 * is), or a container of its own, the top inset goes into the padding
 * (frameCollisionPadding), and the corners don't: a padding is one number for
 * the whole height, and a popup under the band, as nearly all are, would keep
 * the corner's width from the window's edge all the way down.
 */
export function frameCollision(
  padding: CollisionPadding,
  boundary: CollisionBoundary | undefined,
  insets: FrameInsets,
  gap: number,
  container?: FrameInsetsContainer,
  readInsets?: () => FrameInsets,
  reachesBand?: ReachesFrameBand,
): FrameCollision {
  if (!hasInset(insets)) {
    return { collisionPadding: padding, collisionBoundary: boundary };
  }
  if (boundary !== undefined || typeof document === "undefined" || !portalsToBody(container)) {
    const band = insets.top === 0 ? NO_FRAME_INSETS : { ...NO_FRAME_INSETS, top: insets.top };
    return {
      collisionPadding: frameCollisionPadding(padding, band, gap),
      collisionBoundary: boundary,
    };
  }
  const own = paddingSides(padding);
  const padded = paddingSides(frameCollisionPadding(padding, insets, gap));
  const side = (key: "top" | "bottom") => Math.max(0, padded[key] - insets[key]);
  return {
    collisionPadding: {
      top: side("top"),
      right: own.right,
      bottom: side("bottom"),
      left: own.left,
    },
    collisionBoundary: frameCollisionBoundary(
      insets,
      readInsets,
      ownerDocument(contextElement(container)),
      reachesBand,
      own,
      gap,
    ),
  };
}

/**
 * What usePopupCollision gives a positioner. In a sheet, and wherever the
 * frame insets are its boundary, it also takes the positioner's `ref`, so the
 * boundary can find the popup's anchor.
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
 * the trigger it would look up in the page.
 *
 * Under the window's own controls, the start and end insets count only for a
 * popup whose anchor reaches into the top band (frameCollisionBoundary), told
 * the same way: by `anchor`, else the open trigger found from the positioner.
 * In a sheet, and where the frame insets are the boundary, the result carries
 * the positioner's `ref` to merge into the positioner's own; elsewhere none.
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
  const reachesBand = useMemo(
    () => anchorReachesFrameBand(() => positioner.current, latest.read),
    [positioner, latest],
  );
  const boundary = collisionBoundary ?? sheetBoundary;
  // Base UI rebuilds its positioning middleware when the padding's or the
  // boundary's identity changes.
  return useMemo(() => {
    const collision =
      collisionPadding === undefined
        ? frameCollision(
            defaultPadding,
            boundary,
            insets,
            gap,
            frameContainer,
            () => readFrameInsets(frameContainer),
            reachesBand,
          )
        : { collisionPadding, collisionBoundary: boundary };
    const framed = collision.collisionBoundary !== boundary;
    return sheetBoundary || framed ? { ...collision, ref: positioner } : collision;
  }, [
    collisionPadding,
    boundary,
    sheetBoundary,
    positioner,
    reachesBand,
    defaultPadding,
    insets,
    gap,
    frameContainer,
  ]);
}
