import { useCallback, useRef } from "react";

/**
 * Tap activation: a navigation control switches when the finger lifts, not on
 * the click that follows (design/patterns/navigation.md#switching-on-finger-lift).
 *
 * Why: on a phone, while a list is still momentum-scrolling, the first tap
 * only stops the scroll. The browser fires `touchstart` and `touchend` but no
 * `click`, so a tab, a segment or a tab bar item that activates on click needs
 * a second tap. A finger that lands and lifts in place on the control is a tap
 * whatever the page was doing, so the control activates on that `touchend`.
 *
 * A `touchend` counts as a tap when
 *
 * - the touch was the only finger down and didn't move more than
 *   `TAP_SLOP_PX` (10px) from where it landed: more is a scroll or a swipe
 *   (the same 10px as the touch drag's tolerance, `touch-drag.ts`);
 * - it lifted inside the control's box: sliding off is how people cancel;
 * - it lasted less than `TAP_MAX_MS` (500ms): at 500ms a long press opens a
 *   menu or arms a drag (design/foundations/states.md#dragging-on-a-touch-screen),
 *   and a tap must not race them;
 * - the browser lets it be cancelled (`cancelable`). A `touchend` that ends a
 *   scroll the browser is running is not cancelable; then the browser decides,
 *   and the control waits for its click as before.
 *
 * Then it calls `preventDefault()`, which stops the browser's own mouse events
 * and click for this touch (no ghost click on what appears under the finger),
 * focuses the control and calls `element.click()`. The control's own click
 * path (Base UI's activation, `onValueChange`, a link's navigation) runs as
 * for any click, so a mouse, a pen and the keyboard go the way they always
 * did: they send no touch events. A click that still arrives for the same
 * touch, from a browser that sends one anyway, is swallowed, so the control
 * activates exactly once.
 *
 * A disabled control (`disabled`, `aria-disabled="true"` or `data-disabled`)
 * does nothing. A pen on iPad sends touch events marked `stylus`; it is left
 * to its click, like a pen anywhere else.
 *
 * Only navigation controls take this: tabs, segments, toggle groups, the tab
 * bar and Back. Rows, list items and menu items don't: they sit in the list
 * that scrolls, and a finger that stops the list on a row must not open it.
 */
export const TAP_SLOP_PX = 10;
export const TAP_MAX_MS = 500;

/** How long after a tap a click on the same control is the browser's echo of it. */
const ECHO_CLICK_MS = 800;

const DISABLED = ':disabled, [aria-disabled="true"], [data-disabled]';

type Gesture = { id: number; x: number; y: number; at: number; moved: boolean };

function findTouch(list: TouchList | undefined, id: number): Touch | undefined {
  if (!list) return undefined;
  for (let i = 0; i < list.length; i++) {
    const touch = list[i];
    if (touch && touch.identifier === id) return touch;
  }
  return undefined;
}

function isStylus(touch: Touch): boolean {
  return (touch as Touch & { touchType?: string }).touchType === "stylus";
}

/**
 * Make `element` activate on a tap's `touchend`. Returns a function that
 * removes the listeners. Does nothing outside a browser.
 */
export function attachTapActivation(element: HTMLElement): () => void {
  const view = element.ownerDocument?.defaultView;
  if (!view) return () => undefined;
  const now = () => view.performance?.now() ?? Date.now();

  let gesture: Gesture | null = null;
  // Set while our own `element.click()` runs, so the echo guard lets it through.
  let clicking = false;
  let swallowClickUntil = -Infinity;

  const onTouchStart = (event: TouchEvent) => {
    swallowClickUntil = -Infinity;
    const touch = event.touches.length === 1 ? event.changedTouches[0] : undefined;
    gesture =
      touch && !isStylus(touch)
        ? { id: touch.identifier, x: touch.clientX, y: touch.clientY, at: now(), moved: false }
        : null;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!gesture || gesture.moved) return;
    const touch = findTouch(event.touches, gesture.id);
    if (!touch) return;
    if (Math.hypot(touch.clientX - gesture.x, touch.clientY - gesture.y) > TAP_SLOP_PX) {
      gesture.moved = true;
    }
  };

  const onTouchCancel = () => {
    gesture = null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    const started = gesture;
    gesture = null;
    if (!started || started.moved || event.touches.length > 0) return;
    const touch = findTouch(event.changedTouches, started.id);
    if (!touch) return;
    if (Math.hypot(touch.clientX - started.x, touch.clientY - started.y) > TAP_SLOP_PX) return;
    if (now() - started.at >= TAP_MAX_MS) return;
    if (!event.cancelable) return;
    if (element.matches(DISABLED)) return;
    const box = element.getBoundingClientRect();
    const inside =
      touch.clientX >= box.left &&
      touch.clientX <= box.right &&
      touch.clientY >= box.top &&
      touch.clientY <= box.bottom;
    if (!inside) return;

    event.preventDefault();
    swallowClickUntil = now() + ECHO_CLICK_MS;
    const focusedBefore = element.ownerDocument.activeElement;
    clicking = true;
    try {
      element.click();
    } finally {
      clicking = false;
    }
    // After the click, so a control that selects on focus does not select twice.
    // Leave focus alone if the click moved it (a tab that opens a search field).
    if (element.ownerDocument.activeElement === focusedBefore)
      element.focus({ preventScroll: true });
  };

  // Only a touch's own click is an echo: a key press or a mouse or pen press
  // inside the window is a new activation.
  const endEchoWindow = () => {
    swallowClickUntil = -Infinity;
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "touch") endEchoWindow();
  };

  const onClick = (event: MouseEvent) => {
    if (clicking || now() > swallowClickUntil) return;
    swallowClickUntil = -Infinity;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const passive = { passive: true } as const;
  element.addEventListener("touchstart", onTouchStart, passive);
  element.addEventListener("touchmove", onTouchMove, passive);
  element.addEventListener("touchcancel", onTouchCancel, passive);
  element.addEventListener("pointerdown", onPointerDown, passive);
  element.addEventListener("keydown", endEchoWindow, passive);
  // Not passive: it calls preventDefault().
  element.addEventListener("touchend", onTouchEnd, { passive: false });
  // Capture, so the echo is stopped before React's delegated onClick sees it.
  element.addEventListener("click", onClick, { capture: true });
  return () => {
    element.removeEventListener("touchstart", onTouchStart);
    element.removeEventListener("touchmove", onTouchMove);
    element.removeEventListener("touchcancel", onTouchCancel);
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("keydown", endEchoWindow);
    element.removeEventListener("touchend", onTouchEnd);
    element.removeEventListener("click", onClick, { capture: true });
  };
}

/**
 * A ref callback that gives the element it is set to tap activation
 * (`attachTapActivation`), and removes it when the element goes or
 * `enabled` turns false. Merge it with the control's other refs.
 */
export function useTapActivation<E extends HTMLElement>(enabled = true): (node: E | null) => void {
  const detachRef = useRef<(() => void) | null>(null);
  return useCallback(
    (node: E | null) => {
      detachRef.current?.();
      detachRef.current = enabled && node ? attachTapActivation(node) : null;
    },
    [enabled],
  );
}
