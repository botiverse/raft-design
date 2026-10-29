import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";

// The give-way steps of the toolbar for selected messages, taken one at a
// time until its row fits on one line (design/components/overview.md ›
// Toolbar for selected messages): Copy Link shows its label only when it
// fits, otherwise only its icon; if there is still no room it moves into
// More. Only where even that can't fit (a long count in a long language on
// the narrowest phone) does Forward show only its icon. The count never gives
// way, and the row never wraps.
const STEPS = ["copyLinkIcon", "copyLinkInMore", "forwardIcon"] as const;

export type SelectionToolbarParts = {
  /** The toolbar's room: the element it is centred in. */
  area: RefObject<HTMLDivElement | null>;
  toolbar: RefObject<HTMLDivElement | null>;
  actions: RefObject<HTMLDivElement | null>;
};

export type SelectionToolbarFit = {
  copyLink: "label" | "icon" | "more";
  forwardIconOnly: boolean;
};

/**
 * Fits the toolbar before paint. Each level remembers the width it was
 * entered at, and the row steps back up once its room is more than 8px wider
 * (so it can't flicker between two levels, however slowly the room grows).
 * When `contentKey` changes (another count, Copied) the row is fitted again
 * from every label.
 */
export function useSelectionToolbarFit(
  parts: SelectionToolbarParts,
  contentKey: string,
): SelectionToolbarFit {
  // New content starts again from every label (set while rendering, so the
  // row never paints a level fitted for other content).
  const [fit, setFit] = useState({ key: contentKey, level: 0 });
  if (fit.key !== contentKey) setFit({ key: contentKey, level: 0 });
  const level = fit.key === contentKey ? fit.level : 0;
  const enteredAtRef = useRef<Record<number, number>>({});
  const fittedKeyRef = useRef(contentKey);
  // The level on screen: a measurement taken before a pending step has
  // rendered (StrictMode runs effects twice) must not step again.
  const shownRef = useRef(level);
  const { area: areaRef, toolbar: toolbarRef, actions: actionsRef } = parts;

  useLayoutEffect(() => {
    shownRef.current = level;
    if (fittedKeyRef.current !== contentKey) {
      fittedKeyRef.current = contentKey;
      enteredAtRef.current = {};
    }
    const area = areaRef.current;
    const toolbar = toolbarRef.current;
    const actions = actionsRef.current;
    if (!area || !toolbar || !actions) return;
    let frame = 0;
    const decide = () => {
      const width = area.clientWidth;
      // The toolbar is no wider than its room; when the row needs more, the
      // actions run past its end. (Not scrollWidth: each button's 44px hit
      // area overhangs the toolbar's edge by design.)
      const end =
        toolbar.getBoundingClientRect().right -
        (Number.parseFloat(getComputedStyle(toolbar).paddingRight) || 0);
      const overflow = actions.getBoundingClientRect().right > end + 1;
      setFit((previous) => {
        const current = previous.level;
        if (current !== shownRef.current) return previous;
        if (overflow) {
          if (current >= STEPS.length) return previous;
          enteredAtRef.current[current + 1] = width;
          return { ...previous, level: current + 1 };
        }
        const enteredAt = enteredAtRef.current[current];
        if (current > 0 && enteredAt !== undefined && width > enteredAt + 8) {
          return { ...previous, level: current - 1 };
        }
        return previous;
      });
    };
    decide();
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(decide);
    });
    observer.observe(area);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [areaRef, toolbarRef, actionsRef, contentKey, level]);

  return {
    copyLink: level >= 2 ? "more" : level >= 1 ? "icon" : "label",
    forwardIconOnly: level >= 3,
  };
}

/** role="toolbar": the arrow keys, Home and End move between its buttons; Tab still visits each. */
export function moveFocusInToolbar(event: KeyboardEvent<HTMLElement>) {
  const { key } = event;
  if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") return;
  const buttons = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
  );
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (index < 0) return;
  event.preventDefault();
  const next =
    key === "Home"
      ? 0
      : key === "End"
        ? buttons.length - 1
        : (index + (key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
  buttons[next]?.focus();
}
