import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import { isElement } from "../../lib/owner-window";
import { PopupSheetContext } from "../../lib/popup-boundary";
import { usePortalWindow } from "../../lib/portal-container";
import type { PopupSheet } from "../../lib/popup-boundary";
import { useMobileViewport } from "../../lib/use-mobile-viewport";
import { useSoftKeyboard } from "../../lib/use-soft-keyboard";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";
import { DialogContent } from "./dialog";
import type { DialogContentProps, DialogOverlayProps } from "./dialog";
import {
  DialogSheetContext,
  DialogSheetSurfaceContext,
  dialogSheet,
  useDialogSheet,
} from "./dialog-sheet-context";
import type { DialogSheetState } from "./dialog-sheet-context";

export type DialogSheetContentProps = DialogContentProps;

/**
 * DialogContent for a dialog with several fields, a long list or steps. On a
 * desktop and a tablet it is DialogContent, the same DOM and classes. Below
 * 768px it is a sheet: docked to the bottom, as tall as its content up to 90%
 * of the screen, sliding up over its scrim; when its content changes height
 * (the next step, a growing text box) the sheet animates to the new height.
 * `DialogHeader` becomes a pushed page's head (× at the start, the title, the
 * `DialogCommit` button at the end), `DialogFooter` is hidden (× is Cancel; a
 * link written first in it becomes a full-width Button at the end of the
 * body) and `DialogBody` scrolls on the phone's 16px margin above the home
 * indicator. Base UI keeps Esc, focus and close. `placement` applies on a
 * desktop and a tablet only: the sheet is docked to the bottom.
 */
export function DialogSheetContent({
  className,
  overlay,
  placement,
  style,
  ref,
  children,
  ...props
}: DialogSheetContentProps) {
  const phone = useMobileViewport(usePortalWindow());
  const [commitSlot, setCommitSlot] = useState<HTMLElement | null>(null);
  const [bodyEndSlot, setBodyEndSlot] = useState<HTMLElement | null>(null);
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const keyboardBox = useSheetKeyboardBox(phone);
  useRevealNewProblems(phone ? popup : null);
  useSheetHeightMotion(phone ? popup : null);

  const state = useMemo<DialogSheetState>(
    () => ({
      sheet: phone,
      commitSlot: phone ? commitSlot : null,
      setCommitSlot,
      bodyEndSlot: phone ? bodyEndSlot : null,
      setBodyEndSlot,
    }),
    [phone, commitSlot, bodyEndSlot],
  );
  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      setPopup(element);
      assignRef(ref, element);
    },
    [ref],
  );

  // A popup opened in the sheet stays in it, under its head (dialog.md,
  // "Popups in a sheet").
  const popupSheet = useMemo<PopupSheet | undefined>(
    () =>
      phone && popup
        ? {
            head: () => popup.querySelector('[data-slot="dialog-header"]'),
            surface: () => popup,
          }
        : undefined,
    [phone, popup],
  );

  const sheet = dialogSheet();
  const sheetOverlay = useMemo<false | DialogOverlayProps>(
    () =>
      overlay === false
        ? false
        : {
            ...(typeof overlay === "object" ? overlay : null),
            className: cn(
              dialogSheet().overlay(),
              typeof overlay === "object" ? overlay.className : "",
            ),
            // A press on the scrim above the sheet lands on this cover, not
            // on the backdrop itself, so Base UI doesn't dismiss: a stray tap
            // must not lose a half-filled form. × and Esc close it.
            // This relies on Base UI: in @base-ui/react 1.8.0 a modal
            // Dialog's outsidePress (dialog/root/useDialogRoot) closes only
            // when the press's target is the backdrop element itself, or an
            // element outside the popup's portal (mui/base-ui#1320), not a
            // child of the backdrop. If an upgrade closes on any press inside
            // the backdrop, "does not close on a tap on the scrim above it"
            // in dialog.sheet.browser.test.tsx fails.
            children: <span aria-hidden className="absolute inset-0" />,
          },
    [overlay],
  );
  const sheetStyle = useMemo(
    () => (keyboardBox ? { ...style, ...keyboardBox } : style),
    [style, keyboardBox],
  );

  // Provided inside the popup: DialogContent starts every surface outside a
  // sheet, so a dialog opened from this one doesn't inherit it.
  return (
    <DialogSheetSurfaceContext.Provider value={phone}>
      <DialogContent
        {...props}
        ref={setRef}
        placement={phone ? undefined : placement}
        overlay={phone ? sheetOverlay : overlay}
        className={phone ? cn(className, sheet.content()) : className}
        style={phone ? sheetStyle : style}
        data-sheet={phone ? "" : undefined}
      >
        <DialogSheetContext.Provider value={state}>
          <PopupSheetContext.Provider value={popupSheet}>{children}</PopupSheetContext.Provider>
        </DialogSheetContext.Provider>
      </DialogContent>
    </DialogSheetSurfaceContext.Provider>
  );
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

export type DialogCommitProps = ButtonProps;

/**
 * The dialog's one commit button: a `Button`, written where it goes on a
 * desktop (the end of `DialogFooter`). In a `DialogSheetContent` below 768px
 * it is drawn at the end of the sheet's head instead, the same button (color,
 * words, disabled and loading state) at `size="md"`. In a flow of steps, write
 * each step's button as one (Next, then the last step's action).
 *
 * A submit button stays its form's default button in the head: it is tied to
 * the form it was written in by the form's `id` (the `form` attribute), so a
 * click and Enter in a field submit, and neither does while it is disabled.
 * Give that form an `id`, or pass `form`. Without one a click still submits
 * the form, but Enter in a field doesn't.
 */
export function DialogCommit({ size, form, onClick, ...props }: DialogCommitProps) {
  const { commitSlot } = useDialogSheet();
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [writtenIn, setWrittenIn] = useState<HTMLFormElement | null>(null);

  // The form the button was written in, once it is drawn in the head.
  useLayoutEffect(() => {
    if (!commitSlot || form) return;
    const found = anchorRef.current?.closest("form") ?? null;
    setWrittenIn(found);
    if (process.env.NODE_ENV === "production" || props.type !== "submit" || found?.id) return;
    // The head is outside the form, so only the form's id ties the two:
    // without it Enter in a field submits nothing, on a phone only.
    console.warn(
      found
        ? "raft-ui: a submit DialogCommit is drawn in a phone sheet's head, outside its form, and the form has no id, so Enter in a field doesn't submit it (a click still does). Give the form an id, or pass `form` to DialogCommit."
        : "raft-ui: a submit DialogCommit in a phone sheet isn't inside a form and has no `form`, so it submits nothing. Pass `form` with the form's id.",
    );
  }, [commitSlot, form, props.type]);

  const handleClick = useCallback<NonNullable<ButtonProps["onClick"]>>(
    (event) => {
      onClick?.(event);
      // A form with no id: submit it on a click, as the button would have.
      if (!event.defaultPrevented && props.type === "submit" && writtenIn && !writtenIn.id) {
        event.preventDefault();
        writtenIn.requestSubmit();
      }
    },
    [onClick, props.type, writtenIn],
  );

  if (!commitSlot) return <Button size={size} form={form} onClick={onClick} {...props} />;
  const linkedForm = form ?? (writtenIn?.id || undefined);
  return (
    <>
      <span ref={anchorRef} hidden />
      {createPortal(
        <Button size="md" form={linkedForm} onClick={handleClick} {...props} />,
        commitSlot,
      )}
    </>
  );
}

/**
 * The sheet's box while the on-screen keyboard is up: docked to the top of the
 * keyboard, and no taller than the visual viewport, nor than its usual 90% of
 * the window. It is still as tall as its content within that, so a short form
 * stays short: the head stays in view and a longer body scrolls above the
 * keyboard. `undefined` otherwise (the CSS box).
 */
function useSheetKeyboardBox(active: boolean): CSSProperties | undefined {
  const keyboard = useSoftKeyboard(active, usePortalWindow());
  return useMemo(() => {
    if (!keyboard) return undefined;
    const room = Math.round(Math.min(keyboard.height, keyboard.windowHeight * 0.9));
    const bottom = keyboard.windowHeight - (keyboard.top + keyboard.height);
    return { top: "auto", bottom: `${bottom}px`, maxHeight: `${room}px` };
  }, [keyboard]);
}

/** How long the sheet takes to reach a new height (dialog.md, "The sheet"). */
const SHEET_HEIGHT_MS = 200;

/**
 * The sheet is as tall as its content, so content that changes height (the
 * next step of a flow, a text box growing as people type) would make it jump.
 * Instead it goes from the old height to the new one over 200ms on ease-slide:
 * the height is pinned at the old one in px for a moment, then set to the new
 * one in px, which CSS transitions (`height: auto` can't), and unpinned when
 * it gets there. With reduced motion it changes at once. A new width or cap
 * (the window resized, the keyboard up or down) changes it at once too: only
 * content animates it. A change that comes during the move is picked up when
 * it ends.
 */
function useSheetHeightMotion(popup: HTMLElement | null) {
  useEffect(() => {
    const view = popup?.ownerDocument.defaultView;
    if (!popup || !view || typeof view.ResizeObserver === "undefined") return;
    const reduced = view.matchMedia?.("(prefers-reduced-motion: reduce)");
    let rest: { height: number; width: number; cap: string } | null = null;
    let moving: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      const box = popup.getBoundingClientRect();
      return { height: box.height, width: box.width, cap: view.getComputedStyle(popup).maxHeight };
    };
    const observer = new view.ResizeObserver(() => {
      if (moving !== undefined) return;
      const next = measure();
      const from = rest;
      rest = next;
      if (
        !from ||
        reduced?.matches ||
        popup.hasAttribute("data-ending-style") ||
        from.width !== next.width ||
        from.cap !== next.cap ||
        Math.abs(from.height - next.height) < 1
      ) {
        return;
      }
      popup.style.setProperty("--dialog-sheet-height", `${from.height}px`);
      // Read layout, so the old height is where the transition starts.
      popup.getBoundingClientRect();
      popup.style.setProperty("--dialog-sheet-height", `${next.height}px`);
      moving = setTimeout(() => {
        moving = undefined;
        popup.style.removeProperty("--dialog-sheet-height");
        // Unpinned it is as tall as its content now: if that changed during
        // the move, the observer sees it and moves again from here.
        rest = { ...measure(), height: next.height };
        // A frame past the transition's end, so it is unpinned where it stopped.
      }, SHEET_HEIGHT_MS + 50);
    });
    observer.observe(popup);
    return () => {
      observer.disconnect();
      clearTimeout(moving);
      popup.style.removeProperty("--dialog-sheet-height");
    };
  }, [popup]);
}

/**
 * The commit is at the top of a sheet, so an error a failed commit adds near
 * the bottom of a long form would appear out of sight. A problem added after
 * the sheet opens (an alert, or a warning or destructive Banner) is scrolled
 * into view.
 */
const PROBLEM_SELECTOR =
  "[role=alert], [data-slot=banner][data-status=warning], [data-slot=banner][data-status=destructive]";

function useRevealNewProblems(popup: HTMLElement | null) {
  useEffect(() => {
    if (!popup || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!isElement(node)) continue;
          const problem = node.matches(PROBLEM_SELECTOR)
            ? node
            : node.querySelector(PROBLEM_SELECTOR);
          if (problem) {
            problem.scrollIntoView?.({ block: "nearest" });
            return;
          }
        }
      }
    });
    observer.observe(popup, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [popup]);
}
