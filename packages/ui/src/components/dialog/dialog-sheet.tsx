import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, Ref } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import { useMobileViewport } from "../../lib/use-mobile-viewport";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";
import { DialogContent } from "./dialog";
import type { DialogContentProps, DialogOverlayProps } from "./dialog";
import { DialogSheetContext, dialogSheet, useDialogSheet } from "./dialog-sheet-context";
import type { DialogSheetState } from "./dialog-sheet-context";

export type DialogSheetContentProps = DialogContentProps;

/**
 * DialogContent for a dialog with several fields, a long list or steps. On a
 * desktop and a tablet it is DialogContent, the same DOM and classes. Below
 * 768px it is a sheet: docked to the bottom, 90% of the screen tall, sliding
 * up over its scrim; `DialogHeader` becomes a pushed page's head (× at the
 * start, the title, the `DialogCommit` button at the end), `DialogFooter` is
 * hidden (× is Cancel) and `DialogBody` scrolls on the phone's 16px margin
 * above the home indicator. Base UI keeps Esc, focus and close.
 */
export function DialogSheetContent({
  className,
  overlay,
  style,
  ref,
  ...props
}: DialogSheetContentProps) {
  const phone = useMobileViewport();
  const [commitSlot, setCommitSlot] = useState<HTMLElement | null>(null);
  const [popup, setPopup] = useState<HTMLDivElement | null>(null);
  const keyboardBox = useSheetKeyboardBox(phone);
  useRevealNewProblems(phone ? popup : null);

  const state = useMemo<DialogSheetState>(
    () => ({ sheet: phone, commitSlot: phone ? commitSlot : null, setCommitSlot }),
    [phone, commitSlot],
  );
  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      setPopup(element);
      assignRef(ref, element);
    },
    [ref],
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
            children: <span aria-hidden className="absolute inset-0" />,
          },
    [overlay],
  );
  const sheetStyle = useMemo(
    () => (keyboardBox ? { ...style, ...keyboardBox } : style),
    [style, keyboardBox],
  );

  return (
    <DialogSheetContext.Provider value={state}>
      <DialogContent
        {...props}
        ref={setRef}
        overlay={phone ? sheetOverlay : overlay}
        className={phone ? cn(className, sheet.content()) : className}
        style={phone ? sheetStyle : style}
        data-sheet={phone ? "" : undefined}
      />
    </DialogSheetContext.Provider>
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
 * words, disabled and loading state) at `size="sm"`. A submit button stays
 * its form's default button there: it is tied back to the form it was written
 * in with the `form` attribute, so a click and Enter in a field still submit,
 * and neither does while it is disabled. In a flow of steps, wrap each step's
 * button (Next, then the last step's action).
 */
export function DialogCommit({ size, ...props }: DialogCommitProps) {
  const { commitSlot } = useDialogSheet();
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const movedRef = useRef<HTMLSpanElement | null>(null);
  const formId = useId();

  // Every render: what the button is (and which form it is in) can change.
  useLayoutEffect(() => {
    if (props.form) return;
    const form = anchorRef.current?.closest("form");
    const button = movedRef.current?.querySelector("button");
    if (!form || !button || button.form === form) return;
    if (!form.id) form.id = formId;
    button.setAttribute("form", form.id);
  });

  if (!commitSlot) return <Button size={size} {...props} />;
  return (
    <>
      <span ref={anchorRef} hidden />
      {createPortal(
        <span ref={movedRef} className="contents">
          <Button size="sm" {...props} />
        </span>,
        commitSlot,
      )}
    </>
  );
}

/**
 * The sheet's box while the on-screen keyboard is up: the visual viewport,
 * less the strip of page the sheet leaves above it, so the head stays in view
 * and the body scrolls above the keyboard. `undefined` otherwise (the CSS box).
 */
function useSheetKeyboardBox(active: boolean): CSSProperties | undefined {
  const [box, setBox] = useState<CSSProperties | undefined>(undefined);
  useEffect(() => {
    const viewport = typeof window === "undefined" ? undefined : window.visualViewport;
    if (!active || !viewport) return;
    const update = () => {
      const focused = document.activeElement;
      const editing =
        focused instanceof HTMLInputElement ||
        focused instanceof HTMLTextAreaElement ||
        (focused instanceof HTMLElement && focused.isContentEditable);
      const keyboardUp = editing && window.innerHeight - viewport.height > 100;
      const height = Math.round(Math.min(viewport.height, window.innerHeight * 0.9));
      const top = Math.round(Math.max(viewport.offsetTop, 0) + viewport.height - height);
      setBox((previous) => {
        if (!keyboardUp) return undefined;
        return previous?.top === `${top}px` && previous?.height === `${height}px`
          ? previous
          : { top: `${top}px`, bottom: "auto", height: `${height}px` };
      });
    };
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update, { passive: true });
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, [active]);
  return active ? box : undefined;
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
