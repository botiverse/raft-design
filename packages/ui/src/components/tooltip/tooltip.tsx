import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps } from "react";
import { tv } from "../../lib/tv.ts";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useThemeFamily } from "../../lib/theme/use-theme.ts";

const tooltip = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "relative inline-flex max-w-xs items-center gap-1.5 px-2.5 py-1.5",
      "text-xs leading-4 whitespace-normal",
      "origin-[var(--transform-origin)] outline-none",
      "transition-[opacity,transform] duration-100",
      "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
      "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
      "data-[instant]:transition-none",
      "[&>svg]:size-3.5 [&>svg]:shrink-0",
      "has-[[data-slot=kbd]]:py-1.5 has-[[data-slot=kbd]]:pr-1.5",
      "[&_[data-slot=kbd]]:relative [&_[data-slot=kbd]]:z-10",
      "[&_[data-slot=kbd]]:h-4 [&_[data-slot=kbd]]:min-w-4 [&_[data-slot=kbd]]:px-1 [&_[data-slot=kbd]]:py-0",
      "[&_[data-slot=kbd]]:text-[10px] [&_[data-slot=kbd]]:font-semibold [&_[data-slot=kbd]]:leading-none",
    ],
    arrow: [
      "pointer-events-none flex",
      "data-[side=top]:bottom-[-6px]",
      "data-[side=bottom]:top-[-6px] data-[side=bottom]:rotate-180",
      "data-[side=left]:right-[-8px] data-[side=left]:-rotate-90",
      "data-[side=right]:left-[-8px] data-[side=right]:rotate-90",
      "data-[side=inline-start]:right-[-8px] data-[side=inline-start]:-rotate-90",
      "data-[side=inline-end]:left-[-8px] data-[side=inline-end]:rotate-90",
    ],
  },
  variants: {
    theme: {
      brutal: {
        content: [
          "border-2 border-black bg-white",
          "font-sans font-bold text-black",
          "shadow-none",
          "[&_[data-slot=kbd]]:text-black/60",
        ],
        arrow: ["hidden"],
      },
      elegant: {
        content: [
          "rounded-md bg-layer-popover",
          "font-sans text-xs font-medium tracking-[-0.005em] text-foreground-strong",
          "shadow-[0_0_0_1px_oklch(0.21_0.006_285_/_0.10),0_1px_1px_oklch(0.21_0.006_285_/_0.04),0_1px_4px_-3px_oklch(0.21_0.006_285_/_0.10)]",
          "[&_[data-slot=kbd]]:bg-foreground-muted/10 [&_[data-slot=kbd]]:text-foreground-muted [&_[data-slot=kbd]]:ring-0",
        ],
        arrow: [],
      },
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
      <TooltipArrowSvg />
    </BaseTooltip.Arrow>
  );
}

function TooltipArrowSvg(props: ComponentProps<"svg">) {
  return (
    <svg width="12" height="6" viewBox="0 0 12 6" fill="none" {...props}>
      <path d="M1 0H11L6 5.25Z" className="fill-layer-popover" />
      <path
        d="M1 0.5L6 5.25L11 0.5"
        className="stroke-[oklch(0.21_0.006_285_/_0.10)]"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
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
    portalProps?: TooltipPortalProps;
  };

export function TooltipContent({
  align = "center",
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking = false,
  positionMethod = "fixed",
  side = "top",
  sideOffset = 6,
  sticky,
  portalProps,
  className,
  children,
  ...props
}: TooltipContentProps) {
  const theme = useThemeFamily();
  const { positioner, content } = tooltip({ theme });

  return (
    <BaseTooltip.Portal {...portalProps}>
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
        sideOffset={sideOffset}
        sticky={sticky}
        className={positioner()}
      >
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          className={content({ className })}
          {...props}
        >
          {children}
          <TooltipArrow />
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
