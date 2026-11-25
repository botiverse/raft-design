import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentProps, ReactNode } from "react";
import { BASE_COLLISION_PADDING, usePopupCollision } from "../../lib/frame-insets";
import {
  PopupAnchorCloseProvider,
  usePopupAnchorDismiss,
  usePopupCloseAction,
} from "../../lib/popup-anchor-dismiss";
import { tv } from "../../lib/tv";
import { useMergedRef } from "../../lib/use-merged-ref";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { usePortalContainerProps } from "../../lib/portal-container";
import { isInlinePart } from "../../lib/inline-part";
import { useTooltipTouch } from "./tooltip-touch";

const tooltip = tv({
  slots: {
    trigger: ["select-none"],
    positioner: [
      "isolate z-popup pointer-events-none outline-none",
      "data-anchor-hidden:invisible",
    ],
    content: [
      "pointer-events-none relative inline-block max-w-[min(20rem,var(--available-width,20rem))] min-w-0 px-2.5 py-1",
      "origin-(--transform-origin) outline-none",
      "transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-starting-style:scale-[0.97] data-starting-style:opacity-0",
      "data-ending-style:scale-[0.99] data-ending-style:opacity-0",
      "data-instant:transition-none",
      "motion-reduce:transition-none",
      "rounded-chip bg-layer-hud text-foreground-on-hud",
      "font-sans font-medium",
      "shadow-float",
      "has-data-[slot=kbd]:py-1 has-data-[slot=kbd]:pr-2.5",
    ],
    body: [
      "block min-w-0 text-footnote whitespace-normal wrap-break-word",
      "**:data-[slot=kbd]:relative **:data-[slot=kbd]:z-raised **:data-[slot=kbd]:ml-1.5",
      "**:data-[slot=kbd-group]:ml-1.5 [&_[data-slot=kbd-group]_[data-slot=kbd]]:ml-0",
      "**:data-[slot=kbd]:h-4 **:data-[slot=kbd]:min-w-4 **:data-[slot=kbd]:px-1 **:data-[slot=kbd]:py-0",
      "[&_[data-slot=kbd][data-glyph=icon]]:px-0",
      "**:data-[slot=kbd]:text-[12px]/4 **:data-[slot=kbd]:font-normal",
    ],
    bodyIcon: ["shrink-0 [&>svg]:block [&>svg]:size-3.5 [&>svg]:shrink-0"],
    bodyText: ["min-w-0 flex-1"],
    arrow: [
      "pointer-events-none flex overflow-visible",
      "data-[side=top]:bottom-[-5px]",
      "data-[side=bottom]:top-[-5px] data-[side=bottom]:rotate-180",
      "data-[side=left]:right-[-8px] data-[side=left]:-rotate-90",
      "data-[side=right]:left-[-8px] data-[side=right]:rotate-90",
      "data-[side=inline-start]:right-[-8px] data-[side=inline-start]:-rotate-90",
      "data-[side=inline-end]:left-[-8px] data-[side=inline-end]:rotate-90",
    ],
  },
  variants: {
    longPress: {
      true: {
        trigger: ["[&:not(a[href])]:[-webkit-touch-callout:none]"],
      },
      false: {},
    },
    hasLeadingIcon: {
      true: {
        body: ["flex items-center gap-x-1.5"],
      },
      false: {},
    },
  },
});

export type TooltipProviderProps = BaseTooltip.Provider.Props;

export function TooltipProvider({ delay = 0, ...props }: TooltipProviderProps) {
  return <BaseTooltip.Provider delay={delay} {...props} />;
}

export type TooltipProps = BaseTooltip.Root.Props;

type TooltipHandle = BaseTooltip.Handle<unknown>;

type TooltipTouchContextValue = {
  /** What a trigger opens its tooltip through on a touch screen (tooltip-touch.ts). */
  handle: TooltipHandle;
  /** Records that a touch opened the tooltip, until it closes. */
  markTouchOpen(): void;
};

const TooltipTouchContext = createContext<TooltipTouchContextValue | null>(null);

export function Tooltip({ actionsRef, handle: handleProp, onOpenChange, ...props }: TooltipProps) {
  const { actionsRef: mergedActionsRef, close } = usePopupCloseAction(actionsRef);
  const [ownHandle] = useState<TooltipHandle>(() => BaseTooltip.createHandle());
  const handle = handleProp ?? ownHandle;
  const touchOpenRef = useRef(false);
  const touch = useMemo(
    () => ({
      handle,
      markTouchOpen() {
        touchOpenRef.current = true;
      },
    }),
    [handle],
  );
  const handleOpenChange = useCallback<NonNullable<TooltipProps["onOpenChange"]>>(
    (open, details) => {
      // A tap is followed by the browser's mouse events for it, and their
      // mouseleave reads as the pointer leaving: a tooltip a touch opened
      // stays until a tap elsewhere, Esc or its own timer closes it.
      if (!open && touchOpenRef.current && details.reason === "trigger-hover") {
        details.cancel();
        return;
      }
      if (!open) touchOpenRef.current = false;
      onOpenChange?.(open, details);
    },
    [onOpenChange],
  );
  return (
    <PopupAnchorCloseProvider close={close}>
      <TooltipTouchContext.Provider value={touch}>
        <BaseTooltip.Root
          actionsRef={mergedActionsRef}
          handle={handle}
          onOpenChange={handleOpenChange}
          {...props}
        />
      </TooltipTouchContext.Provider>
    </PopupAnchorCloseProvider>
  );
}

export type TooltipTriggerProps = StyledProps<BaseTooltip.Trigger.Props> & {
  /**
   * On a touch screen, holding the trigger for 500ms opens the tooltip, on a
   * disabled trigger too (`focusableWhenDisabled`). By default it does,
   * unless the touch is in a link (its own long-press menu) or inside an
   * element that owns the long press (`data-long-press-owner`: a
   * `ContextMenuTrigger`, a touch-draggable item, an app's long-press row).
   * `false` turns it off; `true` takes the hold even inside an owner, for a
   * disabled button whose reason must show there: the owner doesn't open.
   */
  openOnLongPress?: boolean;
  /**
   * On a touch screen, a tap opens the tooltip and the next tap closes it.
   * Only for a button that exists to explain (an ⓘ), whose tap does nothing
   * else. Its click no longer closes the tooltip (`closeOnClick` is `false`
   * unless set).
   * @default false
   */
  openOnTap?: boolean;
};

const InsideTooltipTriggerContext = createContext(false);

/**
 * Whether this renders as (or inside) a `TooltipTrigger`: a part that adds a
 * tooltip of its own by default, such as `MessageItemToolbarButton`, leaves it
 * out when the caller already wraps it in one, so the element never opens two.
 */
export function useInsideTooltipTrigger() {
  return useContext(InsideTooltipTriggerContext);
}

type TouchHandlers = ReturnType<typeof useTooltipTouch>;

/** The touch handlers run after the caller's own handler of the same event. */
function withTouchHandlers(
  touch: TouchHandlers,
  props: Partial<Record<keyof TouchHandlers, unknown>>,
) {
  const merged = { ...touch };
  for (const key of Object.keys(touch) as (keyof TouchHandlers)[]) {
    const own = props[key];
    if (typeof own !== "function") continue;
    const ours = touch[key] as (event: unknown) => void;
    merged[key] = ((event: unknown) => {
      own(event);
      ours(event);
    }) as never;
  }
  return merged;
}

export function TooltipTrigger({
  className,
  openOnLongPress,
  openOnTap = false,
  closeOnClick,
  id: idProp,
  ...props
}: TooltipTriggerProps) {
  const reactId = useId();
  const id = idProp ?? `base-ui-${reactId}`;
  const root = useContext(TooltipTouchContext);
  const handle: TooltipHandle | null = props.handle ?? root?.handle ?? null;
  const touchEnabled = handle != null && !props.disabled;
  const longPress = touchEnabled ? (openOnLongPress ?? "auto") : false;
  const touch = useTooltipTouch({
    longPress,
    tap: touchEnabled && openOnTap,
    isOpen: () => handle?.isOpen ?? false,
    open: () => {
      if (!handle) return;
      if (root?.handle === handle) root.markTouchOpen();
      handle.open(id);
    },
    close: () => handle?.close(),
  });
  const { trigger } = tooltip({ longPress: longPress !== false });
  const childSlot = isValidElement<{ "data-slot"?: string }>(props.render)
    ? props.render.props["data-slot"]
    : undefined;
  const slot = (props as { "data-slot"?: string })["data-slot"] ?? childSlot ?? "tooltip-trigger";

  return (
    <InsideTooltipTriggerContext.Provider value>
      <BaseTooltip.Trigger
        data-slot={slot}
        className={trigger({ className })}
        id={id}
        closeOnClick={closeOnClick ?? !openOnTap}
        data-tooltip-long-press={longPress === true ? "" : undefined}
        {...props}
        {...withTouchHandlers(touch, props)}
      />
    </InsideTooltipTriggerContext.Provider>
  );
}

export type TooltipPortalProps = BaseTooltip.Portal.Props;

export function TooltipPortal(props: TooltipPortalProps) {
  return (
    <BaseTooltip.Portal
      data-slot="tooltip-portal"
      data-raft-ui-overlay=""
      {...useThemeScopeProps(usePortalContainerProps(props, false))}
    />
  );
}

type TooltipArrowProps = StyledProps<BaseTooltip.Arrow.Props>;

function TooltipArrow({ className, ...props }: TooltipArrowProps) {
  const { arrow } = tooltip();
  return (
    <BaseTooltip.Arrow data-slot="tooltip-arrow" className={arrow({ className })} {...props}>
      <TooltipArrowSvg />
    </BaseTooltip.Arrow>
  );
}

function TooltipArrowSvg(props: ComponentProps<"svg">) {
  return (
    <svg width="12" height="6" viewBox="0 0 12 6" fill="none" {...props}>
      <path d="M1 0H11L6 5.25Z" className="fill-layer-hud" />
    </svg>
  );
}

function flattenTooltipChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      return flattenTooltipChildren(child.props.children);
    }

    return [child];
  });
}

function isTooltipLeadingIcon(child: ReactNode) {
  if (!isValidElement<{ "data-slot"?: string }>(child)) {
    return false;
  }

  // A key or a shortcut follows the text; it is never the leading icon.
  if (child.props["data-slot"] === "kbd" || isInlinePart(child.type)) {
    return false;
  }

  if (child.type === "svg") {
    return true;
  }

  return typeof child.type !== "string";
}

function partitionTooltipBodyChildren(children: ReactNode) {
  const items = flattenTooltipChildren(children);
  const icons: ReactNode[] = [];
  const rest: ReactNode[] = [];
  let seenNonIcon = false;

  for (const item of items) {
    if (!seenNonIcon && isTooltipLeadingIcon(item)) {
      icons.push(item);
      continue;
    }

    seenNonIcon = true;
    rest.push(item);
  }

  // A leading icon leads something: a component alone in the tooltip (a list
  // of names, a custom label) is its content, not an icon before empty text.
  if (rest.length === 0) return { icons: [], rest: items };

  return { icons, rest };
}

function TooltipBodyContent({ children }: { children: ReactNode }) {
  const { icons, rest } = partitionTooltipBodyChildren(children);
  const { body, bodyIcon, bodyText } = tooltip({ hasLeadingIcon: icons.length > 0 });

  if (icons.length === 0) {
    return (
      <span data-slot="tooltip-body" className={body()}>
        {children}
      </span>
    );
  }

  return (
    <span data-slot="tooltip-body" className={body()}>
      <span data-slot="tooltip-body-icon" className={bodyIcon()}>
        {icons}
      </span>
      <span data-slot="tooltip-body-text" className={bodyText()}>
        {rest}
      </span>
    </span>
  );
}

export type TooltipContentProps = StyledProps<BaseTooltip.Popup.Props> &
  Pick<
    BaseTooltip.Positioner.Props,
    | "align"
    | "alignOffset"
    | "anchor"
    | "arrowPadding"
    | "collisionAvoidance"
    | "collisionBoundary"
    | "collisionPadding"
    | "disableAnchorTracking"
    | "positionMethod"
    | "side"
    | "sideOffset"
    | "sticky"
  > & {
    container?: TooltipPortalProps["container"];
    portalProps?: TooltipPortalProps;
  };

const CONTENT_COLLISION_AVOIDANCE: BaseTooltip.Positioner.Props["collisionAvoidance"] = {
  side: "flip",
  align: "shift",
  fallbackAxisSide: "none",
};

type TooltipPositionerProps = BaseTooltip.Positioner.Props & {
  container?: TooltipPortalProps["container"];
};

/**
 * Inside the portal, so it mounts each time the tooltip opens and reads the
 * frame insets then (lib/frame-insets.ts): a tooltip that would open into
 * one flips away from it, and one that would overlap it along its trigger
 * shifts out of it. It keeps to the inset itself, not past it.
 *
 * The insets are its collision boundary, not its padding (frameCollision):
 * Base UI sizes the shift limiter from the padding, so a padding carrying a
 * window-controls inset pushed every short tooltip off its trigger, its arrow
 * off center, by up to half the left and right insets.
 */
function TooltipFramePositioner({
  collisionBoundary,
  collisionPadding,
  container,
  ref,
  ...props
}: TooltipPositionerProps) {
  // The padding a caller passes keeps clear of the insets too, with no gap.
  const collision = usePopupCollision(
    undefined,
    collisionBoundary,
    collisionPadding ?? BASE_COLLISION_PADDING,
    container,
    0,
    props.anchor,
  );
  const dismissRef = usePopupAnchorDismiss(props.anchor, "close-on-gone");
  const [mergedRef] = useMergedRef(collision.ref, dismissRef, ref);
  return <BaseTooltip.Positioner {...collision} {...props} ref={mergedRef} />;
}

export function TooltipContent({
  align = "center",
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance = CONTENT_COLLISION_AVOIDANCE,
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking,
  positionMethod = "fixed",
  side = "top",
  sideOffset,
  sticky,
  container,
  portalProps,
  className,
  children,
  ...props
}: TooltipContentProps) {
  const { positioner, content } = tooltip();
  const portalContainer = container !== undefined ? container : portalProps?.container;

  return (
    <TooltipPortal {...portalProps} container={portalContainer}>
      <TooltipFramePositioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        arrowPadding={arrowPadding}
        collisionAvoidance={collisionAvoidance}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        container={portalContainer}
        disableAnchorTracking={disableAnchorTracking}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset ?? 8}
        sticky={sticky}
        className={positioner()}
      >
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          className={content({ className })}
          {...props}
        >
          <TooltipBodyContent>{children}</TooltipBodyContent>
          <TooltipArrow />
        </BaseTooltip.Popup>
      </TooltipFramePositioner>
    </TooltipPortal>
  );
}
