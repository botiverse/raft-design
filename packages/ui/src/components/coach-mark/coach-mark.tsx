import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import type { ComponentPropsWithRef, ReactNode, RefObject } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { isHTMLElement, isNode, ownerWindow } from "../../lib/owner-window";
import { tv } from "../../lib/tv";
import { useMergedRef } from "../../lib/use-merged-ref";
import { Button } from "../button/button";
import type { ButtonProps } from "../button/button";
import { PopoverArrow, PopoverContentWithDefaultPadding } from "../popover/popover";
import type { PopoverContentProps } from "../popover/popover";

const coachMark = tv({
  slots: {
    content: ["relative w-[300px] min-w-0 max-w-(--available-width)", "overflow-visible"],
    action: ["flex", "px-4 pb-3"],
    actions: ["flex items-center gap-2", "px-4 pb-4"],
    count: ["me-auto", "font-mono text-mono-meta font-normal tabular-nums text-foreground-hint"],
  },
});

type Anchor = Element | null | RefObject<Element | null>;

function anchorElement(anchor: Anchor | undefined): Element | null {
  if (!anchor) return null;
  if ("current" in anchor) return anchor.current;
  return anchor;
}

type CoachMarkContextValue = {
  anchor: Anchor | undefined;
  popupRef: RefObject<HTMLDivElement | null>;
  nextRef: RefObject<HTMLButtonElement | null>;
};

const CoachMarkContext = createContext<CoachMarkContextValue | null>(null);

function useCoachMarkContext(part: string): CoachMarkContextValue {
  const context = useContext(CoachMarkContext);
  if (!context) throw new Error(`${part} must be used inside <CoachMark>`);
  return context;
}

export type CoachMarkProps = {
  /**
   * What this stop is about, an element or a ref to one. While the stop is
   * open its target holds the Located wash (`data-located="held"`); pass the
   * whole row for a list row. A ref is read after every render, so a ref
   * that moves to another element (a row given a new key) moves the wash too.
   */
  anchor: Anchor;
  /** Whether the stop is showing. @default true */
  open?: boolean;
  /**
   * Called when the person ends the tour from the bubble: Esc while focus is
   * in it, or a `PopoverClose` in it. Skip and Done are the product's own
   * buttons and call its own handlers. A press outside and focus leaving
   * never close it, and Esc pressed anywhere else goes on to what has focus.
   */
  onDismiss?: () => void;
  children?: ReactNode;
};

const TABBABLE = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "textarea",
  "iframe",
  "summary",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]",
].join(",");

/**
 * The elements Tab stops at, in document order. While focus is outside a
 * non-modal popup, Base UI takes its controls out of the Tab order
 * (`tabindex="-1"`, the original kept in `data-tabindex`); they count as it
 * counts them. In the target's own document (another window's under
 * PortalContainerProvider).
 */
function tabbables(doc: Document): HTMLElement[] {
  return Array.from(doc.querySelectorAll<HTMLElement>(TABBABLE)).filter((el) => {
    const kept = el.getAttribute("data-tabindex");
    return (
      (el.tabIndex >= 0 || (kept !== null && !kept.startsWith("-"))) &&
      !(el as HTMLButtonElement).disabled &&
      !el.hasAttribute("data-base-ui-focus-guard") &&
      !el.closest("[inert]") &&
      (typeof el.checkVisibility !== "function" || el.checkVisibility())
    );
  });
}

function follows(a: Node, b: Node): boolean {
  return Boolean(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING);
}

/**
 * Tab order around a stop: the bubble's buttons come right after its target
 * (design/patterns/coach-marks.md#focus-and-keys). The bubble has no trigger,
 * so Base UI can't place it; this finds the page's stop before the bubble (the
 * target, its last control, or the last one before it) and the stop after it.
 */
function tourTabOrder(target: Element, popup: HTMLElement) {
  const all = tabbables(target.ownerDocument);
  const inPopup = all.filter((el) => el !== popup && popup.contains(el));
  const page = all.filter((el) => !popup.contains(el));
  const atTarget = page.filter((el) => el === target || target.contains(el));
  const before =
    atTarget[atTarget.length - 1] ?? page.filter((el) => !follows(el, target)).pop() ?? null;
  const after = page.find((el) => follows(el, target) && !target.contains(el)) ?? null;
  return { first: inPopup[0] ?? null, last: inPopup[inPopup.length - 1] ?? null, before, after };
}

/** Whether focus is in a field of `doc` outside the bubble: the person is typing. */
function isTypingOutside(popup: Element | null, doc: Document): boolean {
  const active = doc.activeElement;
  if (!isHTMLElement(active) || popup?.contains(active)) return false;
  const view = ownerWindow(active);
  return (
    active.isContentEditable ||
    active instanceof view.HTMLTextAreaElement ||
    (active instanceof view.HTMLInputElement &&
      !["button", "checkbox", "radio", "submit", "reset"].includes(active.type)) ||
    active.getAttribute("role") === "textbox"
  );
}

function restoreLocated(el: Element, before: string | null) {
  if (el.getAttribute("data-located") !== "held") return;
  if (before === null) el.removeAttribute("data-located");
  else el.setAttribute("data-located", before);
}

/**
 * Starts a stop on its target and returns what ends it: the held Located
 * wash, put back as it was; focus on Next, unless the person is typing (the
 * popup mounts with the stop, so it waits for Next to be there); and Tab and
 * Shift+Tab, with the bubble right after its target.
 *
 * `opened` is true for a new stop: the tour opened, or moved on to another
 * `anchor`. It is false when the same `anchor`, a ref, now points at another
 * element (a row given a new key): then focus moves to Next only if it was
 * in the bubble, so a person using another control isn't pulled back.
 */
function startStop(
  target: Element,
  popupRef: RefObject<HTMLDivElement | null>,
  nextRef: RefObject<HTMLButtonElement | null>,
  opened: boolean,
): () => void {
  const before = target.getAttribute("data-located");
  target.setAttribute("data-located", "held");
  // The target's document and window: another window's under PortalContainerProvider.
  const doc = target.ownerDocument;
  const view = ownerWindow(target);

  let frame = 0;
  let tries = 0;
  const focusNext = () => {
    const next = nextRef.current;
    if (!next) {
      if (tries++ < 5) frame = view.requestAnimationFrame(focusNext);
      return;
    }
    const popup = popupRef.current;
    const active = doc.activeElement;
    const wasInBubble = !active || active === doc.body || Boolean(popup?.contains(active));
    if (opened ? !isTypingOutside(popup, doc) : wasInBubble) next.focus({ preventScroll: true });
  };
  frame = view.requestAnimationFrame(focusNext);

  // In the bubbling phase, after the page's own handlers: a control that
  // takes Tab itself (a field accepting a suggestion) keeps it.
  const onKeyDown = (event: KeyboardEvent) => {
    const popup = popupRef.current;
    if (
      event.defaultPrevented ||
      event.key !== "Tab" ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !popup
    )
      return;
    const active = doc.activeElement;
    if (!isHTMLElement(active)) return;
    const { first, last, before: pageBefore, after } = tourTabOrder(target, popup);
    let to: HTMLElement | null = null;
    if (popup.contains(active)) {
      if (!event.shiftKey && active === last) to = after;
      else if (event.shiftKey && active === first) to = pageBefore;
    } else if (!event.shiftKey && active === pageBefore) to = first;
    else if (event.shiftKey && active === after) to = last;
    if (!to) return;
    event.preventDefault();
    to.focus();
  };
  doc.addEventListener("keydown", onKeyDown);

  return () => {
    view.cancelAnimationFrame(frame);
    doc.removeEventListener("keydown", onKeyDown);
    restoreLocated(target, before);
  };
}

/**
 * Wraps a RefObject in a fresh ref shell whose getter reads `.current` inside
 * Base UI's commit effects. Because Base UI keys its position-reference effect
 * on `anchor`'s identity (and skips `setPositionReference` when the unwrapped
 * element is unchanged), a ref that swaps to a remounted element (a re-keyed
 * row) re-attaches `autoUpdate` without redundant updates when unchanged.
 *
 * Relies on the parent re-rendering `CoachMark` when the ref target remounts;
 * if the target remounts inside an isolated subtree without re-rendering
 * `CoachMark`, Base UI keeps observing the old element until it disconnects.
 */
function liveRefAnchor(anchor: Anchor | undefined): Anchor | undefined {
  if (!anchor || !("current" in anchor)) return anchor;
  return {
    get current() {
      return anchor.current;
    },
  };
}

/**
 * One stop of a tour: a non-modal popover anchored to its target, which
 * holds the Located wash while the stop is open
 * (design/patterns/coach-marks.md). The product owns the tour: which stop is
 * open, the copy, and where focus goes when it ends.
 */
export function CoachMark({ anchor, open = true, onDismiss, children }: CoachMarkProps) {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  // The stop's set-up on its target: the held wash, focus on Next, and the
  // Tab order. Read after every render: a ref anchor can point at another
  // element without the ref itself changing (a row given a new key).
  const stopRef = useRef<{ anchor: Anchor; target: Element; teardown: () => void } | null>(null);
  useEffect(() => {
    const target = open ? anchorElement(anchor) : null;
    const stop = stopRef.current;
    if (stop?.target === target && stop.anchor === anchor) return;
    const opened = stop === null || stop.anchor !== anchor;
    stop?.teardown();
    stopRef.current = target
      ? { anchor, target, teardown: startStop(target, popupRef, nextRef, opened) }
      : null;
  });
  useEffect(
    () => () => {
      stopRef.current?.teardown();
      stopRef.current = null;
    },
    [],
  );

  const handleOpenChange = useCallback<NonNullable<BasePopover.Root.Props["onOpenChange"]>>(
    (nextOpen, details) => {
      if (nextOpen) return;
      if (details.reason === "close-press") {
        onDismiss?.();
        return;
      }
      if (details.reason !== "escape-key") return;
      const from = details.event?.target;
      if (isNode(from) && popupRef.current?.contains(from)) {
        onDismiss?.();
        return;
      }
      // Esc elsewhere belongs to what has focus (a composer's suggestions, an
      // edit): leave the event to it.
      details.cancel();
      details.allowPropagation();
    },
    [onDismiss],
  );

  const context = useMemo(() => ({ anchor, popupRef, nextRef }), [anchor]);

  return (
    <CoachMarkContext.Provider value={context}>
      <BasePopover.Root data-slot="coach-mark" open={open} onOpenChange={handleOpenChange}>
        {children}
      </BasePopover.Root>
    </CoachMarkContext.Provider>
  );
}

export type CoachMarkContentProps = Omit<
  PopoverContentProps,
  "anchor" | "size" | "initialFocus" | "finalFocus" | "collisionPadding"
> & {
  /**
   * Additional space to maintain from the edge of the collision boundary: 8px
   * from the window's edge, and 8px from a frame inset where a shell keeps one.
   * A value you pass is kept as it is.
   * @default 8
   */
  collisionPadding?: PopoverContentProps["collisionPadding"];
};

/**
 * The bubble: 300px, 8px from its target and at least 8px from the window's
 * edge (or frame inset), with an arrow on whichever side it opens.
 */
export function CoachMarkContent({
  side = "bottom",
  sideOffset = 8,
  align = "center",
  collisionPadding,
  className,
  children,
  ref,
  ...props
}: CoachMarkContentProps) {
  const { anchor, popupRef } = useCoachMarkContext("CoachMarkContent");
  const { content } = coachMark();
  const [setRef] = useMergedRef(popupRef, ref);

  return (
    <PopoverContentWithDefaultPadding
      data-slot="coach-mark-content"
      anchor={liveRefAnchor(anchor) ?? undefined}
      side={side}
      sideOffset={sideOffset}
      align={align}
      collisionPadding={collisionPadding}
      defaultCollisionPadding={8}
      initialFocus={false}
      finalFocus={false}
      className={content({ className })}
      ref={setRef}
      {...props}
    >
      {children}
      <PopoverArrow />
    </PopoverContentWithDefaultPadding>
  );
}

export type CoachMarkActionProps = ComponentPropsWithRef<"div">;

/** One more thing the stop offers (Turn on notifications), an `outline` button on its own row under the text. */
export function CoachMarkAction({ className, ...props }: CoachMarkActionProps) {
  const { action } = coachMark();
  return <div data-slot="coach-mark-action" className={action({ className })} {...props} />;
}

export type CoachMarkActionsProps = ComponentPropsWithRef<"div">;

/** The bubble's last row: `CoachMarkCount` at the start, then Skip and `CoachMarkNext` at the end. */
export function CoachMarkActions({ className, ...props }: CoachMarkActionsProps) {
  const { actions } = coachMark();
  return <div data-slot="coach-mark-actions" className={actions({ className })} {...props} />;
}

export type CoachMarkCountProps = ComponentPropsWithRef<"span">;

/** Which stop this is, "2 of 6", in Space Mono. */
export function CoachMarkCount({ className, ...props }: CoachMarkCountProps) {
  const { count } = coachMark();
  return <span data-slot="coach-mark-count" className={count({ className })} {...props} />;
}

export type CoachMarkNextProps = Omit<ButtonProps, "variant">;

/** Next, or Done on the last stop: the pink button, and where focus goes when the stop opens. */
export function CoachMarkNext({ ref, ...props }: CoachMarkNextProps) {
  const { nextRef } = useCoachMarkContext("CoachMarkNext");
  const [setRef] = useMergedRef(nextRef, ref);
  return <Button data-slot="coach-mark-next" variant="primary" ref={setRef} {...props} />;
}
