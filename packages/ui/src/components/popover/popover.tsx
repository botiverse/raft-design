import type { ComponentPropsWithRef } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { tv } from "tailwind-variants/lite";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const popover = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "max-h-[var(--available-height)] min-w-[220px] overflow-hidden bg-layer-panel",
      "outline-none",
    ],
    header: ["flex items-center justify-between px-3 py-2"],
    separator: ["border-t"],
    title: ["m-0 text-[10px] font-bold uppercase leading-none tracking-wide"],
    description: ["m-0 text-xs leading-5"],
    close: [
      "inline-flex items-center justify-center",
      "text-[10px] font-bold uppercase tracking-wide",
      "outline-none transition-colors",
    ],
    arrow: ["size-2 rotate-45"],
    backdrop: ["fixed inset-0"],
    viewport: ["block"],
  },
  variants: {
    theme: {
      brutal: {
        content: [
          "border-2 border-black bg-white shadow-[var(--shadow-hover,4px_4px_0px_var(--color-black))]",
        ],
        separator: ["border-black"],
        title: ["font-sans text-black"],
        description: ["font-sans text-black"],
        close: ["font-sans text-black hover:text-black"],
        arrow: ["border-l-2 border-t-2 border-black bg-white"],
        backdrop: ["bg-transparent"],
      },
      elegant: {
        content: [
          "rounded-md bg-layer-popover",
          "shadow-[0_1px_1px_oklch(0.21_0.006_285_/_0.10),0_0_0_1px_oklch(0.21_0.006_285_/_0.04),0_2px_12px_-4px_oklch(0.21_0.006_285_/_0.16)]",
        ],
        separator: ["border-line-muted"],
        title: ["text-[11px] font-medium tracking-[-0.005em] text-foreground/45"],
        description: ["text-xs leading-5 text-foreground-muted"],
        close: [
          "text-[11px] font-medium tracking-[-0.005em]",
          "text-foreground-muted transition-colors duration-150 hover:text-foreground-strong",
        ],
        arrow: ["border-l border-t border-line-muted bg-layer-popover"],
        backdrop: ["bg-black/20"],
      },
    },
  },
});

export type PopoverProps = BasePopover.Root.Props;

export function Popover(props: PopoverProps) {
  return <BasePopover.Root data-slot="popover" {...props} />;
}

export type PopoverTriggerProps = StyledProps<BasePopover.Trigger.Props>;

export function PopoverTrigger({ className, ...props }: PopoverTriggerProps) {
  const theme = useTheme();
  const { trigger } = popover({ theme });
  return (
    <BasePopover.Trigger
      data-slot="popover-trigger"
      className={trigger({ className })}
      {...props}
    />
  );
}

export type PopoverPortalProps = BasePopover.Portal.Props;

export function PopoverPortal(props: PopoverPortalProps) {
  return <BasePopover.Portal data-slot="popover-portal" {...props} />;
}

export type PopoverPopupProps = ComponentPropsWithRef<"div">;

export function PopoverPopup({ className, ...props }: PopoverPopupProps) {
  const theme = useTheme();
  const { content } = popover({ theme });
  return <div data-slot="popover-content" className={content({ className })} {...props} />;
}

export type PopoverContentProps = StyledProps<BasePopover.Popup.Props> &
  Pick<
    BasePopover.Positioner.Props,
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
    portalProps?: PopoverPortalProps;
  };

export function PopoverContent({
  align = "start",
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking = true,
  positionMethod = "fixed",
  side = "bottom",
  sideOffset = 4,
  sticky,
  portalProps,
  className,
  ...props
}: PopoverContentProps) {
  const theme = useTheme();
  const { positioner, content } = popover({ theme });
  return (
    <BasePopover.Portal {...portalProps}>
      <BasePopover.Positioner
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
        <BasePopover.Popup
          data-slot="popover-content"
          className={content({ className })}
          {...props}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export type PopoverViewportProps = StyledProps<BasePopover.Viewport.Props>;

export function PopoverViewport({ className, ...props }: PopoverViewportProps) {
  const theme = useTheme();
  const { viewport } = popover({ theme });
  return (
    <BasePopover.Viewport
      data-slot="popover-viewport"
      className={viewport({ className })}
      {...props}
    />
  );
}

export type PopoverHeaderProps = ComponentPropsWithRef<"div">;

export function PopoverHeader({ className, ...props }: PopoverHeaderProps) {
  const theme = useTheme();
  const { header } = popover({ theme });
  return <div data-slot="popover-header" className={header({ className })} {...props} />;
}

export type PopoverSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;

export function PopoverSeparator({ className, ...props }: PopoverSeparatorProps) {
  const theme = useTheme();
  const { separator } = popover({ theme });
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="popover-separator"
      className={separator({ className })}
      {...props}
    />
  );
}

export type PopoverTitleProps = StyledProps<BasePopover.Title.Props>;

export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  const theme = useTheme();
  const { title } = popover({ theme });
  return (
    <BasePopover.Title data-slot="popover-title" className={title({ className })} {...props} />
  );
}

export type PopoverDescriptionProps = StyledProps<BasePopover.Description.Props>;

export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  const theme = useTheme();
  const { description } = popover({ theme });
  return (
    <BasePopover.Description
      data-slot="popover-description"
      className={description({ className })}
      {...props}
    />
  );
}

export type PopoverCloseProps = StyledProps<BasePopover.Close.Props>;

export function PopoverClose({ className, ...props }: PopoverCloseProps) {
  const theme = useTheme();
  const { close } = popover({ theme });
  return (
    <BasePopover.Close data-slot="popover-close" className={close({ className })} {...props} />
  );
}

export type PopoverArrowProps = StyledProps<BasePopover.Arrow.Props>;

export function PopoverArrow({ className, ...props }: PopoverArrowProps) {
  const theme = useTheme();
  const { arrow } = popover({ theme });
  return (
    <BasePopover.Arrow data-slot="popover-arrow" className={arrow({ className })} {...props} />
  );
}

export type PopoverBackdropProps = StyledProps<BasePopover.Backdrop.Props>;

export function PopoverBackdrop({ className, ...props }: PopoverBackdropProps) {
  const theme = useTheme();
  const { backdrop } = popover({ theme });
  return (
    <BasePopover.Backdrop
      data-slot="popover-backdrop"
      className={backdrop({ className })}
      {...props}
    />
  );
}
