import { useMemo } from "react";
import type { ComponentPropsWithRef, CSSProperties } from "react";
import { fillOnSurface, oklchToRgb, parseHexColor } from "../../lib/fill-contrast";
import { tv } from "../../lib/tv";
import { Badge } from "../badge/badge";
import type { BadgeProps } from "../badge/badge";
import { messageCard, messageEmbed } from "../message-embed/message-embed.recipe";
import { Skeleton } from "../skeleton/skeleton";

const appLinkCard = tv({
  slots: {
    // The card in the message, on an item card's frame (MessageEmbed
    // size="item"). It keeps the gap a table or an image keeps in the text
    // (Markdown), and none at the message's top or bottom.
    root: ["flex flex-col", "my-2 first:mt-0 last:mb-0"],
    // The app's colour for its badge: only the fill, the type that reads on
    // it, and a hairline ring where the fill is too close to the card to keep
    // an edge. In forced colours the badge is the tone's, as without one.
    badgeFill: [
      "not-forced-colors:bg-(--badge-fill) not-forced-colors:text-(--badge-fill-text)",
      "not-forced-colors:inset-ring",
      "[--badge-ring:var(--badge-ring-light)] dark:[--badge-ring:var(--badge-ring-dark)]",
      "not-forced-colors:inset-ring-(--badge-ring)",
    ],
    // The placeholder's lines take the line heights of the parts they stand
    // for, so the card that replaces it is the same size when its title takes
    // two lines and it has buttons (a Button at its default size, 32px).
    placeholderLine: ["flex h-lh items-center"],
    placeholderButton: ["h-8 md:pointer-fine:h-control w-28 rounded-control"],
  },
});

// Every other part is the shared card part (messageCard), the same as on the
// hover card (PreviewCard size="item"): a reader who has seen one reads the
// other, and a change to one is a change to both.
function frame(className: string | undefined) {
  const { root } = appLinkCard();
  return messageEmbed({ size: "item" }).root({ className: root({ className }) });
}

export type AppLinkCardProps = ComponentPropsWithRef<"div">;

/**
 * An app link's card drawn in the message, after the link's paragraph, where
 * the app's answer lists one (a `card` item with `placement: "block"`):
 * Raft's header with the app's identity, the item, and buttons that work by
 * keyboard and touch. It never replaces the link. A `group`: label it with
 * `aria-labelledby` pointing at its `AppLinkCardTitle`, so someone who tabs
 * to one of its buttons hears which item the button acts on.
 */
export function AppLinkCard({ className, ...props }: AppLinkCardProps) {
  return <div role="group" data-slot="app-link-card" className={frame(className)} {...props} />;
}

export type AppLinkCardPlaceholderProps = ComponentPropsWithRef<"div">;

/**
 * The card's size while Raft fetches an answer it already knows lists a
 * block card. Put the `AppLinkCardHeader` in it when the app is known; the item's
 * lines and a button follow, as gray bars.
 */
export function AppLinkCardPlaceholder({
  className,
  children,
  ...props
}: AppLinkCardPlaceholderProps) {
  const { body, eyebrow, title, meta, actions } = messageCard();
  const { placeholderLine, placeholderButton } = appLinkCard();
  return (
    <div
      data-slot="app-link-card-placeholder"
      aria-busy="true"
      className={frame(className)}
      {...props}
    >
      {children}
      <div aria-hidden="true" className={body()}>
        <div className={eyebrow({ className: placeholderLine() })}>
          <Skeleton variant="line" className="w-28" />
        </div>
        <div className={title({ className: "line-clamp-none" })}>
          <div className={placeholderLine()}>
            <Skeleton variant="line" className="w-full" />
          </div>
          <div className={placeholderLine()}>
            <Skeleton variant="line" className="w-2/3" />
          </div>
        </div>
        <div className={meta({ className: placeholderLine() })}>
          <Skeleton variant="line" className="w-40" />
        </div>
      </div>
      <div aria-hidden="true" className={actions()}>
        <Skeleton className={placeholderButton()} />
      </div>
    </div>
  );
}

export type AppLinkCardHeaderProps = ComponentPropsWithRef<"div">;

/** Raft's row at the top: `AppLinkCardIcon`, `AppLinkCardName`, then `AppLinkCardHost`. */
export function AppLinkCardHeader({ className, ...props }: AppLinkCardHeaderProps) {
  const { source } = messageCard();
  return <div data-slot="app-link-card-header" className={source({ className })} {...props} />;
}

export type AppLinkCardIconProps = ComponentPropsWithRef<"span">;

/** The app's registered icon, the image Raft stores and serves: one child at 16px. */
export function AppLinkCardIcon({ className, ...props }: AppLinkCardIconProps) {
  const { sourceIcon } = messageCard();
  return <span data-slot="app-link-card-icon" className={sourceIcon({ className })} {...props} />;
}

export type AppLinkCardNameProps = ComponentPropsWithRef<"span">;

/** The app's name as Raft stores it. One line, truncated. */
export function AppLinkCardName({ className, ...props }: AppLinkCardNameProps) {
  const { sourceName } = messageCard();
  return <span data-slot="app-link-card-name" className={sourceName({ className })} {...props} />;
}

export type AppLinkCardHostProps = ComponentPropsWithRef<"span">;

/**
 * The link's host, after a "·". When it doesn't fit it loses its start, so
 * the end, which says where the link goes, stays.
 */
export function AppLinkCardHost({ className, children, ...props }: AppLinkCardHostProps) {
  const { sourceHost, sourceHostText } = messageCard();
  return (
    <span data-slot="app-link-card-host" className={sourceHost({ className })} {...props}>
      <span dir="rtl" className={sourceHostText()}>
        <span dir="ltr">{children}</span>
      </span>
    </span>
  );
}

export type AppLinkCardBodyProps = ComponentPropsWithRef<"div">;

/** The item: `AppLinkCardEyebrow`, `AppLinkCardTitle`, `AppLinkCardMeta`, in that order. */
export function AppLinkCardBody({ className, ...props }: AppLinkCardBodyProps) {
  const { body } = messageCard();
  return <div data-slot="app-link-card-body" className={body({ className })} {...props} />;
}

export type AppLinkCardEyebrowProps = ComponentPropsWithRef<"p">;

/** The app's id for the item, above the title. One line, truncated. */
export function AppLinkCardEyebrow({ className, ...props }: AppLinkCardEyebrowProps) {
  const { eyebrow } = messageCard();
  return <p data-slot="app-link-card-eyebrow" className={eyebrow({ className })} {...props} />;
}

export type AppLinkCardTitleProps = ComponentPropsWithRef<"p">;

/**
 * The app's title for the item, up to 2 lines, then an ellipsis. Put a link
 * to the item in it: the title opens the item, in the title's ink.
 */
export function AppLinkCardTitle({ className, ...props }: AppLinkCardTitleProps) {
  const { title } = messageCard();
  return <p data-slot="app-link-card-title" className={title({ className })} {...props} />;
}

export type AppLinkCardMetaProps = ComponentPropsWithRef<"div">;

/** One state in an `AppLinkCardBadge`, then muted details. Wraps when it runs out of room. */
export function AppLinkCardMeta({ className, ...props }: AppLinkCardMetaProps) {
  const { meta } = messageCard();
  return <div data-slot="app-link-card-meta" className={meta({ className })} {...props} />;
}

// The card's surface, `layer-card` in tokens.json, in each mode, as oklch:
// the badge's ring is decided against it (app-link-card.test.tsx keeps the
// two equal).
export const APP_LINK_CARD_SURFACE = {
  light: [1, 0, 0],
  dark: [0.2596, 0.0037, 106.65],
} as const;

const CARD_SURFACE = {
  light: oklchToRgb(...APP_LINK_CARD_SURFACE.light),
  dark: oklchToRgb(...APP_LINK_CARD_SURFACE.dark),
};

const FILL_TEXT = { black: "oklch(0 0 0)", white: "oklch(1 0 0)" } as const;

/** The badge's custom properties for an app's fill, or null for no valid `#RRGGBB`. */
function badgeFillStyle(fill: string | undefined) {
  const rgb = fill === undefined ? null : parseHexColor(fill);
  if (!rgb) return null;
  const light = fillOnSurface(rgb, CARD_SURFACE.light);
  const dark = fillOnSurface(rgb, CARD_SURFACE.dark);
  return {
    "--badge-fill": fill,
    "--badge-fill-text": FILL_TEXT[light.text],
    "--badge-ring-light": light.ring ? "var(--line-hairline)" : "transparent",
    "--badge-ring-dark": dark.ring ? "var(--line-hairline)" : "transparent",
  } as CSSProperties;
}

export type AppLinkCardBadgeProps = Omit<BadgeProps, "appearance"> & {
  /**
   * The app's colour for the badge, `#RRGGBB`. Only the fill changes: the
   * type is black or white, whichever reads better on it, the same in light
   * and dark mode, with a hairline ring where the fill is too close to the
   * card's surface. Without it, or with any other value, and in forced
   * colours, the badge is the soft Badge of its `variant`.
   */
  fill?: string;
};

/**
 * The item's state in `AppLinkCardMeta`: a soft Badge in the app's words.
 * `variant` is its tone; `fill` takes the app's colour for it.
 */
export function AppLinkCardBadge({ fill, className, style, ...props }: AppLinkCardBadgeProps) {
  const fillStyle = useMemo(() => {
    const vars = badgeFillStyle(fill);
    return vars && { ...vars, ...style };
  }, [fill, style]);
  if (!fillStyle) {
    return <Badge appearance="soft" className={className} style={style} {...props} />;
  }
  const { badgeFill } = appLinkCard();
  return (
    <Badge appearance="soft" className={badgeFill({ className })} style={fillStyle} {...props} />
  );
}

export type AppLinkCardActionsProps = ComponentPropsWithRef<"div">;

/**
 * The app's buttons at the card's bottom end: at most two, the bordered one
 * last, with a More menu (⋯) to their left for the rest.
 */
export function AppLinkCardActions({ className, ...props }: AppLinkCardActionsProps) {
  const { actions } = messageCard();
  return <div data-slot="app-link-card-actions" className={actions({ className })} {...props} />;
}
