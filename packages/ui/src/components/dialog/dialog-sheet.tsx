import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import { PopupBoundaryContext, sheetPopupBoundary } from "../../lib/popup-boundary";
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
 * 768px it is a sheet: docked to the bottom, 90% of the screen tall, sliding
 * up over its scrim; `DialogHeader` becomes a pushed page's head (× at the
 * start, the title, the `DialogCommit` button at the end), `DialogFooter` is
 * hidden (× is Cancel) and `DialogBody` scrolls on the phone's 16px margin
 * above the home indicator. Base UI keeps Esc, focus and close. `placement`
 * applies on a desktop and a tablet only: the sheet is docked to the bottom.
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
  const phone = useMobileViewport();
  const [commitSlot, setCommitSlot] = useState<HTMLElement | null>(null);
  const [bodyEndSlot, setBodyEndSlot] = useState<HTMLElement | null>(null);
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const keyboardBox = useSheetKeyboardBox(phone);
  useRevealNewProblems(phone ? popup : null);

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
  const popupBoundary = useMemo(
    () =>
      phone && popup
        ? sheetPopupBoundary(
            () => popup.querySelector('[data-slot="dialog-header"]'),
            () => popup,
          )
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
          <PopupBoundaryContext.Provider value={popupBoundary}>
            {children}
          </PopupBoundaryContext.Provider>
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
 * keyboard, as tall as the visual viewport allows up to its usual 90% of the
 * window. With the keyboard up the visual viewport is shorter than that, so
 * the sheet fills it: the head stays in view and the body scrolls above the
 * keyboard. `undefined` otherwise (the CSS box).
 */
function useSheetKeyboardBox(active: boolean): CSSProperties | undefined {
  const keyboard = useSoftKeyboard(active);
  return useMemo(() => {
    if (!keyboard) return undefined;
    const height = Math.round(Math.min(keyboard.height, keyboard.windowHeight * 0.9));
    const top = keyboard.top + keyboard.height - height;
    return { top: `${top}px`, bottom: "auto", height: `${height}px` };
  }, [keyboard]);
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
          if (!(node instanceof Element)) continue;
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
