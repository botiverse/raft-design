import type { ComponentPropsWithRef } from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { resolveThemeScopeProps, useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useTheme } from "../../lib/theme/use-theme";

const previewCard = tv({
  slots: {
    trigger: [],
    positioner: ["isolate z-50 outline-none"],
    popup: [
      "max-h-(--available-height) min-w-[220px] overflow-hidden",
      "outline-none",
      "origin-(--transform-origin) transform-gpu opacity-100 will-change-[transform,opacity]",
      "transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-starting-style:scale-[0.97] data-starting-style:opacity-0",
      "data-ending-style:scale-[0.99] data-ending-style:opacity-0 data-ending-style:duration-150",
      "data-instant:transition-none motion-reduce:transition-none",
      "w-[300px] rounded-container bg-layer-popover text-foreground",
      "shadow-raft-float ring-1 ring-line-seam",
    ],
    header: ["flex items-start gap-3", "px-4 pt-4 pb-3 last:pb-4"],
    separator: ["border-t", "border-line-muted"],
    title: ["m-0 truncate", "font-sans text-headline font-bold text-foreground"],
    description: [
      "m-0 truncate",
      "px-4 py-3 last:pb-4 font-sans text-callout text-foreground-muted",
    ],
    arrow: ["size-2 rotate-45", "border-l border-t border-line-seam bg-layer-popover"],
  },
});

export type PreviewCardProps = BasePreviewCard.Root.Props;

export function PreviewCard(props: PreviewCardProps) {
  return <BasePreviewCard.Root data-slot="preview-card" {...props} />;
}

export type PreviewCardTriggerProps = StyledProps<BasePreviewCard.Trigger.Props>;

// Keep mention previews close to pointer-speed. Base UI's library defaults
// are intentionally conservative for rich previews, but dense message links
// feel sluggish when every hover waits a few hundred milliseconds.
export function PreviewCardTrigger({
  delay = 80,
  closeDelay = 40,
  className,
  ...props
}: PreviewCardTriggerProps) {
  const { trigger } = previewCard();
  return (
    <BasePreviewCard.Trigger
      data-slot="preview-card-trigger"
      delay={delay}
      closeDelay={closeDelay}
      className={trigger({ className })}
      {...props}
    />
  );
}

export type PreviewCardPortalProps = BasePreviewCard.Portal.Props;

export function PreviewCardPortal(props: PreviewCardPortalProps) {
  return <BasePreviewCard.Portal data-slot="preview-card-portal" {...useThemeScopeProps(props)} />;
}

export type PreviewCardPopupProps = ComponentPropsWithRef<"div">;

export function PreviewCardPopup({ className, ...props }: PreviewCardPopupProps) {
  const themeState = useTheme();
  const { popup } = previewCard();
  const scopeProps = resolveThemeScopeProps(
    { ...props, className: popup({ className }) },
    themeState,
  );
  return <div data-slot="preview-card-content" {...scopeProps} />;
}

export type PreviewCardContentProps = StyledProps<BasePreviewCard.Popup.Props> &
  Pick<
    BasePreviewCard.Positioner.Props,
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
    portalProps?: PreviewCardPortalProps;
  };

export function PreviewCardContent({
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
  sideOffset = 6,
  sticky,
  portalProps,
  className,
  ...props
}: PreviewCardContentProps) {
  const { positioner, popup } = previewCard();
  return (
    <PreviewCardPortal {...portalProps}>
      <BasePreviewCard.Positioner
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
        <BasePreviewCard.Popup
          data-slot="preview-card-content"
          className={popup({ className })}
          {...props}
        />
      </BasePreviewCard.Positioner>
    </PreviewCardPortal>
  );
}

export type PreviewCardHeaderProps = ComponentPropsWithRef<"div">;

export function PreviewCardHeader({ className, ...props }: PreviewCardHeaderProps) {
  const { header } = previewCard();
  return <div data-slot="preview-card-header" className={header({ className })} {...props} />;
}

export type PreviewCardSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;

export function PreviewCardSeparator({ className, ...props }: PreviewCardSeparatorProps) {
  const { separator } = previewCard();
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="preview-card-separator"
      className={separator({ className })}
      {...props}
    />
  );
}

export type PreviewCardTitleProps = ComponentPropsWithRef<"p">;

export function PreviewCardTitle({ className, ...props }: PreviewCardTitleProps) {
  const { title } = previewCard();
  return <p data-slot="preview-card-title" className={title({ className })} {...props} />;
}

export type PreviewCardDescriptionProps = ComponentPropsWithRef<"p">;

export function PreviewCardDescription({ className, ...props }: PreviewCardDescriptionProps) {
  const { description } = previewCard();
  return (
    <p data-slot="preview-card-description" className={description({ className })} {...props} />
  );
}

export type PreviewCardArrowProps = StyledProps<BasePreviewCard.Arrow.Props>;

export function PreviewCardArrow({ className, ...props }: PreviewCardArrowProps) {
  const { arrow } = previewCard();
  return (
    <BasePreviewCard.Arrow
      data-slot="preview-card-arrow"
      className={arrow({ className })}
      {...props}
    />
  );
}
