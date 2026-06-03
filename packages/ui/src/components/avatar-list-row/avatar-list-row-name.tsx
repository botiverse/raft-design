import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";

// Primary text of the row. Truncates so a long name never wraps or pushes the
// trailing slots out of the frame.
const avatarRowName = tv({
  base: ["truncate text-sm font-bold text-black"],
});

export type AvatarListRowNameProps = ComponentPropsWithRef<"span">;

export function AvatarListRowName({ className, ...props }: AvatarListRowNameProps) {
  return (
    <span data-slot="avatar-list-row-name" className={avatarRowName({ className })} {...props} />
  );
}
