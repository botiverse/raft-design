import type { ComponentPropsWithRef } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";

const popover = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "max-h-(--available-height) min-w-[220px] overflow-hidden",
      "outline-none",
      "rounded-container bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    header: ["flex items-center justify-between px-3", "min-h-11 gap-2 py-1.5 pr-2 pl-4"],
    separator: ["border-t", "border-line-hairline"],
    title: ["m-0", "font-sans text-headline font-bold text-foreground"],
    description: ["m-0", "font-sans text-footnote text-foreground-muted"],
    close: [
      "inline-flex items-center justify-center",
      "outline-none transition-colors",
      "h-8 min-w-8 rounded-control px-1.5",
      "font-sans text-footnote font-bold text-foreground",
      "hover:bg-fill-pressed active:bg-fill-pressed",
      "focus-visible:shadow-focus",
      "[&_svg]:size-4.5",
    ],
    arrow: ["size-2 rotate-45", "border-l border-t border-line-seam bg-layer-popover"],
    backdrop: ["fixed inset-0", "bg-transparent"],
    viewport: ["block"],
  },
});

export type PopoverProps = BasePopover.Root.Props;

export function Popover(props: PopoverProps) {
  return <BasePopover.Root data-slot="popover" {...props} />;
}

export type PopoverTriggerProps = StyledProps<BasePopover.Trigger.Props>;

export function PopoverTrigger({ className, ...props }: PopoverTriggerProps) {
  const { trigger } = popover();
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
  return <BasePopover.Portal data-slot="popover-portal" {...useThemeScopeProps(props)} />;
}

export type PopoverPopupProps = ComponentPropsWithRef<"div">;

export function PopoverPopup({ className, ...props }: PopoverPopupProps) {
  const { content } = popover();
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
    container?: PopoverPortalProps["container"];
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
  container,
  portalProps,
  className,
  ...props
}: PopoverContentProps) {
  const { positioner, content } = popover();
  const portalContainer = container !== undefined ? container : portalProps?.container;
  return (
    <PopoverPortal {...portalProps} container={portalContainer}>
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
    </PopoverPortal>
  );
}

export type PopoverViewportProps = StyledProps<BasePopover.Viewport.Props>;

export function PopoverViewport({ className, ...props }: PopoverViewportProps) {
  const { viewport } = popover();
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
  const { header } = popover();
  return <div data-slot="popover-header" className={header({ className })} {...props} />;
}

export type PopoverSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;

export function PopoverSeparator({ className, ...props }: PopoverSeparatorProps) {
  const { separator } = popover();
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
  const { title } = popover();
  return (
    <BasePopover.Title data-slot="popover-title" className={title({ className })} {...props} />
  );
}

export type PopoverDescriptionProps = StyledProps<BasePopover.Description.Props>;

export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  const { description } = popover();
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
  const { close } = popover();
  return (
    <BasePopover.Close data-slot="popover-close" className={close({ className })} {...props} />
  );
}

export type PopoverArrowProps = StyledProps<BasePopover.Arrow.Props>;

export function PopoverArrow({ className, ...props }: PopoverArrowProps) {
  const { arrow } = popover();
  return (
    <BasePopover.Arrow data-slot="popover-arrow" className={arrow({ className })} {...props} />
  );
}

export type PopoverBackdropProps = StyledProps<BasePopover.Backdrop.Props>;

export function PopoverBackdrop({ className, ...props }: PopoverBackdropProps) {
  const { backdrop } = popover();
  return (
    <BasePopover.Backdrop
      data-slot="popover-backdrop"
      className={backdrop({ className })}
      {...props}
    />
  );
}
