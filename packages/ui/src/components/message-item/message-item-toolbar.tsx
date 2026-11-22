import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import type { SlotElementProps } from "../../lib/data-attributes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useInsideTooltipTrigger,
} from "../tooltip/tooltip";
import { messageItem } from "./message-item.recipe";

export type MessageItemToolbarProps = useRender.ComponentProps<"div">;

const TOOLBAR_WIDTH = "--mi-toolbar-width";
/**
 * Five buttons' width (5 × 28px, 4 × 4px apart, 4px from the frame each
 * side): what the row fades until the toolbar has measured itself.
 */
const FALLBACK_WIDTH = "164px";

/**
 * Toolbars watched while their row shows them, each with its row, and the one
 * ResizeObserver that watches them: it exists only while a toolbar shows.
 */
const watched = new Map<HTMLElement, HTMLElement>();
let resizeObserver: ResizeObserver | null = null;

function writeWidth(toolbar: HTMLElement, row: HTMLElement) {
  row.style.setProperty(TOOLBAR_WIDTH, `${toolbar.offsetWidth}px`);
}

/** The recipe's has-data-popup-open / data-popup-open on the row. */
function hasOpenPopup(row: HTMLElement) {
  return row.hasAttribute("data-popup-open") || row.querySelector("[data-popup-open]") !== null;
}

function resized(entries: ResizeObserverEntry[]) {
  for (const entry of entries) {
    const target = entry.target as HTMLElement;
    const row = watched.get(target);
    if (row) writeWidth(target, row);
  }
}

function unwatch(toolbar: HTMLElement) {
  if (!watched.delete(toolbar)) return;
  resizeObserver?.unobserve(toolbar);
  if (watched.size > 0) return;
  resizeObserver?.disconnect();
  resizeObserver = null;
}

function watch(toolbar: HTMLElement, row: HTMLElement) {
  // Already watched: the observer has kept the width current.
  if (watched.has(toolbar)) return;
  writeWidth(toolbar, row);
  if (typeof ResizeObserver === "undefined") return;
  // A row whose popup closed while the pointer and focus were elsewhere sent
  // no leave event; let go of it here, so only showing toolbars are watched.
  for (const [other, otherRow] of watched) {
    if (!otherRow.matches(":hover, :focus-within") && !hasOpenPopup(otherRow)) unwatch(other);
  }
  resizeObserver ??= new ResizeObserver(resized);
  watched.set(toolbar, row);
  resizeObserver.observe(toolbar);
}

/**
 * Tells the row how wide the toolbar is (`--mi-toolbar-width` on the row), so
 * the header can fade out its end under the toolbar while it shows: the
 * header keeps no room for the toolbar (message-item.md, "The hover
 * toolbar"), and the toolbar's card only reaches part of the sender line.
 * A toolbar with more or fewer actions covers exactly its own width; nothing
 * on the row moves.
 *
 * Measured when the toolbar is about to show, not when it mounts: every row
 * of a timeline renders a toolbar, and the width matters only on the row the
 * pointer or focus is on. So mounting costs no React state (one commit per
 * row) and no ResizeObserver per row. The row's `pointerenter` and `focusin`
 * write the width in the input event's own task, before the frame that
 * applies the row's :hover / :focus-within styles, so the first frame that
 * shows the toolbar already masks its width; the toolbar is laid out at rest
 * (only its opacity is 0), so its `offsetWidth` is right then. A popup opens
 * from the toolbar only after a hover or a focus, so it finds the width
 * written. While the row shows the toolbar, one ResizeObserver shared by all
 * rows watches it, so a button added while it shows re-measures; it lets go
 * when the pointer and focus have left the row and no popup is open, and is
 * disconnected once no toolbar shows.
 *
 * On attach the row gets five buttons' width (164px) as a fallback: a plain
 * DOM write, no commit and no read, so a show that ever came without a
 * pointerenter or focusin (a row that appears under a resting pointer) fades
 * too much rather than leaving letters beside the card. Rows without a
 * toolbar never get the property, so their header's gradient stays invalid
 * and masks nothing.
 *
 * A stable callback ref with a cleanup (React 19), merged with the caller's
 * ref by `useRender`.
 */
function measureWidthOnShow(toolbar: HTMLElement | null) {
  const row = toolbar?.closest<HTMLElement>("[data-message-item]");
  if (!toolbar || !row) return undefined;
  const show = () => watch(toolbar, row);
  const pointerLeft = () => {
    if (!row.matches(":focus-within") && !hasOpenPopup(row)) unwatch(toolbar);
  };
  const focusLeft = (event: FocusEvent) => {
    const next = event.relatedTarget instanceof Node ? event.relatedTarget : null;
    if (row.contains(next) || row.matches(":hover") || hasOpenPopup(row)) return;
    unwatch(toolbar);
  };
  row.style.setProperty(TOOLBAR_WIDTH, FALLBACK_WIDTH);
  row.addEventListener("pointerenter", show);
  row.addEventListener("focusin", show);
  row.addEventListener("pointerleave", pointerLeft);
  row.addEventListener("focusout", focusLeft);
  return () => {
    row.removeEventListener("pointerenter", show);
    row.removeEventListener("focusin", show);
    row.removeEventListener("pointerleave", pointerLeft);
    row.removeEventListener("focusout", focusLeft);
    unwatch(toolbar);
    row.style.removeProperty(TOOLBAR_WIDTH);
  };
}

export function MessageItemToolbar({ className, render, ref, ...props }: MessageItemToolbarProps) {
  const { toolbar } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref: ref ? [ref, measureWidthOnShow] : measureWidthOnShow,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-toolbar",
    },
  });
}

export type MessageItemToolbarButtonProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
  /**
   * What its tooltip says: its `aria-label` by default. `false` leaves the
   * tooltip out, for a caller that shows one of its own.
   */
  tooltip?: ReactNode;
  /** The shortcut after the name in its tooltip: a `KbdShortcut` at `sm`. */
  shortcut?: ReactNode;
};

/**
 * An icon-only button of the hover toolbar. It shows its `aria-label` as a
 * tooltip on hover and on keyboard focus, with `shortcut` after it; a tap
 * shows none. Rendered as a caller's own `TooltipTrigger`, it adds none.
 *
 * A tap or a click focuses it without `:focus-visible`, so no tooltip opens
 * on a touch screen (button.md, "Accessibility"). Inside a caller's
 * `TooltipTrigger` (`useInsideTooltipTrigger`) the element would otherwise be
 * the trigger of two tooltips at once.
 *
 * The open tooltip doesn't mark the button `data-popup-open`: that attribute
 * says a menu or a picker from the toolbar is open, which keeps the toolbar
 * shown and the row filled after the pointer leaves (the recipe's
 * has-data-popup-open, and `hasOpenPopup` above). A tooltip closes as the
 * pointer leaves, so it must not hold the toolbar. A `data-popup-open` the
 * caller's own trigger passes in (a menu opened from the button) stays.
 */
export function MessageItemToolbarButton({
  active = false,
  className,
  render,
  tooltip,
  shortcut,
  ...props
}: MessageItemToolbarButtonProps) {
  const { toolbarButton } = messageItem();
  const insideTooltipTrigger = useInsideTooltipTrigger();
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-active": active ? "true" : undefined,
    className: toolbarButton({ className }),
  };

  const element = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-item-toolbar-button",
    },
  });

  const label = tooltip === undefined ? props["aria-label"] : tooltip;
  if (insideTooltipTrigger || label === false || label == null || label === "") return element;

  const popupOpen = (props as { "data-popup-open"?: string })["data-popup-open"];
  return (
    <Tooltip>
      <TooltipTrigger render={element} data-popup-open={popupOpen} />
      <TooltipContent>
        {label}
        {shortcut}
      </TooltipContent>
    </Tooltip>
  );
}
