"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { DragOverlay, defaultDropAnimationSideEffects, useDndContext } from "@dnd-kit/core";
import type { DropAnimation, Modifier } from "@dnd-kit/core";
import { cn } from "../../lib/cn";
import { useTheme } from "../../lib/theme/use-theme";
import { drag, LIFT_CLASS } from "./drag.recipe";

export { LIFT_CLASS };

/**
 * A drag settling (motion.md, `motion-drag-settle-*`): the lifted copy
 * gliding into its place on a drop or back home on a cancel, siblings sliding
 * apart to open the place, and a layout reflowing on a drop.
 */
export const DRAG_SETTLE = { duration: 160, easing: "cubic-bezier(0.25, 1, 0.5, 1)" } as const;

/** For `useSortable({ transition })`: siblings slide with the same token. */
export const DRAG_SIBLING_TRANSITION = {
  duration: DRAG_SETTLE.duration,
  easing: DRAG_SETTLE.easing,
} as const;

/** The item a drag came from, while nothing else has taken its place (`data-drag-origin`). */
export const ORIGIN_OPACITY = 0.4;

/** Auto-scroll starts this close to the edge of anything that scrolls. */
export const DRAG_AUTO_SCROLL_ZONE_PX = 48;

/** How far a keyboard drag sets the copy off its place, so the place's dashed outline shows. */
export const DRAG_KEYBOARD_OFFSET_PX = 6;

const hideActiveWhileGliding = defaultDropAnimationSideEffects({
  styles: { active: { opacity: "0" } },
});

/**
 * Drop: the copy glides into its place. Cancel: it glides back home. While
 * it glides, the item it will become stays hidden, then appears there.
 */
export const DROP_GLIDE: DropAnimation = {
  duration: DRAG_SETTLE.duration,
  easing: DRAG_SETTLE.easing,
  sideEffects: (parameters) => {
    const restore = hideActiveWhileGliding(parameters);
    // A keyboard drag's copy sits off its place; it settles onto it with the glide.
    const copy = parameters.dragOverlay.node.querySelector<HTMLElement>("[data-slot=drag-lift]");
    if (copy?.style.translate) {
      copy.style.transition = `translate ${DRAG_SETTLE.duration}ms ${DRAG_SETTLE.easing}`;
      copy.style.translate = "0px 0px";
    }
    return restore;
  },
};

const OVERLAY_STYLE: CSSProperties = { pointerEvents: "none" };

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(listener: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION).matches
  );
}

/**
 * The sibling transition for `useSortable({ transition })`: the drag-settle
 * slide, or none with `prefers-reduced-motion`.
 */
export function useDragSiblingTransition() {
  const reduced = useSyncExternalStore(subscribeReducedMotion, reducedMotion, () => false);
  return reduced ? null : DRAG_SIBLING_TRANSITION;
}

const KEYBOARD_OFFSET = `${DRAG_KEYBOARD_OFFSET_PX}px ${DRAG_KEYBOARD_OFFSET_PX}px`;

function isKeyboardEvent(event: Event | null): event is KeyboardEvent {
  return typeof KeyboardEvent !== "undefined" && event instanceof KeyboardEvent;
}

/**
 * For a compact proxy (a section's head, at most 240px wide): the grab point
 * is kept, but pulled to within `inset` of the proxy's end, so the hand never
 * holds empty air beside it. A constant shift: the copy still tracks 1:1.
 */
export function keepGrabInside(proxyWidth: number, inset = 20): Modifier {
  return ({ transform, activatorEvent, activeNodeRect }) => {
    if (!activeNodeRect || !activatorEvent) return transform;
    const point = eventPoint(activatorEvent);
    if (!point) return transform;
    const grabX = point.x - activeNodeRect.left;
    const max = proxyWidth - inset;
    return grabX > max ? { ...transform, x: transform.x + (grabX - max) } : transform;
  };
}

function eventPoint(event: Event): { x: number; y: number } | null {
  if ("clientX" in event && typeof (event as PointerEvent).clientX === "number") {
    const pointerEvent = event as PointerEvent;
    return { x: pointerEvent.clientX, y: pointerEvent.clientY };
  }
  const touch = (event as TouchEvent).touches?.[0] ?? (event as TouchEvent).changedTouches?.[0];
  return touch ? { x: touch.clientX, y: touch.clientY } : null;
}

/**
 * Cancels the drag in progress, whichever sensor holds it. Every dnd-kit
 * sensor (and so every sensor of `useDragSensors`) puts the item back when the
 * window is resized, so this sends the window a `resize`: unlike a synthetic
 * Escape, no app's own Escape handler (a dialog, a panel, a popover) hears it.
 */
export function cancelDrag(win: Window = window) {
  win.dispatchEvent(new Event("resize"));
}

/**
 * Above every raft-ui layer (popovers 50, a stacked dialog 60, toasts and the
 * lightbox 70) and an app's own top layers: the copy in the hand is always on
 * top. dnd-kit's own default.
 */
export const DRAG_LIFT_Z_INDEX = 999;

const noSubscribe = () => () => {};
const clientBody = () => document.body;
const serverBody = () => null;

/**
 * For a component whose copy goes to `document.body` unless it is told
 * otherwise: `undefined` is the body (once on the client, so hydration
 * matches), `null` is in place, and an element is that element.
 */
export function useLiftContainer(container: Element | DocumentFragment | null | undefined) {
  const body = useSyncExternalStore(noSubscribe, clientBody, serverBody);
  return container === undefined ? body : container;
}

export type DragLiftProps = {
  /** The lifted copy: the dragged item itself, or a compact proxy for a large one. Nothing while nothing is lifted. */
  children?: ReactNode;
  /**
   * The copy takes the item's size and the control radius. Pass the item's
   * own radius here, such as `rounded-container` for a card, or a size for a
   * compact proxy (`size-auto max-w-60`).
   */
  className?: string;
  style?: CSSProperties;
  /** Modifiers for the copy only, such as one that keeps a compact proxy under the hand. */
  modifiers?: Modifier[];
  /**
   * Scroll whatever scrollable area the pointer comes within 48px of the edge
   * of. Turn dnd-kit's own off (`<DndContext autoScroll={false}>`) so the two
   * don't scroll together.
   * @default true
   */
  autoScroll?: boolean;
  /**
   * Render the copy in another element, such as `document.body` when an
   * ancestor has a transform (a drawer, a dialog), which would offset a
   * `position: fixed` copy. It keeps the theme scope it was rendered in
   * (`light` / `dark`), as raft-ui's portals do. By default it renders in place.
   */
  container?: Element | DocumentFragment | null;
  /** @default DRAG_LIFT_Z_INDEX (999) */
  zIndex?: number;
};

/**
 * The copy of a dragged item that follows the hand
 * (design/patterns/drag-and-drop.md#what-follows-the-hand): an opaque popover
 * surface with `shadow-float` and a `line-seam` ring, no scale and no tilt,
 * 1:1 with the pointer from the grab point, never clamped to its container and
 * never held to one axis. On a drop it glides into its place, and on a cancel
 * back home (160ms, `motion-drag-settle-*`; none with reduced motion).
 *
 * While something is lifted it also sets the grabbing cursor, cancels the
 * drag when the window loses focus or the tab is hidden, and scrolls an area
 * the pointer is near the edge of. Render it inside the `DndContext`.
 */
export function DragLift({
  children,
  className,
  style,
  modifiers,
  autoScroll = true,
  container,
  zIndex = DRAG_LIFT_Z_INDEX,
}: DragLiftProps) {
  const { lift } = drag();
  const { resolvedMode } = useTheme();
  const reduced = useSyncExternalStore(subscribeReducedMotion, reducedMotion, () => false);
  const { activatorEvent } = useDndContext();
  // By keyboard the copy sits a little down and right of its place, so the
  // dashed outline under it shows. Drawn on the copy, not the overlay dnd-kit
  // measures, so it moves no drop target.
  const liftStyle = useMemo<CSSProperties | undefined>(
    () => (isKeyboardEvent(activatorEvent) ? { translate: KEYBOARD_OFFSET, ...style } : style),
    [activatorEvent, style],
  );
  const overlay = (
    <DragOverlay
      dropAnimation={reduced ? null : DROP_GLIDE}
      modifiers={modifiers}
      zIndex={zIndex}
      style={OVERLAY_STYLE}
    >
      {children == null || children === false ? null : (
        // dnd-kit measures the overlay's only child: this frame, which the
        // keyboard offset of the copy inside doesn't move.
        <div className="size-full">
          <div data-slot="drag-lift" className={lift({ className })} style={liftStyle}>
            {children}
          </div>
        </div>
      )}
    </DragOverlay>
  );
  return (
    <>
      <DragSession autoScroll={autoScroll} />
      {container
        ? createPortal(
            <div data-slot="drag-lift-portal" className={cn("contents", resolvedMode)}>
              {overlay}
            </div>,
            container,
          )
        : overlay}
    </>
  );
}

/** Where the pointer is during a drag: auto-scroll and the refusal hint read it. */
const pointer = { x: 0, y: 0, known: false };

function trackPointer(event: PointerEvent | TouchEvent) {
  const point = "touches" in event ? event.touches[0] : event;
  if (!point) return;
  pointer.x = point.clientX;
  pointer.y = point.clientY;
  pointer.known = true;
}

/** The pointer's last place, for a hint that follows it. */
export function dragPointer() {
  return pointer.known ? { x: pointer.x, y: pointer.y } : null;
}

function DragSession({ autoScroll }: { autoScroll: boolean }) {
  const { active, activatorEvent } = useDndContext();
  const dragging = active != null;
  const viaKeyboard = isKeyboardEvent(activatorEvent);

  useEffect(() => {
    if (!dragging) return;
    const root = document.documentElement;
    root.setAttribute("data-dragging", "");
    if (activatorEvent && !viaKeyboard) trackPointer(activatorEvent as PointerEvent);
    const onMove = (event: PointerEvent | TouchEvent) => trackPointer(event);
    // Cancel paths dnd-kit leaves open: the window losing focus (a switch to
    // another app), and the tab going hidden for a sensor that misses it.
    const onBlur = () => cancelDrag();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") cancelDrag();
    };
    window.addEventListener("pointermove", onMove, { capture: true, passive: true });
    window.addEventListener("touchmove", onMove, { capture: true, passive: true });
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    let frame = 0;
    const tick = () => {
      if (pointer.known) autoScrollAt(pointer.x, pointer.y);
      frame = requestAnimationFrame(tick);
    };
    if (autoScroll && !viaKeyboard) frame = requestAnimationFrame(tick);
    return () => {
      root.removeAttribute("data-dragging");
      pointer.known = false;
      window.removeEventListener("pointermove", onMove, { capture: true });
      window.removeEventListener("touchmove", onMove, { capture: true });
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(frame);
    };
  }, [dragging, viaKeyboard, autoScroll, activatorEvent]);

  return null;
}

function scrollable(element: Element) {
  const style = getComputedStyle(element);
  return {
    x: /(auto|scroll)/.test(style.overflowX) && element.scrollWidth > element.clientWidth,
    y: /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight,
  };
}

/** Faster the nearer the edge: up to 16px a frame at the edge itself. */
function speed(depth: number) {
  return Math.ceil(16 * Math.min(1, depth / DRAG_AUTO_SCROLL_ZONE_PX) ** 2);
}

function scrollDelta(start: number, end: number, at: number, position: number, max: number) {
  const zone = DRAG_AUTO_SCROLL_ZONE_PX;
  if (at < start + zone && position > 0) return -speed(start + zone - at);
  if (at > end - zone && position < max) return speed(at - (end - zone));
  return 0;
}

/** Scrolls the nearest area under the point that can still scroll toward the edge it is near. */
export function autoScrollAt(x: number, y: number) {
  let element = document.elementFromPoint(x, y);
  while (element && element !== document.documentElement && element !== document.body) {
    const can = scrollable(element);
    if (can.x || can.y) {
      const rect = element.getBoundingClientRect();
      const dy = can.y
        ? scrollDelta(
            rect.top,
            rect.bottom,
            y,
            element.scrollTop,
            element.scrollHeight - element.clientHeight - 1,
          )
        : 0;
      const dx = can.x
        ? scrollDelta(
            rect.left,
            rect.right,
            x,
            element.scrollLeft,
            element.scrollWidth - element.clientWidth - 1,
          )
        : 0;
      if (dx || dy) {
        element.scrollBy(dx, dy);
        return;
      }
    }
    element = element.parentElement;
  }
  const page = document.scrollingElement ?? document.documentElement;
  const dy = scrollDelta(
    0,
    window.innerHeight,
    y,
    page.scrollTop,
    page.scrollHeight - window.innerHeight - 1,
  );
  if (dy) window.scrollBy(0, dy);
}
