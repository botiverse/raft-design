import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";

// Overlapping stack of avatars (and an optional trailing AvatarGroupCount). Each
// member gets a cream ring so the overlap reads as a clean gap; override the ring
// color via className when the surface behind isn't cream.
const avatarGroup = tv({
  base: [
    "group/avatar-group flex items-center -space-x-1.5",
    "*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-brutal-cream",
    "*:data-[slot=avatar-group-count]:ring-2 *:data-[slot=avatar-group-count]:ring-brutal-cream",
  ],
});

export type AvatarGroupProps = ComponentPropsWithRef<"div">;

export function AvatarGroup({ className, ...props }: AvatarGroupProps) {
  return <div data-slot="avatar-group" className={avatarGroup({ className })} {...props} />;
}
