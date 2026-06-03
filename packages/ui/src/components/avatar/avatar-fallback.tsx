import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { User } from "lucide-react";
import { tv } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";

// Shown when no AvatarImage has loaded. Centers its content over the role-tinted
// frame (transparent, so the role bg shows through). With no children it renders
// the placeholder `User` icon, auto-scaled to the parent Avatar via its
// `data-size` + `group/avatar` hook (the original per-step `placeholderIcon`
// sizes). Keep the per-step selectors in sync with the `avatar` tv `size` scale.
const avatarFallback = tv({
  base: [
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
});

export type AvatarFallbackProps = StyledProps<AvatarPrimitive.Fallback.Props>;

export function AvatarFallback({ className, children, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={avatarFallback({ className })}
      {...props}
    >
      {children ?? <User />}
    </AvatarPrimitive.Fallback>
  );
}
