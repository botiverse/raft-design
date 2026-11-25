import { useEffect, useRef } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent,
} from "react";
import { TOUCH_DRAG_HOLD_MS, TOUCH_DRAG_TOLERANCE_PX } from "../../lib/touch-drag";

/**
 * How a tooltip opens on a touch screen, which has no hover
 * (tooltip.md#touch-screens):
 *
 * - Hold the trigger still for `TOOLTIP_LONG_PRESS_MS` (500ms, the design
 *   system's long press: the moment raft-ui's long-press menu opens and a
 *   touch drag arms, design/foundations/states.md#dragging-on-a-touch-screen)
 *   and the tooltip opens. It works on a disabled trigger too, as long as the
 *   trigger still gets the touch: a `Button` with `focusableWhenDisabled`
 *   (`aria-disabled`), not a natively `disabled` one, which takes no events.
 * - Moving more than `TOOLTIP_TOUCH_SLOP_PX` (10px) before then, or the
 *   browser taking the touch over for a scroll or a pinch (`pointercancel`),
 *   lets go: it was a scroll.
 * - Lifting the finger after a hold closes the tooltip
 *   `TOOLTIP_RELEASE_CLOSE_MS` later, time to finish reading the line the
 *   finger was covering; a tap anywhere else closes it sooner. The hold
 *   doesn't run the trigger's action: the click the browser may still send
 *   for the touch is swallowed.
 * - With `tap` (an ⓘ button that exists only to explain) a tap opens it and
 *   it stays until the next tap, on it or anywhere else.
 *
 * A long press belongs to whoever owns it; the tooltip takes it only when
 * nothing else does. With `longPress: "auto"` (the default) it leaves the
 * hold alone when the touch lands in a link (the system's link menu: copy,
 * open in a new tab) or in a long-press owner, an element marked
 * `data-long-press-owner` (raft-ui's `ContextMenuTrigger` and touch-draggable
 * items, or an app's own long-press row). `longPress: true` takes the hold
 * even there, for a disabled button whose reason must show inside such a
 * row: the trigger then carries `data-tooltip-long-press`, and the touch and
 * its `contextmenu` stop at it, so an owner listening through React never
 * arms; an owner with its own DOM listener skips touches that start in a
 * `[data-tooltip-long-press]` element.
 *
 * The same as the mobile app's RaftTooltip, so a disabled button's reason
 * shows on a phone the same way on both.
 */
export const TOOLTIP_LONG_PRESS_MS = TOUCH_DRAG_HOLD_MS;
export const TOOLTIP_TOUCH_SLOP_PX = TOUCH_DRAG_TOLERANCE_PX;
export const TOOLTIP_RELEASE_CLOSE_MS = 1500;

/** Marks an element that owns the long press of everything inside it. */
export const LONG_PRESS_OWNER_ATTRIBUTE = "data-long-press-owner";
/** Marks a tooltip trigger that takes the long press even inside an owner. */
export const TOOLTIP_LONG_PRESS_ATTRIBUTE = "data-tooltip-long-press";

const LEAVE_HOLD_TO = `a[href], [${LONG_PRESS_OWNER_ATTRIBUTE}]`;

/** The trigger sits inside (or is) an element that owns the long press. */
function insideOwner(trigger: Element) {
  return trigger.closest(`[${LONG_PRESS_OWNER_ATTRIBUTE}]`) !== null;
}

/** How long after a hold a click on the trigger is the browser's echo of the touch. */
const ECHO_CLICK_MS = 800;

type Gesture = {
  pointerId: number;
  x: number;
  y: number;
  /** The tooltip was open when the finger came down (a tap on it then closes it). */
  wasOpen: boolean;
  /** The hold is the tooltip's: it opens at the long press. */
  hold: boolean;
  held: boolean;
  timer: ReturnType<typeof setTimeout> | undefined;
};

export type TooltipTouchOptions = {
  /**
   * Holding the trigger opens the tooltip: always (`true`), never (`false`),
   * or unless the touch is in a link or a long-press owner (`"auto"`).
   */
  longPress: boolean | "auto";
  /** A tap opens the tooltip, and the next tap closes it. */
  tap: boolean;
  isOpen(): boolean;
  open(): void;
  close(): void;
};

export type TooltipTouchHandlers = {
  onPointerDownCapture(event: ReactPointerEvent<HTMLElement>): void;
  onTouchStart(event: ReactTouchEvent<HTMLElement>): void;
  onPointerMove(event: ReactPointerEvent<HTMLElement>): void;
  onPointerUp(event: ReactPointerEvent<HTMLElement>): void;
  onPointerCancel(event: ReactPointerEvent<HTMLElement>): void;
  onTouchEnd(event: ReactTouchEvent<HTMLElement>): void;
  onContextMenu(event: ReactMouseEvent<HTMLElement>): void;
  onClickCapture(event: ReactMouseEvent<HTMLElement>): void;
};

export function useTooltipTouch(options: TooltipTouchOptions): TooltipTouchHandlers {
  const { longPress, tap } = options;
  const optionsRef = useRef(options);
  const gestureRef = useRef<Gesture | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const swallowClickUntilRef = useRef(0);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(
    () => () => {
      clearTimeout(gestureRef.current?.timer);
      clearTimeout(closeTimerRef.current);
      gestureRef.current = null;
    },
    [],
  );

  function letGo() {
    clearTimeout(gestureRef.current?.timer);
    gestureRef.current = null;
  }

  function isOwnTouch(event: ReactPointerEvent<HTMLElement>) {
    return event.pointerType === "touch" && gestureRef.current?.pointerId === event.pointerId;
  }

  return {
    // Capture: a disabled Base UI button (`focusableWhenDisabled`) drops the
    // `onPointerDown` it is given, and a disabled trigger is where a reason
    // lives.
    onPointerDownCapture(event) {
      if (event.pointerType !== "touch") return;
      letGo();
      // A second finger is a pinch, not a hold.
      if (!event.isPrimary) return;
      const target = event.currentTarget;
      const touched = event.target instanceof Element ? event.target : target;
      const hold = longPress === "auto" ? touched.closest(LEAVE_HOLD_TO) === null : longPress;
      if (!hold && !tap) return;
      clearTimeout(closeTimerRef.current);
      const gesture: Gesture = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        wasOpen: optionsRef.current.isOpen(),
        hold,
        held: false,
        timer: undefined,
      };
      if (hold) {
        gesture.timer = setTimeout(() => {
          if (gestureRef.current !== gesture || !target.isConnected) return;
          gesture.held = true;
          optionsRef.current.open();
        }, TOOLTIP_LONG_PRESS_MS);
      }
      gestureRef.current = gesture;
    },
    onTouchStart(event) {
      // Taking the hold inside an owner: an owner above that listens
      // through React (Base UI's ContextMenuTrigger) never arms.
      if (longPress === true && insideOwner(event.currentTarget)) event.stopPropagation();
    },
    onPointerMove(event) {
      const gesture = gestureRef.current;
      if (!gesture || gesture.held || !isOwnTouch(event)) return;
      const moved = Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y);
      if (moved > TOOLTIP_TOUCH_SLOP_PX) letGo();
    },
    onPointerUp(event) {
      const gesture = gestureRef.current;
      if (!gesture || !isOwnTouch(event)) return;
      letGo();
      if (gesture.held) {
        swallowClickUntilRef.current = event.timeStamp + ECHO_CLICK_MS;
        closeTimerRef.current = setTimeout(
          () => optionsRef.current.close(),
          TOOLTIP_RELEASE_CLOSE_MS,
        );
        return;
      }
      if (!tap) return;
      if (gesture.wasOpen) optionsRef.current.close();
      else optionsRef.current.open();
    },
    onPointerCancel(event) {
      const gesture = gestureRef.current;
      if (!gesture || !isOwnTouch(event)) return;
      letGo();
      // A hold the browser took over at the end still opened the tooltip:
      // close it the same way as on lifting the finger.
      if (gesture.held) {
        closeTimerRef.current = setTimeout(
          () => optionsRef.current.close(),
          TOOLTIP_RELEASE_CLOSE_MS,
        );
      }
    },
    onTouchEnd(event) {
      // After a hold, no mouse events and no click for this touch: the hold
      // read the tooltip, it didn't press the button.
      if (event.timeStamp <= swallowClickUntilRef.current && event.cancelable) {
        event.preventDefault();
      }
    },
    onContextMenu(event) {
      // The hold is the tooltip's: no system menu or callout on top of it
      // (Android sends this at its own long press, 400ms, while the hold
      // runs), and no owner's menu either.
      const holding = gestureRef.current?.hold === true;
      if (!holding && event.timeStamp > swallowClickUntilRef.current) return;
      event.preventDefault();
      if (longPress === true && insideOwner(event.currentTarget)) event.stopPropagation();
    },
    onClickCapture(event) {
      if (event.timeStamp > swallowClickUntilRef.current) return;
      swallowClickUntilRef.current = 0;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}
