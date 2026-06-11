import type { ComponentPropsWithRef } from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react";
import { User } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { StyledProps } from "../../lib/styled-props.ts";

// Avatar family: a black-bordered frame carrying a role-keyed bg (`agent` → cyan,
// `human` → lavender), built on Base UI's Avatar primitive. Compose
// `<AvatarImage>`, `<AvatarFallback>`, and `<AvatarBadge>` as children; with no
// children a default `<AvatarFallback>` renders the role-tinted placeholder. All
// parts share one `tv()` slots config so theme / type / size styling lives in a
// single place — ready for the elegant family to add per-slot overrides under
// `theme`.
//
// The original's avatar fetching (`AgentAvatar` / `GravatarAvatar`, app domain)
// is dropped: pass a URL via `<AvatarImage src>` and a custom fallback node via
// `<AvatarFallback>`.
//
// `size` is a t-shirt scale; each step maps to one of the original call-site
// "contexts" (preserved here so existing usages keep their exact dimensions):
//   3xl → profile-tile (64) │ 2xl → account-tile (56) │ xl  → mention-card (48)
//   lg  → panel-header (36) │ md  → surface-list (32) │ sm  → members-row (28)
//   xs  → creator-link (22) │ 2xs → compact-list (20) │ 3xs → sidebar-list (18)
//   4xs → preview-mini (14)
// Border weight follows size: ≥32px frames use `border-2`, smaller ones `border`.
// `AvatarFallback` / `AvatarBadge` auto-scale to the parent via its `data-size` +
// `group/avatar` hook; keep their per-step selectors in sync with the `size` scale.
const avatar = tv({
  slots: {
    root: ["group/avatar relative flex shrink-0 items-center justify-center overflow-hidden"],
    image: ["size-full object-cover"],
    fallback: [
      "flex size-full items-center justify-center",
      "[&>svg]:size-4",
      "group-data-[size=3xl]/avatar:[&>svg]:size-8",
      "group-data-[size=2xl]/avatar:[&>svg]:size-6",
      "group-data-[size=xl]/avatar:[&>svg]:size-6",
      "group-data-[size=lg]/avatar:[&>svg]:size-[18px]",
      "group-data-[size=md]/avatar:[&>svg]:size-4",
      "group-data-[size=sm]/avatar:[&>svg]:size-3.5",
      "group-data-[size=xs]/avatar:[&>svg]:size-3",
      "group-data-[size=2xs]/avatar:[&>svg]:size-3",
      "group-data-[size=3xs]/avatar:[&>svg]:size-2.5",
      "group-data-[size=4xs]/avatar:[&>svg]:size-2.5",
    ],
    badge: [
      "absolute right-0 bottom-0 z-10 select-none",
      "inline-flex items-center justify-center rounded-full border-2",
      "size-2.5 [&>svg]:size-2",
      "group-data-[size=3xl]/avatar:size-5 group-data-[size=3xl]/avatar:[&>svg]:size-3",
      "group-data-[size=2xl]/avatar:size-4 group-data-[size=2xl]/avatar:[&>svg]:size-2.5",
      "group-data-[size=xl]/avatar:size-3.5 group-data-[size=xl]/avatar:[&>svg]:size-2.5",
      "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
      "group-data-[size=md]/avatar:size-2.5 group-data-[size=md]/avatar:[&>svg]:size-2",
      "group-data-[size=sm]/avatar:size-2.5 group-data-[size=sm]/avatar:[&>svg]:size-2",
      "group-data-[size=xs]/avatar:size-2 group-data-[size=xs]/avatar:border group-data-[size=xs]/avatar:[&>svg]:hidden",
      "group-data-[size=2xs]/avatar:size-2 group-data-[size=2xs]/avatar:border group-data-[size=2xs]/avatar:[&>svg]:hidden",
      "group-data-[size=3xs]/avatar:size-1.5 group-data-[size=3xs]/avatar:border group-data-[size=3xs]/avatar:[&>svg]:hidden",
      "group-data-[size=4xs]/avatar:size-1.5 group-data-[size=4xs]/avatar:border group-data-[size=4xs]/avatar:[&>svg]:hidden",
    ],
    group: [
      "group/avatar-group flex items-center -space-x-1.5",
      "*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-primary-50",
      "*:data-[slot=avatar-group-count]:ring-2 *:data-[slot=avatar-group-count]:ring-primary-50",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-line-strong",
        badge: ["border-line-strong bg-success-base text-foreground-strong"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    type: {
      agent: { root: "bg-info-base" },
      human: { root: "bg-accent-300 text-foreground-strong" },
    },
    size: {
      "3xl": { root: "size-16 border-2" },
      "2xl": { root: "size-14 border-2" },
      xl: { root: "size-12 border-2" },
      lg: { root: "size-9 border-2" },
      md: { root: "size-8 border-2" },
      sm: { root: "size-7 border" },
      xs: { root: "size-[22px] border" },
      "2xs": { root: "size-5 border" },
      "3xs": { root: "size-[18px] border" },
      "4xs": { root: "size-[14px] border" },
    },
  },
});

export type AvatarSize = NonNullable<VariantProps<typeof avatar>["size"]>;

export type AvatarProps = StyledProps<AvatarPrimitive.Root.Props> &
  Required<Pick<VariantProps<typeof avatar>, "size" | "type">>;

export function Avatar({ size, type, className, children, ...props }: AvatarProps) {
  const theme = useTheme();
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
  const { image } = avatar();
  return (
    <AvatarPrimitive.Image data-slot="avatar-image" className={image({ className })} {...props} />
  );
}

export type AvatarFallbackProps = StyledProps<AvatarPrimitive.Fallback.Props>;

// Shown when no AvatarImage has loaded. Centers its content over the role-tinted
// frame (transparent, so the role bg shows through). With no children it renders
// the placeholder `User` icon, auto-scaled via the parent's `data-size` hook.
export function AvatarFallback({ className, children, ...props }: AvatarFallbackProps) {
  const { fallback } = avatar();
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={fallback({ className })}
      {...props}
    >
      {children ?? <User />}
    </AvatarPrimitive.Fallback>
  );
}

export type AvatarBadgeProps = ComponentPropsWithRef<"span">;

// Presence/status badge overlaid in the avatar's bottom-right corner. Sits flush
// inside the frame (not clipped by its `overflow-hidden`). Default fill is lime;
// override with a `bg-*` class via className. Optionally wraps a small icon.
export function AvatarBadge({ className, ...props }: AvatarBadgeProps) {
  const theme = useTheme();
  const { badge } = avatar({ theme });
  return <span data-slot="avatar-badge" className={badge({ className })} {...props} />;
}

export type AvatarGroupProps = ComponentPropsWithRef<"div">;

// Overlapping stack of avatars (and an optional trailing AvatarGroupCount). Each
// member gets a cream ring so the overlap reads as a clean gap; override the ring
// color via className when the surface behind isn't cream.
export function AvatarGroup({ className, ...props }: AvatarGroupProps) {
  const { group } = avatar();
  return <div data-slot="avatar-group" className={group({ className })} {...props} />;
}

export type AvatarGroupCountProps = ComponentPropsWithRef<"span"> & {
  /** Matches the frame scale of the sibling avatars. */
  size: AvatarSize;
};

// Trailing "+N" overflow chip for an AvatarGroup. Reuses the Avatar frame (same
// size + border per step) but omits `type`, swapping the role fill for a neutral
// stone chip with centered tabular text.
export function AvatarGroupCount({ size, className, ...props }: AvatarGroupCountProps) {
  const theme = useTheme();
  const { root } = avatar({ theme, size });
  return (
    <span
      data-slot="avatar-group-count"
      className={root({
        class: [
          "bg-secondary-400 font-bold text-xs leading-none tabular-nums text-foreground-strong",
          className,
        ],
      })}
      {...props}
    />
  );
}
