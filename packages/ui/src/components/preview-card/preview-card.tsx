import type { ComponentPropsWithRef } from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const previewCard = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    popup: [
      "max-h-[var(--available-height)] min-w-[220px] overflow-hidden",
      "outline-none",
      "origin-[var(--transform-origin)] transform-gpu opacity-100 will-change-[transform,opacity]",
      "transition-[opacity,transform] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0",
      "data-[ending-style]:scale-[0.99] data-[ending-style]:opacity-0 data-[ending-style]:duration-150",
      "data-[instant]:transition-none motion-reduce:transition-none",
    ],
    header: ["flex items-start gap-3 px-3 pt-3 pb-2"],
    separator: ["border-t"],
    title: ["m-0 truncate text-sm leading-none"],
    description: ["m-0 truncate px-3 py-2 text-xs leading-5"],
    arrow: ["size-2 rotate-45"],
  },
  variants: {
    theme: {
      // Matches slock's hand-rolled `.card-brutal` (border-2 border-black
      // bg-white shadow-lg) so the migrated MentionHoverCard keeps its exact
      // silhouette. Source never rendered an arrow, so brutal hides it too.
      brutal: {
        popup: ["border-2 border-black bg-white shadow-lg"],
        separator: ["border-black"],
        title: ["font-sans font-bold text-black"],
        description: ["font-sans text-black/70"],
        arrow: ["hidden"],
      },
      elegant: {
        popup: ["rounded-md bg-layer-popover shadow-xl"],
        separator: ["border-line-subtle"],
        title: ["font-sans font-medium text-foreground-strong"],
        description: [
          "bg-black/[0.015] font-sans",
          "text-[oklch(0.48_0_0)] dark:text-[oklch(0.76_0_0)]",
        ],
        arrow: ["border-l border-t border-line-muted bg-layer-popover"],
      },
    },
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
  const theme = useThemeFamily();
  const { trigger } = previewCard({ theme });
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
  return <BasePreviewCard.Portal data-slot="preview-card-portal" {...props} />;
}

export type PreviewCardPopupProps = ComponentPropsWithRef<"div">;

export function PreviewCardPopup({ className, ...props }: PreviewCardPopupProps) {
  const theme = useThemeFamily();
  const { popup } = previewCard({ theme });
  return <div data-slot="preview-card-content" className={popup({ className })} {...props} />;
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
  const theme = useThemeFamily();
  const { positioner, popup } = previewCard({ theme });
  return (
    <BasePreviewCard.Portal {...portalProps}>
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
    </BasePreviewCard.Portal>
  );
}

export type PreviewCardHeaderProps = ComponentPropsWithRef<"div">;

export function PreviewCardHeader({ className, ...props }: PreviewCardHeaderProps) {
  const theme = useThemeFamily();
  const { header } = previewCard({ theme });
  return <div data-slot="preview-card-header" className={header({ className })} {...props} />;
}

export type PreviewCardSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;

export function PreviewCardSeparator({ className, ...props }: PreviewCardSeparatorProps) {
  const theme = useThemeFamily();
  const { separator } = previewCard({ theme });
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
  const theme = useThemeFamily();
  const { title } = previewCard({ theme });
  return <p data-slot="preview-card-title" className={title({ className })} {...props} />;
}

export type PreviewCardDescriptionProps = ComponentPropsWithRef<"p">;

export function PreviewCardDescription({ className, ...props }: PreviewCardDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = previewCard({ theme });
  return (
    <p data-slot="preview-card-description" className={description({ className })} {...props} />
  );
}

export type PreviewCardArrowProps = StyledProps<BasePreviewCard.Arrow.Props>;

export function PreviewCardArrow({ className, ...props }: PreviewCardArrowProps) {
  const theme = useThemeFamily();
  const { arrow } = previewCard({ theme });
  return (
    <BasePreviewCard.Arrow
      data-slot="preview-card-arrow"
      className={arrow({ className })}
      {...props}
    />
  );
}
