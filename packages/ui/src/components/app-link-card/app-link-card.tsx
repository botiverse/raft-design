import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import { messageEmbed } from "../message-embed/message-embed.recipe";
import { Skeleton } from "../skeleton/skeleton";

const appLinkCard = tv({
  slots: {
    // The card in the message, on the frame of a link card (MessageEmbed):
    // as wide as the hover card (400px) and never wider than the message.
    // In the phone layout it takes the message's width, so its buttons get
    // all the room a finger has. It keeps the gap a table or an image keeps
    // in the text (Markdown), and none at the message's top or bottom.
    root: [
      "flex w-full max-w-[400px] min-w-0 flex-col max-md:max-w-none",
      "my-2 first:mt-0 last:mb-0",
    ],
    // Raft's frame: the app's registered icon and its name, then the host,
    // above everything the app sends. Raft draws it from what it stores for
    // the app, never from the card's content, so an app's card can't pass for
    // a person's words or a system message.
    header: [
      "flex min-w-0 items-center gap-1.5",
      "border-b border-line-hairline px-4 py-2",
      "font-sans text-caption text-foreground-muted",
    ],
    icon: [
      "inline-flex size-4 shrink-0 items-center justify-center",
      "*:size-full *:shrink-0 [&>img]:rounded-[2px] [&>img]:object-cover",
    ],
    name: ["min-w-0 truncate", "font-semibold text-foreground"],
    // The host loses its start, never its end: the end is the part that says
    // where the link goes.
    host: ["flex min-w-0 items-baseline", "before:shrink-0 before:pe-1.5 before:content-['·']"],
    hostText: ["min-w-0 truncate"],
    body: ["flex min-w-0 flex-col gap-1.5", "px-4 py-3 last:pb-4"],
    // The item and its buttons as on the hover card (PreviewCard, size="item"):
    // a reader who has seen one reads the other.
    eyebrow: ["m-0 truncate", "font-mono text-mono-meta text-foreground-muted"],
    // The title opens the item: its link keeps the title's ink and is
    // underlined on hover, like a sender's name.
    title: [
      "m-0 line-clamp-2",
      "font-sans text-headline font-bold text-foreground",
      "[&_a]:rounded-[2px] [&_a]:decoration-[1.5px] [&_a]:underline-offset-[3px] [&_a]:hover:underline",
      "[&_a]:outline-none [&_a]:focus-visible:shadow-focus",
    ],
    meta: [
      "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1",
      "m-0 font-sans text-callout text-foreground-muted",
    ],
    actions: ["flex flex-wrap items-center justify-end gap-2", "px-4 pb-3 last:pb-4"],
    // The placeholder's lines take the line heights of the parts they stand
    // for, so the card that replaces it is the same size when its title takes
    // two lines and it has buttons (a Button at its default size, 32px).
    placeholderLine: ["flex h-lh items-center"],
    placeholderButton: ["h-8 md:pointer-fine:h-control w-28 rounded-control"],
  },
});

function frame(className: string | undefined) {
  const { root } = appLinkCard();
  return messageEmbed().root({ className: root({ className }) });
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
  const { body, eyebrow, title, meta, actions, placeholderLine, placeholderButton } = appLinkCard();
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
  const { header } = appLinkCard();
  return <div data-slot="app-link-card-header" className={header({ className })} {...props} />;
}

export type AppLinkCardIconProps = ComponentPropsWithRef<"span">;

/** The app's registered icon, the image Raft stores and serves: one child at 16px. */
export function AppLinkCardIcon({ className, ...props }: AppLinkCardIconProps) {
  const { icon } = appLinkCard();
  return <span data-slot="app-link-card-icon" className={icon({ className })} {...props} />;
}

export type AppLinkCardNameProps = ComponentPropsWithRef<"span">;

/** The app's name as Raft stores it. One line, truncated. */
export function AppLinkCardName({ className, ...props }: AppLinkCardNameProps) {
  const { name } = appLinkCard();
  return <span data-slot="app-link-card-name" className={name({ className })} {...props} />;
}

export type AppLinkCardHostProps = ComponentPropsWithRef<"span">;

/**
 * The link's host, after a "·". When it doesn't fit it loses its start, so
 * the end, which says where the link goes, stays.
 */
export function AppLinkCardHost({ className, children, ...props }: AppLinkCardHostProps) {
  const { host, hostText } = appLinkCard();
  return (
    <span data-slot="app-link-card-host" className={host({ className })} {...props}>
      <span dir="rtl" className={hostText()}>
        <span dir="ltr">{children}</span>
      </span>
    </span>
  );
}

export type AppLinkCardBodyProps = ComponentPropsWithRef<"div">;

/** The item: `AppLinkCardEyebrow`, `AppLinkCardTitle`, `AppLinkCardMeta`, in that order. */
export function AppLinkCardBody({ className, ...props }: AppLinkCardBodyProps) {
  const { body } = appLinkCard();
  return <div data-slot="app-link-card-body" className={body({ className })} {...props} />;
}

export type AppLinkCardEyebrowProps = ComponentPropsWithRef<"p">;

/** The app's id for the item, above the title. One line, truncated. */
export function AppLinkCardEyebrow({ className, ...props }: AppLinkCardEyebrowProps) {
  const { eyebrow } = appLinkCard();
  return <p data-slot="app-link-card-eyebrow" className={eyebrow({ className })} {...props} />;
}

export type AppLinkCardTitleProps = ComponentPropsWithRef<"p">;

/**
 * The app's title for the item, up to 2 lines, then an ellipsis. Put a link
 * to the item in it: the title opens the item, in the title's ink.
 */
export function AppLinkCardTitle({ className, ...props }: AppLinkCardTitleProps) {
  const { title } = appLinkCard();
  return <p data-slot="app-link-card-title" className={title({ className })} {...props} />;
}

export type AppLinkCardMetaProps = ComponentPropsWithRef<"div">;

/** One state in a neutral Badge, then muted details. Wraps when it runs out of room. */
export function AppLinkCardMeta({ className, ...props }: AppLinkCardMetaProps) {
  const { meta } = appLinkCard();
  return <div data-slot="app-link-card-meta" className={meta({ className })} {...props} />;
}

export type AppLinkCardActionsProps = ComponentPropsWithRef<"div">;

/**
 * The app's buttons at the card's bottom end: at most two, the bordered one
 * last, with a More menu (⋯) to their left for the rest.
 */
export function AppLinkCardActions({ className, ...props }: AppLinkCardActionsProps) {
  const { actions } = appLinkCard();
  return <div data-slot="app-link-card-actions" className={actions({ className })} {...props} />;
}
