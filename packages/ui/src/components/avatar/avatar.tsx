import type { ComponentPropsWithRef } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Avatar as AvatarPrimitive } from "@base-ui/react";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { StyledProps } from "../../lib/styled-props";

// Avatar family built on Base UI's Avatar primitive. Compose `<AvatarImage>`,
// `<AvatarFallback>`, and `<AvatarBadge>` as children; with no children a
// default `<AvatarFallback>` renders the placeholder. All parts share one
// `tv()` slots config so theme / type / size styling lives in a single place.
//
// The original's avatar fetching (`AgentAvatar` / `GravatarAvatar`, app domain)
// is dropped: pass a URL via `<AvatarImage src>` and a custom fallback node via
// `<AvatarFallback>`.
//
// `type` owns identity-keyed placeholder fills under brutal (`agent` → cyan,
// `human` → lavender), matching source AvatarSlot. Elegant keeps a neutral
// muted frame for both types.
//
// `size` is a compact t-shirt scale distilled from the original call-site
// contexts: xl profile/detail (64), lg mention/large identity (48), md panel
// header (36), sm list rows (32), xs compact rows (20), 2xs sidebar/DM rows
// (18), and 3xs inline preview chips (14). One-off source contexts such as
// account-tile, members-row, and creator-link no longer get public size names.
// Brutal border weight follows size: >=32px frames use `border-2`, smaller ones
// `AvatarFallback` and the default `AvatarBadge` dot auto-scale to the parent
// via its `data-size` + `group/avatar` hook; keep their per-step selectors in
// sync with the `size` scale. `AvatarBadge` is a useRender shell — pass
// `render={<Status />}` for activity chrome whose own `size` remains authoritative.
const BRUTAL_BADGE_PLACEMENT = [
  "right-0 bottom-0 translate-1/4 ",
  "group-data-[size=xl]/avatar:translate-[5px] ",
  "group-data-[size=lg]/avatar:translate-[calc(25%+2px)] ",
  "group-data-[size=md]/avatar:translate-[4.75px] ",
  "group-data-[size=sm]/avatar:translate-x-1 group-data-[size=sm]/avatar:translate-y-1",
  "group-data-[size=xs]/avatar:translate-[2.75px] ",
  "group-data-[size=2xs]/avatar:translate-[2.875px] ",
  "group-data-[size=3xs]/avatar:translate-[3.125px] ",
] as const;

const ELEGANT_BADGE_PLACEMENT = [
  "outline-2 outline-layer-panel",
  "group-data-[size=xl]/avatar:right-[3.667px] group-data-[size=xl]/avatar:bottom-[3.667px]",
  "group-data-[size=lg]/avatar:right-0.5 group-data-[size=lg]/avatar:bottom-0.5",
  "group-data-[size=md]/avatar:right-px group-data-[size=md]/avatar:bottom-px",
  "group-data-[size=sm]/avatar:right-[1.333px] group-data-[size=sm]/avatar:bottom-[1.333px]",
  "group-data-[size=xs]/avatar:right-[0.333px] group-data-[size=xs]/avatar:bottom-[0.333px]",
  "group-data-[size=2xs]/avatar:right-0 group-data-[size=2xs]/avatar:bottom-0",
  "group-data-[size=3xs]/avatar:right-[-0.667px] group-data-[size=3xs]/avatar:bottom-[-0.667px]",
] as const;

const avatar = tv({
  slots: {
    root: ["group/avatar relative flex shrink-0 items-center justify-center select-none"],
    image: ["size-full object-cover"],
    fallback: [
      "flex size-full items-center justify-center",
      "[&>svg]:size-4",
      "group-data-[size=xl]/avatar:[&>svg]:size-6",
      "group-data-[size=lg]/avatar:[&>svg]:size-6",
      "group-data-[size=md]/avatar:[&>svg]:size-4.5",
      "group-data-[size=sm]/avatar:[&>svg]:size-4",
      "group-data-[size=xs]/avatar:[&>svg]:size-3",
      "group-data-[size=2xs]/avatar:[&>svg]:size-2.5",
      "group-data-[size=3xs]/avatar:[&>svg]:size-2.5",
    ],
    // The default dot inherits the parent avatar's scale.
    badge: [
      "absolute z-10 size-2 select-none",
      "group-data-[size=xl]/avatar:size-3.5",
      "group-data-[size=lg]/avatar:size-3",
      "group-data-[size=md]/avatar:size-2.5",
      "group-data-[size=sm]/avatar:size-2",
      "group-data-[size=xs]/avatar:size-1.5",
      "group-data-[size=2xs]/avatar:size-1.5",
      "group-data-[size=3xs]/avatar:size-1.5",
    ],
    // A custom render owns its visual size; AvatarBadge contributes placement
    // without merging the default dot's parent-responsive size map.
    customBadge: ["absolute z-10 select-none"],
    dot: [
      "inline-flex items-center justify-center rounded-full outline-2 outline-white",
      "[&>svg]:hidden",
      "group-data-[size=xl]/avatar:[&>svg]:size-2 group-data-[size=xl]/avatar:[&>svg]:block",
      "group-data-[size=lg]/avatar:[&>svg]:size-2 group-data-[size=lg]/avatar:[&>svg]:block",
      "group-data-[size=md]/avatar:[&>svg]:size-1.5 group-data-[size=md]/avatar:[&>svg]:block",
      "group-data-[size=xs]/avatar:outline group-data-[size=2xs]/avatar:outline group-data-[size=3xs]/avatar:outline",
    ],
    group: ["group/avatar-group flex items-center"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-black text-black",
        fallback: "text-black",
        badge: BRUTAL_BADGE_PLACEMENT,
        customBadge: BRUTAL_BADGE_PLACEMENT,
        dot: ["bg-success text-foreground"],
        group: [
          "-space-x-1.5",
          "*:data-[slot=avatar]:outline *:data-[slot=avatar]:outline-2 *:data-[slot=avatar]:outline-primary-50",
          "*:data-[slot=avatar-group-count]:outline *:data-[slot=avatar-group-count]:outline-2 *:data-[slot=avatar-group-count]:outline-primary-50",
        ],
      },
      elegant: {
        root: ["bg-fill-muted"],
        image: ["rounded-full"],
        fallback: [
          "overflow-hidden bg-fill-muted text-foreground-placeholder/70 text-sm",
          "rounded-full",
          "group-data-[size=xs]/avatar:text-xs",
          "group-data-[size=2xs]/avatar:text-[10px]",
          "group-data-[size=3xs]/avatar:text-[10px]",
        ],
        badge: ELEGANT_BADGE_PLACEMENT,
        customBadge: ELEGANT_BADGE_PLACEMENT,
        dot: ["bg-success text-success-foreground outline-layer-panel"],
        group: [
          "-space-x-2",
          "*:data-[slot=avatar]:border-layer-canvas-muted",
          "*:data-[slot=avatar]:outline *:data-[slot=avatar]:outline-2 *:data-[slot=avatar]:outline-layer-canvas-muted",
          "*:data-[slot=avatar-group-count]:border-layer-canvas-muted",
          "*:data-[slot=avatar-group-count]:outline *:data-[slot=avatar-group-count]:outline-2 *:data-[slot=avatar-group-count]:outline-layer-canvas-muted",
        ],
      },
    },
    type: {
      agent: {},
      human: {},
    },
    size: {
      xl: { root: "size-16" },
      lg: { root: "size-12" },
      md: { root: "size-9" },
      sm: { root: "size-8" },
      xs: { root: "size-5" },
      "2xs": { root: "size-4.5" },
      "3xs": { root: "size-3.5" },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      size: ["xl", "lg", "md", "sm"],
      class: { root: "border-2" },
    },
    {
      theme: "brutal",
      size: ["xs", "2xs", "3xs"],
      class: { root: "border" },
    },
    // Elegant mirrors brutal's border scale with a transparent frame so both
    // themes render the same visual image diameter per size step; clip the
    // root fill to the padding box so no ring shows through the frame.
    {
      theme: "elegant",
      size: ["xl", "lg", "md", "sm"],
      class: { root: "border-2 border-transparent bg-clip-padding" },
    },
    {
      theme: "elegant",
      size: ["xs", "2xs", "3xs"],
      class: { root: "border border-transparent bg-clip-padding" },
    },
    // Identity-keyed placeholder fills (source AvatarSlot parity): cyan agent /
    // lavender human. Only visible when fallback content shows; real images
    // cover the frame edge-to-edge.
    {
      theme: "brutal",
      type: "agent",
      class: { root: "bg-brutal-cyan" },
    },
    {
      theme: "brutal",
      type: "human",
      class: { root: "bg-brutal-lavender text-black" },
    },
    {
      theme: "elegant",
      size: "xl",
      class: {
        root: "rounded-full",
      },
    },
    {
      theme: "elegant",
      size: "lg",
      class: {
        root: "rounded-full",
      },
    },
    {
      theme: "elegant",
      size: ["md", "sm"],
      class: {
        root: "rounded-full",
      },
    },
    {
      theme: "elegant",
      size: "xs",
      class: {
        root: "rounded-full",
      },
    },
    {
      theme: "elegant",
      size: ["2xs", "3xs"],
      class: {
        root: "rounded-full",
      },
    },
    {
      theme: "elegant",
      type: "agent",
      class: { root: "text-foreground-muted" },
    },
    {
      theme: "elegant",
      type: "human",
      class: { root: "text-foreground-muted" },
    },
  ],
});

export type AvatarSize = NonNullable<VariantProps<typeof avatar>["size"]>;

export type AvatarProps = StyledProps<AvatarPrimitive.Root.Props> &
  Required<Pick<VariantProps<typeof avatar>, "size" | "type">>;

export function Avatar({ size, type, className, children, ...props }: AvatarProps) {
  const theme = useThemeFamily();
  const { root } = avatar({ theme, type, size });
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
  const theme = useThemeFamily();
  const { image } = avatar({ theme });
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
  const theme = useThemeFamily();
  const { fallback } = avatar({ theme });
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

export type AvatarBadgeProps = useRender.ComponentProps<"span">;

// Corner presence shell. The parent avatar owns placement and the default dot's
// responsive size; a custom render keeps its own visual size.
export function AvatarBadge({ className, render, ...props }: AvatarBadgeProps) {
  const theme = useThemeFamily();
  const { badge, customBadge, dot } = avatar({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: render
      ? customBadge({ className })
      : badge({
          className: dot({ className }),
        }),
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
// ring color follows the active theme's surface assumptions. The standalone
// frame is a transparent border, so in the stack each avatar's frame is painted
// with the ring surface (layer-canvas-muted) to stay opaque and never show the avatar
// neighbor beneath the overlap.
export function AvatarGroup({ className, ...props }: AvatarGroupProps) {
  const theme = useThemeFamily();
  const { group } = avatar({ theme });
  return <div data-slot="avatar-group" className={group({ className })} {...props} />;
}

export type AvatarGroupCountProps = ComponentPropsWithRef<"span"> & {
  /** Matches the frame scale of the sibling avatars. */
  size: AvatarSize;
};

// Trailing "+N" overflow chip for an AvatarGroup. Reuses the Avatar frame but
// omits `type`, swapping the role fill for a neutral count chip.
export function AvatarGroupCount({ size, className, ...props }: AvatarGroupCountProps) {
  const theme = useThemeFamily();
  const { root } = avatar({ theme, size });
  const countClassName =
    theme === "elegant"
      ? "bg-fill-muted font-medium text-xs leading-none tabular-nums text-foreground-muted"
      : "bg-secondary-400 font-bold text-xs leading-none tabular-nums text-foreground";
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
