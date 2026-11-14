import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import type { ComponentPropsWithRef, ReactNode, RefObject } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { tv } from "../../lib/tv";
import { useMergedRef } from "../../lib/use-merged-ref";
import { Button } from "../button/button";
import type { ButtonProps } from "../button/button";
import { PopoverArrow, PopoverContent } from "../popover/popover";
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
   * What this stop is about. While the stop is open its target holds the
   * Located wash (`data-located="held"`); pass the whole row for a list row.
   */
  anchor: Anchor;
  /** Whether the stop is showing. @default true */
  open?: boolean;
  /**
   * Called when Esc is pressed while focus is in the bubble: the person
   * ended the tour. Skip and Done are the product's own buttons and call
   * its own handlers. A press outside and focus leaving never close it.
   */
  onDismiss?: () => void;
  children?: ReactNode;
};

/**
 * One stop of a tour: a non-modal popover anchored to its target, which
 * holds the Located wash while the stop is open
 * (design/patterns/coach-marks.md). The product owns the tour: which stop is
 * open, the copy, and where focus goes when it ends.
 */
export function CoachMark({ anchor, open = true, onDismiss, children }: CoachMarkProps) {
  const popupRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  // The held wash on the target, put back as it was when the stop closes or
  // moves to another target.
  useEffect(() => {
    if (!open) return;
    const target = anchorElement(anchor);
    if (!target) return;
    const before = target.getAttribute("data-located");
    target.setAttribute("data-located", "held");
    return () => {
      if (target.getAttribute("data-located") !== "held") return;
      if (before === null) target.removeAttribute("data-located");
      else target.setAttribute("data-located", before);
    };
  }, [anchor, open]);

  const handleOpenChange = useCallback<NonNullable<BasePopover.Root.Props["onOpenChange"]>>(
    (nextOpen, details) => {
      if (nextOpen || details.reason !== "escape-key") return;
      const target = details.event?.target;
      if (target instanceof Node && popupRef.current?.contains(target)) onDismiss?.();
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

/** Whether focus is in a field outside the bubble: the person is typing. */
function isTypingOutside(popup: Element | null): boolean {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || popup?.contains(active)) return false;
  return (
    active.isContentEditable ||
    active instanceof HTMLTextAreaElement ||
    (active instanceof HTMLInputElement &&
      !["button", "checkbox", "radio", "submit", "reset"].includes(active.type)) ||
    active.getAttribute("role") === "textbox"
  );
}

export type CoachMarkContentProps = Omit<
  PopoverContentProps,
  "anchor" | "size" | "initialFocus" | "finalFocus"
>;

/**
 * The bubble: 300px, 8px from its target, with an arrow on whichever side
 * it opens. When a stop opens (or moves to the next target) focus goes to
 * `CoachMarkNext`, unless the person is typing in a field.
 */
export function CoachMarkContent({
  side = "bottom",
  sideOffset = 8,
  align = "center",
  className,
  children,
  ref,
  ...props
}: CoachMarkContentProps) {
  const { anchor, popupRef, nextRef } = useCoachMarkContext("CoachMarkContent");
  const { content } = coachMark();
  const target = anchorElement(anchor);
  const [setRef] = useMergedRef(popupRef, ref);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (isTypingOutside(popupRef.current)) return;
      nextRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [target, popupRef, nextRef]);

  return (
    <PopoverContent
      data-slot="coach-mark-content"
      anchor={anchor ?? undefined}
      side={side}
      sideOffset={sideOffset}
      align={align}
      initialFocus={false}
      finalFocus={false}
      className={content({ className })}
      ref={setRef}
      {...props}
    >
      {children}
      <PopoverArrow />
    </PopoverContent>
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
