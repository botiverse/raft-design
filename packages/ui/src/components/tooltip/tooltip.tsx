import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { Children, Fragment, isValidElement, useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";

const tooltip = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 pointer-events-none outline-none"],
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
      "has-[[data-slot=kbd]]:py-1 has-[[data-slot=kbd]]:pr-2.5",
    ],
    body: [
      "block min-w-0 text-footnote whitespace-normal wrap-break-word",
      "**:data-[slot=kbd]:relative **:data-[slot=kbd]:z-10 [&_[data-slot=kbd]]:ml-1.5",
      "[&_[data-slot=kbd]]:h-4 [&_[data-slot=kbd]]:min-w-4 [&_[data-slot=kbd]]:px-1 [&_[data-slot=kbd]]:py-0",
      "**:data-[slot=kbd]:text-[12px] **:data-[slot=kbd]:leading-4 [&_[data-slot=kbd]]:font-normal",
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

export function Tooltip(props: TooltipProps) {
  return <BaseTooltip.Root {...props} />;
}

export type TooltipTriggerProps = StyledProps<BaseTooltip.Trigger.Props>;

export function TooltipTrigger({ className, ...props }: TooltipTriggerProps) {
  const { trigger } = tooltip();
  const childSlot = isValidElement<{ "data-slot"?: string }>(props.render)
    ? props.render.props["data-slot"]
    : undefined;
  const slot = (props as { "data-slot"?: string })["data-slot"] ?? childSlot ?? "tooltip-trigger";

  return <BaseTooltip.Trigger data-slot={slot} className={trigger({ className })} {...props} />;
}

export type TooltipPortalProps = BaseTooltip.Portal.Props;

export function TooltipPortal(props: TooltipPortalProps) {
  return <BaseTooltip.Portal data-slot="tooltip-portal" {...useThemeScopeProps(props)} />;
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

  if (child.props["data-slot"] === "kbd") {
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

// Base UI's own collision padding, kept on every side the frame doesn't reserve.
const DEFAULT_COLLISION_PADDING = 5;

/**
 * The window's top band a host shell reserves for its own chrome (the desktop
 * app's caption buttons, drawn over the top bar), as --raft-frame-inset-top on
 * the root element: 0 when no shell sets it, as on the web. Read as px, or
 * measured when it is any other CSS length (a calc() is kept as written in the
 * computed value of an unregistered custom property).
 */
function readFrameInsetTop(): number {
  if (typeof document === "undefined") return 0;
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue("--raft-frame-inset-top").trim();
  if (value === "") return 0;
  if (/^-?(\d+\.?\d*|\.\d+)px$/.test(value)) return Math.max(0, Number.parseFloat(value));
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none;height:var(--raft-frame-inset-top)";
  root.append(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}

/**
 * The collision padding with the frame's top band added: a tooltip that would
 * open into it flips below its trigger, and one beside its trigger shifts down
 * out of it.
 */
function frameCollisionPadding(
  padding: BaseTooltip.Positioner.Props["collisionPadding"],
  insetTop: number,
): BaseTooltip.Positioner.Props["collisionPadding"] {
  if (insetTop <= 0) return padding;
  const base = padding ?? DEFAULT_COLLISION_PADDING;
  if (typeof base === "number") {
    return { top: Math.max(base, insetTop), right: base, bottom: base, left: base };
  }
  return { ...base, top: Math.max(base.top ?? 0, insetTop) };
}

type TooltipPositionerProps = BaseTooltip.Positioner.Props;

// Inside the portal, so it mounts each time the tooltip opens and reads the
// frame's band then.
function TooltipFramePositioner({ collisionPadding, ...props }: TooltipPositionerProps) {
  const [insetTop] = useState(readFrameInsetTop);
  // Base UI rebuilds its positioning middleware when the padding's identity changes.
  const padding = useMemo(
    () => frameCollisionPadding(collisionPadding, insetTop),
    [collisionPadding, insetTop],
  );
  return <BaseTooltip.Positioner collisionPadding={padding} {...props} />;
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
