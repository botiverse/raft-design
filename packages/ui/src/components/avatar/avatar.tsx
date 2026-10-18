import type { ComponentPropsWithRef } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Avatar as AvatarPrimitive } from "@base-ui/react";
import { cn } from "../../lib/cn";
import { PRESENCE_COLOR } from "../../lib/presence";
import type { Presence } from "../../lib/presence";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

// Avatar family built on Base UI's Avatar primitive. Compose `<AvatarImage>`,
// `<AvatarFallback>`, and `<AvatarBadge>` as children; with no children a
// default `<AvatarFallback>` renders the placeholder. All parts share one
// `tv()` slots config so type and size styling live in a single place.
//
// The original's avatar fetching (`AgentAvatar` / `GravatarAvatar`, app domain)
// is dropped: pass a URL via `<AvatarImage src>` and a custom fallback node via
// `<AvatarFallback>`.
//
// Every identity is a square sticker (ink edge, die-cut ring in dark): people
// without a photo sit on lavender, agents on stone until their sprite (which
// carries its own colour) covers it.
//
// Sizes are the design system's 8n + 3 steps, one per role: xl 99 (profile
// page, hard sticker shadow), lg 51, md 35, sm 27, xs / 2xs 19. 3xs keeps 14
// — the system has no miniature identity.
//
// `size` is a compact t-shirt scale distilled from the original call-site
// contexts: xl profile/detail (64), lg mention/large identity (48), md panel
// header (36), sm list rows (32), xs compact rows (20), 2xs sidebar/DM rows
// (18), and 3xs inline preview chips (14). One-off source contexts such as
// account-tile, members-row, and creator-link no longer get public size names.
// `AvatarFallback` / `AvatarBadge` auto-scale to the parent via its `data-size` +
// `group/avatar` hook when using the default dot; keep their per-step selectors
// in sync with the `size` scale. `AvatarBadge` is a useRender shell — pass
// `render={<Status />}` for activity chrome without the default dot styles.
const avatar = tv({
  slots: {
    root: [
      "group/avatar relative flex shrink-0 items-center justify-center select-none",
      "rounded-sticker border-[1.5px] border-sticker-ink",
      "text-sticker-ink shadow-[0_0_0_1.5px_var(--sticker-edge)]",
    ],
    image: ["size-full object-cover", "rounded-[2px]"],
    fallback: [
      "flex size-full items-center justify-center",
      "[&>svg]:size-4",
      "group-data-[size=lg]/avatar:[&>svg]:size-6",
      "group-data-[size=md]/avatar:[&>svg]:size-4.5",
      "group-data-[size=xs]/avatar:[&>svg]:size-3",
      "overflow-hidden rounded-[2px]",
      "font-sans text-[15px] leading-none font-bold tracking-[-0.01em] text-sticker-ink",
      "group-data-[size=xl]/avatar:text-[40px]",
      "group-data-[size=lg]/avatar:text-[22px]",
      "group-data-[size=sm]/avatar:text-[13px]",
      "group-data-[size=xs]/avatar:text-[11px]",
      "group-data-[size=2xs]/avatar:text-[11px]",
      "group-data-[size=3xs]/avatar:text-[8px]",
      "group-data-[size=xl]/avatar:[&>svg]:size-12",
      "group-data-[size=sm]/avatar:[&>svg]:size-3.5",
      "group-data-[size=2xs]/avatar:[&>svg]:size-3",
      "group-data-[size=3xs]/avatar:[&>svg]:size-2",
    ],
    // The corner shell owns placement and scale. The default dot only adds
    // its visual chrome; custom indicators inherit this same size mapping.
    badge: [
      "absolute z-10 select-none",
      "size-[11px] -right-1 -bottom-1 rounded-[2px]",
      "outline-2 outline-solid outline-layer-panel",
      "group-data-[size=xl]/avatar:size-5 group-data-[size=xl]/avatar:-right-2 group-data-[size=xl]/avatar:-bottom-2",
      "group-data-[size=lg]/avatar:size-3.5 group-data-[size=lg]/avatar:right-[-5px] group-data-[size=lg]/avatar:bottom-[-5px]",
      "group-data-[size=md]/avatar:size-[11px]",
      "group-data-[size=sm]/avatar:size-[9px] group-data-[size=sm]/avatar:right-[-3px] group-data-[size=sm]/avatar:bottom-[-3px]",
      "group-data-[size=xs]/avatar:size-[9px] group-data-[size=xs]/avatar:right-[-3px] group-data-[size=xs]/avatar:bottom-[-3px]",
      "group-data-[size=2xs]/avatar:size-[9px] group-data-[size=2xs]/avatar:right-[-3px] group-data-[size=2xs]/avatar:bottom-[-3px]",
      "group-data-[size=3xs]/avatar:size-1.5 group-data-[size=3xs]/avatar:-right-0.5 group-data-[size=3xs]/avatar:-bottom-0.5",
    ],
    dot: [
      "inline-flex items-center justify-center outline-2",
      "[&>svg]:hidden",
      "group-data-[size=xl]/avatar:[&>svg]:size-2 group-data-[size=xl]/avatar:[&>svg]:block",
      "group-data-[size=lg]/avatar:[&>svg]:size-2 group-data-[size=lg]/avatar:[&>svg]:block",
      "group-data-[size=md]/avatar:[&>svg]:size-1.5 group-data-[size=md]/avatar:[&>svg]:block",
      "group-data-[size=xs]/avatar:outline group-data-[size=2xs]/avatar:outline group-data-[size=3xs]/avatar:outline",
      "rounded-[2px] border-[1.5px] border-sticker-ink",
      "bg-(--status-color) text-sticker-ink outline-layer-panel",
      "group-data-[size=xl]/avatar:border-2",
      "group-data-[size=3xs]/avatar:border",
    ],
    group: [
      "group/avatar-group flex items-center",
      "space-x-[-5px]",
      "*:data-[slot=avatar]:shadow-[0_0_0_1.5px_var(--sticker-edge),0_0_0_3px_var(--layer-panel)]",
      "*:data-[slot=avatar-group-count]:shadow-[0_0_0_1.5px_var(--sticker-edge),0_0_0_3px_var(--layer-panel)]",
    ],
  },
  variants: {
    type: {
      agent: { root: ["bg-inactive"] },
      human: { root: ["bg-brutal-lavender"] },
    },
    size: {
      xl: {
        root: ["size-[99px] shadow-[0_0_0_1.5px_var(--sticker-edge),var(--theme-shadow-sticker)]"],
      },
      lg: { root: ["size-[51px]"] },
      md: { root: ["size-[35px]"] },
      sm: { root: ["size-[27px]"] },
      xs: { root: ["size-[19px]"] },
      "2xs": { root: ["size-[19px]"] },
      "3xs": { root: "size-3.5" },
    },
  },
});

export type AvatarSize = NonNullable<VariantProps<typeof avatar>["size"]>;

export type AvatarProps = StyledProps<AvatarPrimitive.Root.Props> &
  Required<Pick<VariantProps<typeof avatar>, "size" | "type">>;

export function Avatar({ size, type, className, children, ...props }: AvatarProps) {
  const { root } = avatar({ type, size });
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={root({ className })}
      {...props}
    >
      {children ?? <AvatarFallback />}
    </AvatarPrimitive.Root>
  );
}

export type AvatarImageProps = StyledProps<AvatarPrimitive.Image.Props>;

// Managed avatar image. Base UI tracks its load state and hides it (revealing the
// fallback) while loading or on error. Fills the frame edge-to-edge.
export function AvatarImage({ className, ...props }: AvatarImageProps) {
  const { image } = avatar();
  return (
    <AvatarPrimitive.Image data-slot="avatar-image" className={image({ className })} {...props} />
  );
}

export type AvatarFallbackProps = StyledProps<AvatarPrimitive.Fallback.Props>;

function AvatarFallbackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        stroke="currentColor"
      >
        <circle cx="9" cy="7.75" r="2" />
        <path d="M9,16.25c1.407,0,2.716-.407,3.827-1.101-.481-1.67-2.003-2.899-3.827-2.899s-3.347,1.229-3.827,2.899c1.112,.694,2.42,1.101,3.827,1.101Z" />
        <circle
          cx="1.889"
          cy="10.414"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle
          cx="2.971"
          cy="4.972"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle
          cx="2.972"
          cy="13.027"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle cx="1.89" cy="7.586" r=".75" fill="currentColor" data-stroke="none" stroke="none" />
        <circle
          cx="4.973"
          cy="2.972"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle
          cx="7.586"
          cy="1.889"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle
          cx="15.029"
          cy="13.028"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle
          cx="16.111"
          cy="7.586"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle
          cx="13.028"
          cy="2.971"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle
          cx="16.11"
          cy="10.414"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle
          cx="15.028"
          cy="4.973"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
        <circle
          cx="10.414"
          cy="1.89"
          r=".75"
          fill="currentColor"
          data-stroke="none"
          stroke="none"
        />
      </g>
    </svg>
  );
}

// Shown when no AvatarImage has loaded. With no children it renders the
// placeholder user icon, auto-scaled via the parent's `data-size` hook.
export function AvatarFallback({ className, children, ...props }: AvatarFallbackProps) {
  const { fallback } = avatar();
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={fallback({ className })}
      {...props}
    >
      {children ?? <AvatarFallbackIcon />}
    </AvatarPrimitive.Fallback>
  );
}

export type AvatarBadgeOffset = [x: string | number, y: string | number];

export type AvatarBadgeProps = useRender.ComponentProps<"span"> & {
  /** The default dot's status light: online (the default), busy, error,
   *  offline or external. Ignored when `render` draws its own indicator. */
  presence?: Presence;
  /** Where the badge's centre sits, measured from the avatar's top-left:
   *  `[x, y]`. Numbers are px; strings are any CSS length, and percentages
   *  are of the avatar's size, so `["100%", 0]` is the top-right corner at
   *  every size. Omit it to keep the default bottom-right spot. */
  offset?: AvatarBadgeOffset;
};

const toCssLength = (value: string | number) => (typeof value === "number" ? `${value}px` : value);

// Corner presence shell. The parent avatar owns placement and size; the default
// dot or a custom render only supplies the visual state. `offset` replaces the
// recipe's corner placement with an explicit centre point.
export function AvatarBadge({
  className,
  render,
  offset,
  presence = "online",
  ...props
}: AvatarBadgeProps) {
  const { badge, dot } = avatar();
  const offsetStyle = offset
    ? {
        top: toCssLength(offset[1]),
        left: toCssLength(offset[0]),
        right: "auto",
        bottom: "auto",
        translate: "-50% -50%",
      }
    : undefined;
  const defaultProps: useRender.ElementProps<"span"> = {
    className: badge({
      className: render ? className : dot({ className: cn(PRESENCE_COLOR[presence], className) }),
    }),
    style: offsetStyle,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "avatar-badge" },
  });
}

export type AvatarGroupProps = ComponentPropsWithRef<"div">;

// Overlapping stack of avatars (and an optional trailing AvatarGroupCount). The
// standalone frame is a transparent border, so in the stack each avatar's frame is painted
// with the ring surface (layer-canvas-muted) to stay opaque and never show the avatar
// neighbor beneath the overlap.
export function AvatarGroup({ className, ...props }: AvatarGroupProps) {
  const { group } = avatar();
  return <div data-slot="avatar-group" className={group({ className })} {...props} />;
}

export type AvatarGroupCountProps = ComponentPropsWithRef<"span"> & {
  /** Matches the frame scale of the sibling avatars. */
  size: AvatarSize;
};

// Trailing "+N" overflow chip for an AvatarGroup. Reuses the Avatar frame but
// omits `type`, swapping the role fill for a neutral count chip.
export function AvatarGroupCount({ size, className, ...props }: AvatarGroupCountProps) {
  const { root } = avatar({ size });
  const countClassName =
    "border-transparent bg-fill-muted font-mono text-mono-meta font-bold tabular-nums text-foreground-muted shadow-none";
  return (
    <span
      data-slot="avatar-group-count"
      className={root({
        class: [countClassName, className],
      })}
      {...props}
    />
  );
}
