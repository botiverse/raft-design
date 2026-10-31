import { useMemo, useState } from "react";
import type { RefObject } from "react";

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
  if (node instanceof Element) return node;
  if (node && "host" in node) return node.host;
  return document.body ?? document.documentElement;
}

function measureWithProbe(root: Element): MeasureFrameInset & { done(): void } {
  let probe: HTMLDivElement | null = null;
  const measure = (value: string, axis: "block" | "inline") => {
    if (!probe) {
      probe = document.createElement("div");
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
 * of the container counts.
 */
export function readFrameInsets(container?: FrameInsetsContainer): FrameInsets {
  if (typeof document === "undefined") return NO_FRAME_INSETS;
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const values = {
    top: style.getPropertyValue("--raft-frame-inset-top"),
    start: style.getPropertyValue("--raft-frame-inset-start"),
    end: style.getPropertyValue("--raft-frame-inset-end"),
  };
  if (values.top.trim() === "" && values.start.trim() === "" && values.end.trim() === "") {
    return NO_FRAME_INSETS;
  }
  const rtl = getComputedStyle(contextElement(container)).direction === "rtl";
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

/**
 * The frame insets, read when the calling component mounts. Call it from a
 * part inside the popup's portal, which mounts each time the popup opens.
 */
export function useFrameInsets(container?: FrameInsetsContainer): FrameInsets {
  const [insets] = useState(() => readFrameInsets(container));
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
 * The window inset by the frame insets, as a collision boundary rect. Its size
 * is read each time Base UI places the popup (it copies the rect's fields), so
 * it follows the window when it resizes while the popup is open.
 */
export function frameCollisionBoundary(insets: FrameInsets): CollisionBoundary {
  const root = () => document.documentElement;
  return {
    x: insets.left,
    y: insets.top,
    get width() {
      return Math.max(0, root().clientWidth - insets.left - insets.right);
    },
    get height() {
      return Math.max(0, root().clientHeight - insets.top - insets.bottom);
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
 * With no inset, or a `boundary` of the caller's own (it bounds the popup as
 * it is, so the insets go into the padding), this is frameCollisionPadding.
 */
export function frameCollision(
  padding: CollisionPadding,
  boundary: CollisionBoundary | undefined,
  insets: FrameInsets,
  gap: number,
): FrameCollision {
  const padded = frameCollisionPadding(padding, insets, gap);
  if (!hasInset(insets) || boundary !== undefined || typeof document === "undefined") {
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
    collisionBoundary: frameCollisionBoundary(insets),
  };
}

/**
 * A popup's collision padding and boundary (a tooltip, a popover, a menu, a
 * select or combobox list, a preview card): `defaultPadding` where there is no
 * inset, and `gap` (8px) inside each inset, the insets as the boundary
 * (frameCollision). A `collisionPadding` the caller passes wins as it is, and
 * a `collisionBoundary` the caller passes is kept. Call it from a part inside
 * the popup's portal, which mounts each time the popup opens.
 */
export function usePopupCollision(
  collisionPadding: CollisionPadding | undefined,
  collisionBoundary: CollisionBoundary | undefined,
  defaultPadding: CollisionPadding,
  container?: FrameInsetsContainer,
  gap: number = POPUP_FRAME_GAP,
): FrameCollision {
  const insets = useFrameInsets(container);
  // Base UI rebuilds its positioning middleware when the padding's or the
  // boundary's identity changes.
  return useMemo(
    () =>
      collisionPadding === undefined
        ? frameCollision(defaultPadding, collisionBoundary, insets, gap)
        : { collisionPadding, collisionBoundary },
    [collisionPadding, collisionBoundary, defaultPadding, insets, gap],
  );
}
