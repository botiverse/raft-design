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
import type { MouseEvent, PointerEvent, Ref } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { TOUCH_DRAG_HOLD_MS, TOUCH_DRAG_TOLERANCE_PX } from "../../lib/touch-drag";
import { tv } from "../../lib/tv";
import { PopoverContent } from "../popover/popover";
import type { PopoverContentProps, PopoverProps } from "../popover/popover";
import { MobileNavItem } from "./mobile-nav";
import type { MobileNavItemProps } from "./mobile-nav";

// Raft Design System › Navigation › Servers: on a phone the last tab is the
// current server. It is the one tab that opens a menu, not a page: a press or
// a long press opens a popover that rises above the tab bar, 8px from each
// side. The menu's rows (the server list, the server's own pages, the footer
// actions) are the product's, passed as children.

const mobileNavServer = tv({
  slots: {
    item: [
      "select-none [-webkit-touch-callout:none]",
      "*:data-[slot=avatar]:size-[22px]",
      "data-popup-open:before:bg-fill-medium",
    ],
    content: ["flex flex-col", "w-[calc(var(--anchor-width)-16px)] min-w-0"],
  },
});

type MobileNavServerContextValue = {
  handle: BasePopover.Handle<unknown>;
  triggerRef: { current: HTMLElement | null };
};

const MobileNavServerContext = createContext<MobileNavServerContextValue | null>(null);

function useMobileNavServerContext(part: string) {
  const context = use(MobileNavServerContext);
  if (!context) throw new Error(`${part} must be inside MobileNavServerMenu`);
  return context;
}

export type MobileNavServerMenuProps = Omit<PopoverProps, "handle">;

/** The root: owns the menu's open state, like `Popover` (`open`, `onOpenChange`). */
export function MobileNavServerMenu(props: MobileNavServerMenuProps) {
  const [handle] = useState(() => BasePopover.createHandle<unknown>());
  const triggerRef = useRef<HTMLElement | null>(null);
  const context = useMemo(() => ({ handle, triggerRef }), [handle]);

  return (
    <MobileNavServerContext value={context}>
      <BasePopover.Root data-slot="mobile-nav-server-menu" handle={handle} {...props} />
    </MobileNavServerContext>
  );
}

export type MobileNavServerItemProps = Omit<
  MobileNavItemProps,
  "selected" | "render" | "nativeButton"
>;

/**
 * The tab: the server's avatar and its name in `MobileNavLabel`, as children.
 * A press opens the menu, and so does holding it for 500ms (the long press of
 * raft-ui's menus). Lifting the finger after the hold leaves the menu open:
 * Base UI keeps a popover it did not open on a click (stickIfOpen) through the
 * click that ends the hold.
 * It is never `selected`: it holds no page.
 */
export function MobileNavServerItem({
  className,
  id,
  ref,
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
      if (event.button !== 0) return;
      holdStart.current = { x: event.clientX, y: event.clientY };
      holdTimer.current = setTimeout(() => {
        holdTimer.current = undefined;
        handle.open(triggerId);
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
      onContextMenu={handleContextMenu}
      {...props}
    />
  );
}

export type MobileNavServerMenuContentProps = PopoverContentProps;

/**
 * The menu: a popover above the tab bar, 8px from each side of it and 8px
 * above it, as tall as the content up to the top of the window. A column, so
 * a scrolling list can take the room and the footer actions stay in view.
 */
export function MobileNavServerMenuContent({
  anchor,
  side = "top",
  align = "center",
  sideOffset = 8,
  collisionPadding = 8,
  className,
  ...props
}: MobileNavServerMenuContentProps) {
  const { triggerRef } = useMobileNavServerContext("MobileNavServerMenuContent");
  const { content } = mobileNavServer();
  const tabBar = useCallback(() => {
    const trigger = triggerRef.current;
    return trigger?.closest("[data-slot=mobile-nav-root]") ?? trigger;
  }, [triggerRef]);

  return (
    <PopoverContent
      data-slot="mobile-nav-server-menu-content"
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

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
