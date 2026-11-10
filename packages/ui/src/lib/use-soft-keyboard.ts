import { useEffect, useState } from "react";

/**
 * What is visible while the on-screen keyboard is up: the visual viewport's
 * top and height, and the window's height under it, in whole px.
 */
export type SoftKeyboardViewport = {
  /** px from the layout viewport's top to the visible area's top. */
  top: number;
  /** px of the visible area, above the keyboard. */
  height: number;
  /** px of the layout viewport (`innerHeight`), which the keyboard doesn't shrink. */
  windowHeight: number;
};

/** The keyboard takes more than this; a browser's toolbars take less. */
const KEYBOARD_MIN_PX = 100;

const NOT_TYPED = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

function isTextEditable(element: Element | null) {
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLInputElement) return !NOT_TYPED.has(element.type);
  return element instanceof HTMLElement && element.isContentEditable;
}

/**
 * The visible area while the on-screen keyboard is up, `null` while it is
 * down, and always `null` while `active` is false and on the server. The
 * keyboard counts as up when something typed into has focus and the visual
 * viewport is more than 100px shorter than the window: a stale short visual
 * viewport with nothing focused (an iOS home-screen app just resumed) doesn't
 * count. It measures at most once a frame, on the visual viewport's resize
 * and scroll and on focus changes, and reads the focused element only when
 * the viewport is short, so typing and scrolling force no layout.
 */
export function useSoftKeyboard(active: boolean): SoftKeyboardViewport | null {
  const [keyboard, setKeyboard] = useState<SoftKeyboardViewport | null>(null);
  useEffect(() => {
    const viewport = typeof window === "undefined" ? undefined : window.visualViewport;
    if (!active || !viewport) return;
    const update = () => {
      const windowHeight = window.innerHeight;
      const height = viewport.height;
      const up = windowHeight - height > KEYBOARD_MIN_PX && isTextEditable(document.activeElement);
      const next = up
        ? {
            top: Math.round(Math.max(viewport.offsetTop, 0)),
            height: Math.round(height),
            windowHeight: Math.round(windowHeight),
          }
        : null;
      setKeyboard((previous) =>
        previous &&
        next &&
        previous.top === next.top &&
        previous.height === next.height &&
        previous.windowHeight === next.windowHeight
          ? previous
          : next,
      );
    };
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    schedule();
    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      document.removeEventListener("focusin", schedule);
      document.removeEventListener("focusout", schedule);
      setKeyboard(null);
    };
  }, [active]);
  return active ? keyboard : null;
}
