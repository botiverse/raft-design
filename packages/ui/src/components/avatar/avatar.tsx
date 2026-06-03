import type { ComponentPropsWithRef, ReactNode } from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { User } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Canonical avatar container — a black-bordered frame carrying a role-keyed bg
// (`agent` → cyan, `human` → lavender). Built on Base UI's Avatar primitive so a
// managed image (`<AvatarImage src>`) gracefully reveals the fallback while
// loading or on error; the fallback is the role-tinted frame + placeholder `User`
// icon, or a custom node via the `fallback` prop. `children` is reserved for
// overlays composed inside the frame (e.g. `<AvatarBadge>`).
//
// The original's avatar fetching (`AgentAvatar` / `GravatarAvatar`, app domain)
// is dropped: pass the resolved image element via `fallback`, or a URL via
// `<AvatarImage src>`.
//
// `size` is a t-shirt scale; each step maps to one of the original call-site
// "contexts" (preserved here so existing usages keep their exact dimensions):
//   3xl → profile-tile (64) │ 2xl → account-tile (56) │ xl  → mention-card (48)
//   lg  → panel-header (36) │ md  → surface-list (32) │ sm  → members-row (28)
//   xs  → creator-link (22) │ 2xs → compact-list (20) │ 3xs → sidebar-list (18)
//   4xs → preview-mini (14)
// Border weight follows size: ≥32px frames use `border-2`, smaller ones `border`.

// Two slots: the `root` frame and the placeholder `icon`. The `size` variant
// drives both — frame dimensions + border weight on `root`, the matching `<User>`
// icon size on `icon` (the original's standalone `placeholderIcon` map, now a
// slot). Exported so AvatarGroupCount can reuse the `root` frame (omitting `type`
// for a neutral chip) without duplicating the scale.
export const avatar = tv({
  slots: {
    root: ["group/avatar relative flex shrink-0 items-center justify-center overflow-hidden"],
    icon: [],
  },
  variants: {
    theme: {
      brutal: { root: "border-black" },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    type: {
      agent: { root: "bg-brutal-cyan" },
      human: { root: "bg-brutal-lavender text-black" },
    },
    size: {
      "3xl": { root: "size-16 border-2", icon: "size-8" },
      "2xl": { root: "size-14 border-2", icon: "size-6" },
      xl: { root: "size-12 border-2", icon: "size-6" },
      lg: { root: "size-9 border-2", icon: "size-[18px]" },
      md: { root: "size-8 border-2", icon: "size-4" },
      sm: { root: "size-7 border", icon: "size-3.5" },
      xs: { root: "size-[22px] border", icon: "size-3" },
      "2xs": { root: "size-5 border", icon: "size-3" },
      "3xs": { root: "size-[18px] border", icon: "size-2.5" },
      "4xs": { root: "size-[14px] border", icon: "size-2.5" },
    },
  },
});

export type AvatarSize = NonNullable<VariantProps<typeof avatar>["size"]>;

export type AvatarProps = Omit<ComponentPropsWithRef<"span">, "children"> &
  Required<Pick<VariantProps<typeof avatar>, "size" | "type">> & {
    /** Custom fallback content shown when no image loads. Defaults to the role-tinted User placeholder. */
    fallback?: ReactNode;
    /** Overlays composed inside the frame, e.g. `<AvatarBadge>`. */
    children?: ReactNode;
  };

export function Avatar({ size, type, className, fallback, children, ...props }: AvatarProps) {
  const theme = useTheme();
  const { root, icon } = avatar({ theme, type, size });
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={root({ class: className })}
      {...props}
    >
      {children}
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center">
        {fallback ?? <User className={icon()} />}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
