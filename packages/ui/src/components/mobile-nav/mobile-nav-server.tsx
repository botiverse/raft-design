import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentPropsWithRef, MouseEvent, PointerEvent, ReactNode, Ref } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { TOUCH_DRAG_HOLD_MS, TOUCH_DRAG_TOLERANCE_PX } from "../../lib/touch-drag";
import { tv } from "../../lib/tv";
import { PopoverContent } from "../popover/popover";
import { ScrollArea } from "../scroll-area/scroll-area";
import { scrollToElement } from "../scroll-area/scroll-to-element";
import type { ScrollAreaProps } from "../scroll-area/types";
import type { PopoverContentProps, PopoverProps } from "../popover/popover";
import { MobileNavItem } from "./mobile-nav";
import type { MobileNavItemProps } from "./mobile-nav";

// Raft Design System › Navigation › Servers: on a phone the last tab is the
// current server. It is the one tab that opens a popover, not a page: a press
// or a long press opens it above the tab bar, 8px from each side. Its rows
// (the server list, the server's own pages, the footer actions) are the
// product's, passed as children. It is a popover (a `dialog`), not an ARIA
// menu: its rows are buttons reached with Tab, with no arrow-key roving.

const mobileNavServer = tv({
  slots: {
    item: [
      "select-none [-webkit-touch-callout:none]",
      "*:data-[slot=avatar]:size-[22px]",
      "data-popup-open:before:bg-fill-medium",
    ],
    content: [
      "flex flex-col",
      "w-[calc(var(--anchor-width)-16px)] min-w-0",
      // 60% of the screen, or the floor (one whole server row plus the parts
      // after the list) where that is taller; never past the room there is,
      // where the whole popover scrolls instead.
      "max-h-[min(max(60dvh,var(--mobile-nav-server-popover-floor,0px)),calc(var(--available-height)-env(safe-area-inset-top,0px)))]",
    ],
    // The popover's parts in a ScrollArea that shrinks to the popover: it
    // scrolls only when even the floor doesn't fit (a column with no gap, so
    // its gutters move nothing).
    scroll: ["flex min-h-0 flex-col"],
    // At least one whole two-line server row (the option height plus the
    // slug's line) and the list's own padding.
    list: [
      "flex min-h-[calc(var(--spacing-option)+var(--text-mono-meta--line-height)+(--spacing(2)))] flex-1 flex-col p-1",
    ],
    group: ["flex shrink-0 flex-col p-1"],
    row: [
      "flex w-full shrink-0 cursor-default select-none items-center",
      "text-left outline-none transition-colors",
      "min-h-option gap-2.5 rounded-chip px-2.5 py-option-inset",
      "font-sans text-callout font-medium text-foreground",
      "hover:bg-brand-soft active:bg-brand-soft focus-visible:bg-brand-soft",
      "aria-current:font-bold",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
      "[&>svg]:text-foreground-muted",
      "*:data-[slot=avatar]:size-5 *:data-[slot=avatar]:shrink-0",
    ],
    rowLabel: ["min-w-0 flex-1 truncate"],
    rowBody: ["flex min-w-0 flex-1 flex-col"],
    rowDescription: [
      "min-w-0 truncate",
      "font-mono text-mono-meta font-normal text-foreground-hint",
    ],
    destinations: [
      "grid shrink-0 grid-flow-col auto-cols-fr gap-1 p-1",
      "data-[layout=grid]:grid-flow-row data-[layout=grid]:grid-cols-3",
    ],
    destination: [
      "relative flex min-w-0 cursor-default select-none flex-col items-center justify-center",
      "outline-none transition-colors",
      "gap-1 rounded-chip px-1 py-2",
      "font-sans text-footnote font-medium text-foreground",
      "hover:bg-brand-soft active:bg-brand-soft focus-visible:bg-brand-soft",
      "[&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-foreground-muted",
      "[&>span]:max-w-full [&>span]:truncate",
      "*:data-[slot=status]:absolute *:data-[slot=status]:top-1 *:data-[slot=status]:left-[calc(50%+6px)]",
    ],
  },
});

type MobileNavServerContextValue = {
  handle: BasePopover.Handle<unknown>;
  triggerRef: { current: HTMLElement | null };
};

const MobileNavServerContext = createContext<MobileNavServerContextValue | null>(null);

function useMobileNavServerContext(part: string) {
  const context = use(MobileNavServerContext);
  if (!context) throw new Error(`${part} must be inside MobileNavServerPopover`);
  return context;
}

export type MobileNavServerPopoverProps = Omit<PopoverProps, "handle">;

/** The root: owns the popover's open state, like `Popover` (`open`, `onOpenChange`). */
export function MobileNavServerPopover(props: MobileNavServerPopoverProps) {
  const [handle] = useState(() => BasePopover.createHandle<unknown>());
  const triggerRef = useRef<HTMLElement | null>(null);
  const context = useMemo(() => ({ handle, triggerRef }), [handle]);

  return (
    <MobileNavServerContext value={context}>
      <BasePopover.Root data-slot="mobile-nav-server-popover" handle={handle} {...props} />
    </MobileNavServerContext>
  );
}

export type MobileNavServerItemProps = Omit<
  MobileNavItemProps,
  "selected" | "render" | "nativeButton"
>;

/**
 * The tab: the server's avatar and its name in `MobileNavLabel`, as children.
 * A press opens the popover, and so does holding it for 500ms (the long press
 * of raft-ui's menus). Lifting the finger after a hold never closes it: the
 * click that ends the hold is not a press, whether the hold opened the
 * popover or found it open.
 * It is never `selected`: it holds no page.
 */
export function MobileNavServerItem({
  className,
  id,
  ref,
  onClick,
  onContextMenu,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  ...props
}: MobileNavServerItemProps) {
  const { handle, triggerRef } = useMobileNavServerContext("MobileNavServerItem");
  const { item } = mobileNavServer();
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const holdStart = useRef<{ x: number; y: number } | null>(null);
  const held = useRef(false);

  const cancelHold = useCallback(() => {
    clearTimeout(holdTimer.current);
    holdTimer.current = undefined;
    holdStart.current = null;
  }, []);

  useEffect(() => cancelHold, [cancelHold]);

  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      assignRef(ref, node);
    },
    [ref, triggerRef],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);
      cancelHold();
      held.current = false;
      if (event.button !== 0) return;
      holdStart.current = { x: event.clientX, y: event.clientY };
      holdTimer.current = setTimeout(() => {
        holdTimer.current = undefined;
        held.current = true;
        if (!handle.isOpen) handle.open(triggerId);
      }, TOUCH_DRAG_HOLD_MS);
    },
    [cancelHold, handle, onPointerDown, triggerId],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      onPointerMove?.(event);
      const start = holdStart.current;
      if (!start) return;
      const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (moved > TOUCH_DRAG_TOLERANCE_PX) cancelHold();
    },
    [cancelHold, onPointerMove],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      onPointerUp?.(event);
      cancelHold();
    },
    [cancelHold, onPointerUp],
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      onPointerCancel?.(event);
      cancelHold();
    },
    [cancelHold, onPointerCancel],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      onPointerLeave?.(event);
      cancelHold();
    },
    [cancelHold, onPointerLeave],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement> & { preventBaseUIHandler?: () => void }) => {
      onClick?.(event);
      if (!held.current) return;
      // The click that ends a hold: Base UI would read it as a press and
      // close a popover that was already open when the hold began.
      held.current = false;
      event.preventBaseUIHandler?.();
    },
    [onClick],
  );

  const handleContextMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onContextMenu?.(event);
      event.preventDefault();
    },
    [onContextMenu],
  );

  return (
    <BasePopover.Trigger
      handle={handle}
      id={triggerId}
      ref={setRef}
      render={<MobileNavItem />}
      data-slot="mobile-nav-server-item"
      className={item({ className })}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      {...props}
    />
  );
}

export type MobileNavServerPopoverContentProps = PopoverContentProps;

/**
 * The popover above the tab bar, 8px from each side of it and 8px above it,
 * as tall as its content and at most 60% of the screen. The one exception:
 * the list always keeps one whole server row, so where the parts after it
 * leave less, the popover grows past 60% as far as that row needs (the
 * floor, measured from its children into `--mobile-nav-server-popover-floor`).
 * Where even that doesn't fit, the whole popover scrolls, the footer and the
 * pages with it: the children sit in a ScrollArea
 * (`data-slot="mobile-nav-server-popover-scroll"`) inside the popup. It stops below the top safe area (a notch in a standalone
 * web app): Base UI's collision padding takes only pixels, so the height cap
 * subtracts `env(safe-area-inset-top)`. The bottom needs none: the tab bar
 * under the popover already pads the bottom safe area. A column:
 * `MobileNavServerPopoverList` takes the room left and scrolls, and the
 * destinations and the footer after it stay in view.
 *
 * Focus on open goes to the current server's row (`aria-current="true"` in
 * the list), which the list has already scrolled into view, so focusing it
 * never scrolls the list back to the top. A touch opens it with focus on the
 * popover itself, without scrolling, so no keyboard comes up. `initialFocus`
 * overrides this.
 */
export function MobileNavServerPopoverContent({
  anchor,
  side = "top",
  align = "center",
  sideOffset = 8,
  collisionPadding = 8,
  initialFocus,
  className,
  children,
  ref,
  ...props
}: MobileNavServerPopoverContentProps) {
  const { triggerRef } = useMobileNavServerContext("MobileNavServerPopoverContent");
  const { content, scroll } = mobileNavServer();
  const popupRef = useRef<HTMLDivElement | null>(null);
  const tabBar = useCallback(() => {
    const trigger = triggerRef.current;
    return trigger?.closest("[data-slot=mobile-nav-root]") ?? trigger;
  }, [triggerRef]);
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      popupRef.current = node;
      assignRef(ref, node);
      if (!node) return;
      return () => {
        popupRef.current = null;
        assignRef(ref, null);
      };
    },
    [ref],
  );
  const setScrollRef = useCallback((node: HTMLDivElement | null) => {
    if (node) return keepOneRow(node);
  }, []);
  // The default would focus the first row, and focusing it scrolls the list
  // back to the top, away from the current server.
  const focusCurrent = useCallback((openType: string) => {
    if (openType === "touch") return true;
    return popupRef.current?.querySelector<HTMLElement>(CURRENT_ROW) ?? true;
  }, []);

  return (
    <PopoverContent
      data-slot="mobile-nav-server-popover-content"
      anchor={anchor ?? tabBar}
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      initialFocus={initialFocus ?? focusCurrent}
      className={content({ className })}
      ref={setRef}
      {...props}
    >
      <ScrollArea
        data-slot="mobile-nav-server-popover-scroll"
        overscroll="contain"
        // No Tab stop of its own: every row takes focus and scrolls into view.
        tabIndex={-1}
        ref={setScrollRef}
        className={scroll()}
      >
        {children}
      </ScrollArea>
    </PopoverContent>
  );
}

const LIST_SLOT = "mobile-nav-server-popover-list";
const CURRENT_ROW = `[data-slot=${LIST_SLOT}] [aria-current="true"]`;

const GUTTERS_SLOT = "scroll-area-gutters";

/** Padding and border along the block axis. */
function blockFrame(element: HTMLElement) {
  const style = getComputedStyle(element);
  return (
    parseFloat(style.paddingTop) +
    parseFloat(style.paddingBottom) +
    parseFloat(style.borderTopWidth) +
    parseFloat(style.borderBottomWidth)
  );
}

/**
 * Writes the popover's floor onto the popup, its height with the list at its
 * one-row minimum: the list's `min-height` plus the height of every other
 * part in the scroll area, and the popup's and the area's own padding and
 * border. Watched as the parts change.
 */
function keepOneRow(area: HTMLElement) {
  const popup = area.parentElement;
  const measure = () => {
    if (!popup) return;
    let floor = blockFrame(popup) + blockFrame(area);
    for (const child of area.children) {
      if (!(child instanceof HTMLElement) || child.dataset.slot === GUTTERS_SLOT) continue;
      const style = getComputedStyle(child);
      if (style.display === "none" || style.position === "absolute" || style.position === "fixed")
        continue;
      floor += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      floor +=
        child.dataset.slot === LIST_SLOT
          ? parseFloat(style.minHeight) || 0
          : child.getBoundingClientRect().height;
    }
    popup.style.setProperty("--mobile-nav-server-popover-floor", `${floor}px`);
  };
  // The list's own size follows the floor, so it is not watched.
  const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
  const watch = () => {
    resize?.disconnect();
    for (const child of area.children) {
      if (child instanceof HTMLElement && child.dataset.slot !== LIST_SLOT) resize?.observe(child);
    }
    measure();
  };
  const mutation = new MutationObserver(watch);
  mutation.observe(area, { childList: true });
  watch();
  return () => {
    resize?.disconnect();
    mutation.disconnect();
  };
}

/**
 * Opens the list on the current server: scrolls it, and only it, to the row
 * with `aria-current="true"` at once, with no animation, and again as the
 * list takes its final size, until people scroll or press in it themselves.
 */
function openOnCurrent(list: HTMLElement) {
  let pinned = true;
  const show = () => {
    if (!pinned) return;
    const current = list.querySelector('[aria-current="true"]');
    if (!current) return;
    const offset = parseFloat(getComputedStyle(list).paddingBottom) || 0;
    scrollToElement(list, current, "vertical", { block: "nearest", offset });
  };
  const release = () => {
    pinned = false;
  };
  const events = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
  for (const type of events) list.addEventListener(type, release, { passive: true });
  const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(show);
  resize?.observe(list);
  show();
  return () => {
    resize?.disconnect();
    for (const type of events) list.removeEventListener(type, release);
  };
}

export type MobileNavServerPopoverListProps = ScrollAreaProps;

/** The server list: takes the room left in the popover and scrolls inside it,
 *  a ScrollArea (a column with no gap, so its gutters move nothing). It is
 *  never shorter than one whole two-line row, and it opens scrolled to the
 *  current server's row (`aria-current="true"`), with no animation. */
export function MobileNavServerPopoverList({
  className,
  ref,
  ...props
}: MobileNavServerPopoverListProps) {
  const { list } = mobileNavServer();
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      assignRef(ref, node);
      if (!node) return;
      const stop = openOnCurrent(node);
      return () => {
        stop();
        assignRef(ref, null);
      };
    },
    [ref],
  );
  return (
    <ScrollArea
      data-slot="mobile-nav-server-popover-list"
      ref={setRef}
      overscroll="contain"
      // No Tab stop of its own: every row takes focus and scrolls into view.
      tabIndex={-1}
      {...props}
      className={list({ className })}
    />
  );
}

export type MobileNavServerPopoverGroupProps = ComponentPropsWithRef<"div">;

/** Rows that always stay in view, such as the footer actions. */
export function MobileNavServerPopoverGroup({
  className,
  ...props
}: MobileNavServerPopoverGroupProps) {
  const { group } = mobileNavServer();
  return (
    <div data-slot="mobile-nav-server-popover-group" className={group({ className })} {...props} />
  );
}

export type MobileNavServerPopoverRowProps = ComponentPropsWithRef<"button">;

/**
 * One row at the option height of every popup list (`py-option-inset`, 36px
 * for one line; a second line adds its own height and nothing else): a 20px
 * avatar or a 16px icon, `MobileNavServerPopoverRowLabel` (or a
 * `MobileNavServerPopoverRowBody` with a description under the label), then
 * anything trailing (a check, a count), centered on the row.
 * `aria-current="true"` marks the current server in bold.
 */
export function MobileNavServerPopoverRow({
  className,
  type = "button",
  ...props
}: MobileNavServerPopoverRowProps) {
  const { row } = mobileNavServer();
  return (
    <button
      type={type}
      data-slot="mobile-nav-server-popover-row"
      className={row({ className })}
      {...props}
    />
  );
}

export type MobileNavServerPopoverRowLabelProps = ComponentPropsWithRef<"span">;

/** A row's label: takes the room and truncates. */
export function MobileNavServerPopoverRowLabel({
  className,
  ...props
}: MobileNavServerPopoverRowLabelProps) {
  const { rowLabel } = mobileNavServer();
  return (
    <span
      data-slot="mobile-nav-server-popover-row-label"
      className={rowLabel({ className })}
      {...props}
    />
  );
}

export type MobileNavServerPopoverDestinationsProps = ComponentPropsWithRef<"div">;

/** Past this many pages, the row becomes a grid of 3 columns. */
const DESTINATIONS_IN_ONE_ROW = 4;

/**
 * The server's own pages in equal cells; a `group`, named with `aria-label`.
 * Up to 4 sit side by side in one row (`data-layout="row"`). More than 4
 * take 3 columns, rows of 3 with the last row starting at the left
 * (`data-layout="grid"`), so each label keeps a third of the popover and
 * stays whole in every language. The count is of the element children, taken
 * in React, looking inside fragments (a product puts the pages a guest lacks
 * in one): counting them in CSS would take a structural pseudo-class on the
 * children, which the WebKit selector rules in CLAUDE.md forbid.
 */
export function MobileNavServerPopoverDestinations({
  className,
  children,
  ...props
}: MobileNavServerPopoverDestinationsProps) {
  const { destinations } = mobileNavServer();
  const count = countElements(children);
  return (
    <div
      role="group"
      data-slot="mobile-nav-server-popover-destinations"
      data-layout={count > DESTINATIONS_IN_ONE_ROW ? "grid" : "row"}
      className={destinations({ className })}
      {...props}
    >
      {children}
    </div>
  );
}

export type MobileNavServerPopoverDestinationProps = ComponentPropsWithRef<"button">;

/**
 * One of the server's pages: a 20px icon over a short label in a `span`, which
 * truncates. Something new on that page (a feedback reply, a computer that
 * needs attention) is an `accent` `Status` child, the attention dot at the
 * icon's top-right corner: the server tab's avatar never carries it.
 */
export function MobileNavServerPopoverDestination({
  className,
  type = "button",
  ...props
}: MobileNavServerPopoverDestinationProps) {
  const { destination } = mobileNavServer();
  return (
    <button
      type={type}
      data-slot="mobile-nav-server-popover-destination"
      className={destination({ className })}
      {...props}
    />
  );
}

export type MobileNavServerPopoverRowBodyProps = ComponentPropsWithRef<"span">;

/**
 * The text of a two-line row: `MobileNavServerPopoverRowLabel`, then
 * `MobileNavServerPopoverRowDescription` under it. The second line adds its
 * own height and nothing else; the avatar and the trailing check or count
 * center on both lines.
 */
export function MobileNavServerPopoverRowBody({
  className,
  ...props
}: MobileNavServerPopoverRowBodyProps) {
  const { rowBody } = mobileNavServer();
  return (
    <span
      data-slot="mobile-nav-server-popover-row-body"
      className={rowBody({ className })}
      {...props}
    />
  );
}

export type MobileNavServerPopoverRowDescriptionProps = ComponentPropsWithRef<"span">;

/** A row's second line, such as a server's address: muted Space Mono; truncates. */
export function MobileNavServerPopoverRowDescription({
  className,
  ...props
}: MobileNavServerPopoverRowDescriptionProps) {
  const { rowDescription } = mobileNavServer();
  return (
    <span
      data-slot="mobile-nav-server-popover-row-description"
      className={rowDescription({ className })}
      {...props}
    />
  );
}

/** The element children, counting a fragment's elements rather than the fragment. */
function countElements(children: ReactNode): number {
  let count = 0;
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    count +=
      child.type === Fragment
        ? countElements((child.props as { children?: ReactNode }).children)
        : 1;
  }
  return count;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
