import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const tooltip = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "relative inline-block max-w-[min(20rem,var(--available-width,20rem))] min-w-0 px-3 py-2",
      "text-[13px] leading-[18px] whitespace-normal break-words",
      "origin-[var(--transform-origin)] outline-none",
      "transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0",
      "data-[ending-style]:scale-[0.99] data-[ending-style]:opacity-0",
      "data-[instant]:transition-none",
      "motion-reduce:transition-none",
      "[&>svg]:mr-1.5 [&>svg]:inline-block [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:align-[-0.125em]",
      "has-[[data-slot=kbd]]:py-1.5 has-[[data-slot=kbd]]:pr-1.5",
      "[&_[data-slot=kbd]]:relative [&_[data-slot=kbd]]:z-10 [&_[data-slot=kbd]]:ml-1.5",
      "[&_[data-slot=kbd]]:h-4 [&_[data-slot=kbd]]:min-w-4 [&_[data-slot=kbd]]:px-1 [&_[data-slot=kbd]]:py-0",
      "[&_[data-slot=kbd]]:text-[10px] [&_[data-slot=kbd]]:font-semibold [&_[data-slot=kbd]]:leading-none",
    ],
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
    theme: {
      brutal: {
        content: [
          "border-2 border-black bg-soft-signal",
          "font-sans font-bold text-black",
          "shadow-[var(--shadow-brutal-sm)]",
          "[&_[data-slot=kbd]]:border-black/70 [&_[data-slot=kbd]]:bg-white [&_[data-slot=kbd]]:text-black/70 [&_[data-slot=kbd]]:ring-0",
        ],
        arrow: ["hidden"],
      },
      elegant: {
        content: [
          "rounded-xl bg-[oklch(0.263_0.009_294.9)] text-[oklch(0.965_0.002_286)]",
          "font-sans text-[13px] font-medium tracking-[-0.005em]",
          "shadow-[0_18px_42px_-18px_oklch(0_0_0_/_0.54)]",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/35 after:mix-blend-overlay after:content-['']",
          "dark:bg-[oklch(0.230_0.010_294.8)] dark:shadow-[0_18px_42px_-18px_oklch(0_0_0_/_0.68)]",
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
  collisionAvoidance = { side: "shift", align: "shift", fallbackAxisSide: "none" },
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking = false,
  positionMethod = "fixed",
  side = "top",
  sideOffset,
  sticky,
  portalProps,
  className,
  children,
  ...props
}: TooltipContentProps) {
  const theme = useThemeFamily();
  const { positioner, content } = tooltip({ theme });
  const resolvedSideOffset = sideOffset ?? (theme === "elegant" ? 8 : 6);

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
        sideOffset={resolvedSideOffset}
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
