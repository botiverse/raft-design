import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { Children, Fragment, isValidElement, type ComponentProps, type ReactNode } from "react";
import { tv, type VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const tooltip = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "relative inline-block max-w-[min(20rem,var(--available-width,20rem))] min-w-0 px-2.5 py-1",
      "origin-[var(--transform-origin)] outline-none",
      "transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0",
      "data-[ending-style]:scale-[0.99] data-[ending-style]:opacity-0",
      "data-[instant]:transition-none",
      "motion-reduce:transition-none",
      "has-[[data-slot=kbd]]:py-1.5 has-[[data-slot=kbd]]:pr-1.5",
    ],
    body: [
      "block min-w-0 text-[13px] leading-[18px] whitespace-normal break-words",
      "[&_[data-slot=kbd]]:relative [&_[data-slot=kbd]]:z-10 [&_[data-slot=kbd]]:ml-1.5",
      "[&_[data-slot=kbd]]:h-4 [&_[data-slot=kbd]]:min-w-4 [&_[data-slot=kbd]]:px-1 [&_[data-slot=kbd]]:py-0",
      "[&_[data-slot=kbd]]:text-[10px] [&_[data-slot=kbd]]:font-semibold [&_[data-slot=kbd]]:leading-none",
    ],
    bodyIcon: ["shrink-0 [&>svg]:mt-1 [&>svg]:block [&>svg]:size-3.5 [&>svg]:shrink-0"],
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
        body: ["flex items-start gap-x-1.5"],
      },
      false: {},
    },
    theme: {
      brutal: {
        content: [
          "border-2 border-line-strong bg-soft-signal",
          "font-sans font-bold text-foreground",
          "shadow-[var(--shadow-brutal-sm)]",
          "[&_[data-slot=kbd]]:border-line-strong/70 [&_[data-slot=kbd]]:bg-layer-panel [&_[data-slot=kbd]]:text-foreground/70 [&_[data-slot=kbd]]:ring-0",
        ],
        arrow: ["hidden"],
      },
      elegant: {
        content: [
          "rounded-md bg-[oklch(0.263_0.009_106.42)] text-[oklch(0.965_0.002_106.42)]",
          "font-sans text-[13px] font-medium tracking-[-0.005em]",
          "shadow-lg",
          "dark:bg-[oklch(0.230_0.010_294.8)]",
          "[&_[data-slot=kbd]]:bg-white/[0.08] [&_[data-slot=kbd]]:text-white/72 [&_[data-slot=kbd]]:ring-0",
        ],
        arrow: [],
      },
    },
  },
});

type TooltipStyleProps = VariantProps<typeof tooltip>;

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
  const theme = useThemeFamily();
  const { trigger } = tooltip({ theme });
  return (
    <BaseTooltip.Trigger
      data-slot="tooltip-trigger"
      className={trigger({ className })}
      {...props}
    />
  );
}

export type TooltipPortalProps = BaseTooltip.Portal.Props;

export function TooltipPortal(props: TooltipPortalProps) {
  return <BaseTooltip.Portal data-slot="tooltip-portal" {...props} />;
}

type TooltipArrowProps = StyledProps<BaseTooltip.Arrow.Props>;

function TooltipArrow({ className, ...props }: TooltipArrowProps) {
  const theme = useThemeFamily();
  const { arrow } = tooltip({ theme });
  return (
    <BaseTooltip.Arrow data-slot="tooltip-arrow" className={arrow({ className })} {...props}>
      <TooltipArrowSvg theme={theme} />
    </BaseTooltip.Arrow>
  );
}

function TooltipArrowSvg({
  theme,
  ...props
}: ComponentProps<"svg"> & Pick<TooltipStyleProps, "theme">) {
  const isElegant = theme === "elegant";

  return (
    <svg width="12" height="6" viewBox="0 0 12 6" fill="none" {...props}>
      <path
        d="M1 0H11L6 5.25Z"
        className={
          isElegant
            ? "fill-[oklch(0.263_0.009_294.9)] dark:fill-[oklch(0.230_0.010_294.8)]"
            : "fill-layer-popover"
        }
      />
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

export function TooltipContent({
  align = "center",
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance = { side: "shift", align: "shift", fallbackAxisSide: "none" },
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking = false,
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
  const theme = useThemeFamily();
  const { positioner, content } = tooltip({ theme });
  const resolvedSideOffset = sideOffset ?? (theme === "elegant" ? 8 : 6);
  const portalContainer = container !== undefined ? container : portalProps?.container;

  return (
    <BaseTooltip.Portal {...portalProps} container={portalContainer}>
      <BaseTooltip.Positioner
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
        sideOffset={resolvedSideOffset}
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
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
