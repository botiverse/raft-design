import type { ComponentPropsWithRef, ReactNode } from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import { AvatarFallback } from "./avatar-fallback.tsx";

// Canonical avatar container — a black-bordered frame carrying a role-keyed bg
// (`agent` → cyan, `human` → lavender). Built on Base UI's Avatar primitive:
// compose `<AvatarImage>`, `<AvatarFallback>`, and `<AvatarBadge>` as children.
// With no children a default `<AvatarFallback>` renders the role-tinted placeholder.
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
// Exported so AvatarGroupCount can reuse the frame (omitting `type` for a neutral
// chip) without duplicating the scale.
export const avatar = tv({
  base: ["group/avatar relative flex shrink-0 items-center justify-center overflow-hidden"],
  variants: {
    theme: {
      brutal: "border-black",
      // Elegant styling is deferred; see the component TODO.
      elegant: "",
    },
    type: {
      agent: "bg-brutal-cyan",
      human: "bg-brutal-lavender text-black",
    },
    size: {
      "3xl": "size-16 border-2",
      "2xl": "size-14 border-2",
      xl: "size-12 border-2",
      lg: "size-9 border-2",
      md: "size-8 border-2",
      sm: "size-7 border",
      xs: "size-[22px] border",
      "2xs": "size-5 border",
      "3xs": "size-[18px] border",
      "4xs": "size-[14px] border",
    },
  },
});

export type AvatarSize = NonNullable<VariantProps<typeof avatar>["size"]>;

export type AvatarProps = Omit<ComponentPropsWithRef<"span">, "children"> &
  Required<Pick<VariantProps<typeof avatar>, "size" | "type">> & {
    /** Compose `<AvatarImage>` / `<AvatarFallback>` / `<AvatarBadge>`. Defaults to a placeholder fallback when empty. */
    children?: ReactNode;
  };

export function Avatar({ size, type, className, children, ...props }: AvatarProps) {
  const theme = useTheme();
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={avatar({ theme, type, size, class: className })}
      {...props}
    >
      {children ?? <AvatarFallback />}
    </AvatarPrimitive.Root>
  );
}
