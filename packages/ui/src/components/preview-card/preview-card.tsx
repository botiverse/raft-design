import { createContext, useContext } from "react";
import type { ComponentPropsWithRef } from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { BASE_COLLISION_PADDING, usePopupCollision } from "../../lib/frame-insets";
import { tv } from "../../lib/tv";
import { messageCard } from "../message-embed/message-embed.recipe";
import type { StyledProps } from "../../lib/styled-props";
import { resolveThemeScopeProps, useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useTheme } from "../../lib/theme/use-theme";

const previewCard = tv({
  slots: {
    trigger: [],
    positioner: ["isolate z-popup outline-none"],
    popup: [
      "max-h-(--available-height) min-w-[220px] overflow-hidden",
      "outline-none",
      "origin-(--transform-origin) transform-gpu opacity-100 will-change-[transform,opacity]",
      "transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-starting-style:scale-[0.97] data-starting-style:opacity-0",
      "data-ending-style:scale-[0.99] data-ending-style:opacity-0 data-ending-style:duration-150",
      "data-instant:transition-none motion-reduce:transition-none",
      "rounded-container bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    header: ["flex items-start gap-3", "px-4 pt-4 pb-3 last:pb-4"],
    separator: ["border-t", "border-line-hairline"],
    title: ["m-0 truncate", "font-sans text-headline font-bold text-foreground"],
    description: [
      "m-0 truncate",
      "px-4 py-3 last:pb-4 font-sans text-callout text-foreground-muted",
    ],
    arrow: ["size-2 rotate-45", "border-l border-t border-line-seam bg-layer-popover"],
  },
  variants: {
    // A profile card (a person or an agent) is 300px; an app's item card,
    // with a title, a state and buttons to fit, is the item card's 400px.
    size: {
      profile: { popup: "w-[300px]" },
      item: { popup: messageCard().popover() },
    },
  },
  defaultVariants: { size: "profile" },
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

type PreviewCardFramePositionerProps = BasePreviewCard.Positioner.Props & {
  container?: PreviewCardPortalProps["container"];
};

// Inside the portal, so it mounts each time the popup opens and reads the
// frame insets then: 8px from each inset, Base UI's own 5px from the window's
// edge elsewhere.
function PreviewCardFramePositioner({
  collisionBoundary,
  collisionPadding,
  container,
  ...props
}: PreviewCardFramePositionerProps) {
  const collision = usePopupCollision(
    collisionPadding,
    collisionBoundary,
    BASE_COLLISION_PADDING,
    container,
  );
  return <BasePreviewCard.Positioner {...collision} {...props} />;
}

export type PreviewCardContentProps = StyledProps<BasePreviewCard.Popup.Props> & {
  /** `item` for an app's item card (a title, a state and buttons): 400px instead of a profile's 300px. Choose it by what the card shows, not by its parts. */
  size?: "profile" | "item";
} & Pick<
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
  disableAnchorTracking,
  positionMethod = "fixed",
  side = "bottom",
  sideOffset = 6,
  sticky,
  portalProps,
  size = "profile",
  className,
  ...props
}: PreviewCardContentProps) {
  const { positioner, popup } = previewCard({ size });
  return (
    <PreviewCardPortal {...portalProps}>
      <PreviewCardFramePositioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        arrowPadding={arrowPadding}
        collisionAvoidance={collisionAvoidance}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        container={portalProps?.container}
        disableAnchorTracking={disableAnchorTracking}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
        className={positioner()}
      >
        <BasePreviewCard.Popup
          data-slot="preview-card-content"
          data-size={size}
          className={popup({ className })}
          {...props}
        />
      </PreviewCardFramePositioner>
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

// In an item card's body the title is the shared card title (up to 2 lines,
// the card title's size); in a profile card's header it keeps its own.
const InItemBody = createContext(false);

export function PreviewCardTitle({ className, ...props }: PreviewCardTitleProps) {
  const inItemBody = useContext(InItemBody);
  const title = inItemBody ? messageCard().title : previewCard().title;
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

export type PreviewCardBodyProps = ComponentPropsWithRef<"div">;

/**
 * The item card's block: the id line, the title and the details row, in that
 * order. Its parts are a card's in a message (AppLinkCard), so the two read
 * the same.
 */
export function PreviewCardBody({ className, ...props }: PreviewCardBodyProps) {
  const { body } = messageCard();
  return (
    <InItemBody.Provider value>
      <div data-slot="preview-card-body" className={body({ className })} {...props} />
    </InItemBody.Provider>
  );
}

export type PreviewCardEyebrowProps = ComponentPropsWithRef<"p">;

/** The muted line above the title that identifies the item, such as its id. One line, truncated. */
export function PreviewCardEyebrow({ className, ...props }: PreviewCardEyebrowProps) {
  const { eyebrow } = messageCard();
  return <p data-slot="preview-card-eyebrow" className={eyebrow({ className })} {...props} />;
}

export type PreviewCardMetaProps = ComponentPropsWithRef<"div">;

/** The row under the title: one state chip, then muted details. Wraps when it runs out of room. */
export function PreviewCardMeta({ className, ...props }: PreviewCardMetaProps) {
  const { meta } = messageCard();
  return <div data-slot="preview-card-meta" className={meta({ className })} {...props} />;
}

export type PreviewCardActionsProps = ComponentPropsWithRef<"div">;

/** The row of at most two buttons. */
export function PreviewCardActions({ className, ...props }: PreviewCardActionsProps) {
  const { actions } = messageCard();
  return <div data-slot="preview-card-actions" className={actions({ className })} {...props} />;
}

export type PreviewCardFooterProps = ComponentPropsWithRef<"p">;

/** The caption under a hairline at the bottom of the card: where the item comes from. */
export function PreviewCardFooter({ className, ...props }: PreviewCardFooterProps) {
  const { sourceFooter } = messageCard();
  return <p data-slot="preview-card-footer" className={sourceFooter({ className })} {...props} />;
}
