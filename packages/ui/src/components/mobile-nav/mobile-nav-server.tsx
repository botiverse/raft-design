import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentPropsWithRef, MouseEvent, PointerEvent, Ref } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { TOUCH_DRAG_HOLD_MS, TOUCH_DRAG_TOLERANCE_PX } from "../../lib/touch-drag";
import { tv } from "../../lib/tv";
import { PopoverContent } from "../popover/popover";
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
      "max-h-[min(60dvh,calc(var(--available-height)-env(safe-area-inset-top,0px)))]",
    ],
    list: ["flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-1"],
    group: ["flex shrink-0 flex-col p-1"],
    row: [
      "flex w-full shrink-0 cursor-default select-none items-center",
      "text-left outline-none transition-colors",
      "min-h-option gap-2.5 rounded-chip px-2.5 py-option-inset",
      "font-sans text-callout font-medium text-foreground",
      "hover:bg-brand-soft active:bg-brand-soft focus-visible:bg-brand-soft",
      "aria-[current=true]:font-bold",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
      "[&>svg]:text-foreground-muted",
      "*:data-[slot=avatar]:size-5 *:data-[slot=avatar]:shrink-0",
    ],
    rowLabel: ["min-w-0 flex-1 truncate"],
    destinations: ["grid shrink-0 grid-flow-col auto-cols-fr gap-1 p-1"],
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
 * as tall as its content and at most 60% of the screen. It stops below the
 * top safe area (a notch in a standalone web app): Base UI's collision padding
 * takes only pixels, so the height cap subtracts `env(safe-area-inset-top)`.
 * The bottom needs none: the tab bar under the popover already pads the
 * bottom safe area. A column:
 * `MobileNavServerPopoverList` takes the room left and scrolls, and the
 * destinations and the footer after it stay in view.
 */
export function MobileNavServerPopoverContent({
  anchor,
  side = "top",
  align = "center",
  sideOffset = 8,
  collisionPadding = 8,
  className,
  ...props
}: MobileNavServerPopoverContentProps) {
  const { triggerRef } = useMobileNavServerContext("MobileNavServerPopoverContent");
  const { content } = mobileNavServer();
  const tabBar = useCallback(() => {
    const trigger = triggerRef.current;
    return trigger?.closest("[data-slot=mobile-nav-root]") ?? trigger;
  }, [triggerRef]);

  return (
    <PopoverContent
      data-slot="mobile-nav-server-popover-content"
      anchor={anchor ?? tabBar}
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={content({ className })}
      {...props}
    />
  );
}

export type MobileNavServerPopoverListProps = ComponentPropsWithRef<"div">;

/** The server list: takes the room left in the popover and scrolls inside it. */
export function MobileNavServerPopoverList({
  className,
  ...props
}: MobileNavServerPopoverListProps) {
  const { list } = mobileNavServer();
  return (
    <div data-slot="mobile-nav-server-popover-list" className={list({ className })} {...props} />
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
 * One line at the option height of every popup list (`min-h-option`, 36px):
 * a 20px avatar or a 16px icon, `MobileNavServerPopoverRowLabel`, then anything
 * trailing (a check, a count). `aria-current="true"` marks the current server
 * in bold.
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

/** The server's own pages, side by side in equal cells; a `group`, named with `aria-label`. */
export function MobileNavServerPopoverDestinations({
  className,
  ...props
}: MobileNavServerPopoverDestinationsProps) {
  const { destinations } = mobileNavServer();
  return (
    <div
      role="group"
      data-slot="mobile-nav-server-popover-destinations"
      className={destinations({ className })}
      {...props}
    />
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

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
