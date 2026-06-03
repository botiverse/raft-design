import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Presence/status badge overlaid in the avatar's bottom-right corner. Sits flush
// inside the frame (not clipped by its `overflow-hidden`). Default fill is lime;
// override with a `bg-*` class via className. Optionally wraps a small icon.
//
// Auto-scales with the parent Avatar via its `data-size` + `group/avatar` hook:
// the badge frame, border weight, and inner icon track the avatar step. The
// bare `size-2.5` is only a fallback for use outside a sized Avatar; on the
// smallest steps the border thins to 1px and any icon is hidden. Keep the
// per-step selectors below in sync with the `avatar` tv `size` scale.
const avatarBadge = tv({
  base: [
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
  variants: {
    theme: {
      brutal: ["border-black bg-brutal-lime text-black"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
  },
});

export type AvatarBadgeProps = ComponentPropsWithRef<"span">;

export function AvatarBadge({ className, ...props }: AvatarBadgeProps) {
  const theme = useTheme();
  return <span data-slot="avatar-badge" className={avatarBadge({ theme, className })} {...props} />;
}
