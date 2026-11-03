import type { ComponentPropsWithRef } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Avatar as AvatarPrimitive } from "@base-ui/react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cn } from "../../lib/cn";
import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
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
// The fallback sizes itself from its own avatar (`[data-size=…]>&`), not
// from any avatar around it (`group-data-*`), so an avatar inside another
// (an assistant's face on its owner's) keeps its own icon and initials size.
//
// Every identity is a square sticker (ink edge, die-cut ring in dark): people
// without a photo sit on lavender, agents on stone until their sprite (which
// carries its own colour) covers it, and servers on ink with a yellow initial
// until their logo covers it.
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
// On a desktop an avatar is rounded by its size, about a quarter of the
// control roundness: 19 -> 4, 27 -> 6, 35 -> 8, 51 and 99 -> 10. The image
// and the fallback inside the 1.5px edge keep the concentric corner.
const avatarInnerRadius = [
  "md:pointer-fine:group-data-[size=sm]/avatar:rounded-[4.5px]",
  "md:pointer-fine:group-data-[size=md]/avatar:rounded-[6.5px]",
  "md:pointer-fine:group-data-[size=lg]/avatar:rounded-[8.5px] md:pointer-fine:group-data-[size=xl]/avatar:rounded-[8.5px]",
];

const avatar = tv({
  slots: {
    root: [
      "group/avatar relative flex shrink-0 items-center justify-center select-none",
      "rounded-sticker border-[1.5px] border-sticker-ink",
      "text-sticker-ink shadow-[0_0_0_1.5px_var(--sticker-edge)]",
    ],
    image: ["size-full object-cover", "rounded-[2px]", avatarInnerRadius],
    fallback: [
      "flex size-full items-center justify-center",
      "[&>svg]:size-4",
      "[[data-size='lg']>&]:[&>svg]:size-6",
      "[[data-size='md']>&]:[&>svg]:size-4.5",
      "[[data-size='xs']>&]:[&>svg]:size-3",
      "overflow-hidden rounded-[2px]",
      avatarInnerRadius,
      "font-sans text-[15px] leading-none font-bold tracking-[-0.01em] text-sticker-ink",
      "[[data-type='server']>&]:text-brand",
      "[[data-size='xl']>&]:text-[40px]",
      "[[data-size='lg']>&]:text-[22px]",
      "[[data-size='sm']>&]:text-[13px]",
      "[[data-size='xs']>&]:text-[11px]",
      "[[data-size='2xs']>&]:text-[11px]",
      "[[data-size='3xs']>&]:text-[8px]",
      "[[data-size='xl']>&]:[&>svg]:size-12",
      "[[data-size='sm']>&]:[&>svg]:size-3.5",
      "[[data-size='2xs']>&]:[&>svg]:size-3",
      "[[data-size='3xs']>&]:[&>svg]:size-2",
    ],
    // The corner shell owns placement and scale. The default dot only adds
    // its visual chrome; custom indicators inherit this same size mapping.
    // The light stays about a third of the avatar or less: on a 19px avatar a
    // 9px light plus its 2px cut-out covered nearly half the face.
    badge: [
      "absolute z-10 select-none",
      "size-[11px] -right-1 -bottom-1 rounded-[2px]",
      "outline-2 outline-solid outline-layer-canvas",
      "group-data-[size=xl]/avatar:size-5 group-data-[size=xl]/avatar:-right-2 group-data-[size=xl]/avatar:-bottom-2",
      "group-data-[size=lg]/avatar:size-3.5 group-data-[size=lg]/avatar:right-[-5px] group-data-[size=lg]/avatar:bottom-[-5px]",
      "group-data-[size=md]/avatar:size-[11px]",
      "group-data-[size=sm]/avatar:size-[9px] group-data-[size=sm]/avatar:right-[-3px] group-data-[size=sm]/avatar:bottom-[-3px]",
      "group-data-[size=xs]/avatar:size-[7px] group-data-[size=xs]/avatar:-right-0.5 group-data-[size=xs]/avatar:-bottom-0.5",
      "group-data-[size=2xs]/avatar:size-[7px] group-data-[size=2xs]/avatar:-right-0.5 group-data-[size=2xs]/avatar:-bottom-0.5",
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
      "bg-(--status-color) text-sticker-ink outline-layer-canvas",
      "group-data-[size=xl]/avatar:border-2",
      "group-data-[size=xs]/avatar:border group-data-[size=2xs]/avatar:border group-data-[size=3xs]/avatar:border",
    ],
    // Faces lie directly on one another, 5px over the one before at every
    // size, with no ring of the surface between them: each sticker's own ink
    // edge (and its die-cut edge in dark) parts it from the face beneath, as
    // in Working now (stdrc, 2026-11-04, #proj-raft-ui:7531279d). 5px is past
    // the 4px corner, so the seam sits on the straight edge, never in the
    // corner; 3px or 4px leaves a notch of the surface between two corners.
    group: ["group/avatar-group flex items-center", "stack-x-[-5px]"],
    groupButton: [
      "relative inline-flex shrink-0 cursor-pointer items-center p-1",
      "rounded-chip border-0 bg-transparent",
      "transition-colors enabled:hover:bg-fill-medium enabled:active:bg-fill-medium",
      "outline-none focus-visible:shadow-focus",
      "disabled:cursor-default",
    ],
  },
  variants: {
    type: {
      agent: { root: ["bg-inactive"] },
      human: { root: ["bg-palette-lavender"] },
      // A server's avatar, the workspace tile: ink, with the server's
      // initial in yellow until its logo covers it.
      server: { root: ["bg-sticker-ink"] },
    },
    size: {
      xl: {
        root: [
          "size-[99px] md:pointer-fine:rounded-container shadow-[0_0_0_1.5px_var(--sticker-edge),var(--elevation-sticker)]",
        ],
      },
      lg: { root: ["size-[51px] md:pointer-fine:rounded-container"] },
      md: { root: ["size-[35px] md:pointer-fine:rounded-control"] },
      sm: { root: ["size-[27px] md:pointer-fine:rounded-chip"] },
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
      data-type={type}
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

export type AvatarGroupProps = useRender.ComponentProps<"div">;

// Overlapping stack of avatars (and an optional trailing AvatarGroupCount): each
// one lies 5px over the one before, with nothing between them. A sticker's fill
// and its ink edge are opaque, so the face beneath never shows through, and the
// edge parts the two faces on any surface; the count chip's fill is opaque too.
// A div by default; `render={<span />}` puts a stack where only phrasing content
// may go (a header's <p>, inside a button).
export function AvatarGroup({ className, render, ...props }: AvatarGroupProps) {
  const { group } = avatar();
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: group({ className }) }, props),
    state: { slot: "avatar-group" },
  });
}

export type AvatarGroupButtonProps = StyledProps<BaseButton.Props> & DataAttributes;

// An AvatarGroup that is a button: a stack that opens who is in it (who is
// viewing, a channel's members), usually as a PopoverTrigger's `render`. The
// stack sits 4px inside the button's hover fill, so the stack hovers as one
// control. Name it with the full count and what it opens ("3 people
// viewing"): the faces are not text.
export function AvatarGroupButton({
  className,
  render,
  nativeButton,
  ...props
}: AvatarGroupButtonProps) {
  const { group, groupButton } = avatar();
  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      data-slot="avatar-group-button"
      className={group({ class: [groupButton(), className] })}
    />
  );
}

export type AvatarGroupCountProps = ComponentPropsWithRef<"span"> & {
  /** Matches the frame scale of the sibling avatars. */
  size: AvatarSize;
};

// Trailing "+N" overflow chip for an AvatarGroup. Reuses the Avatar frame (its
// ink edge, and the die-cut edge in dark, like every face beside it) but omits
// `type`, swapping the role fill for a neutral count chip.
export function AvatarGroupCount({ size, className, ...props }: AvatarGroupCountProps) {
  const { root } = avatar({ size });
  const countClassName =
    "bg-fill-muted font-mono text-mono-meta font-bold tabular-nums text-foreground-muted";
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
