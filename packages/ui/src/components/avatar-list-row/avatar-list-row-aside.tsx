import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";

// A trailing slot for status dots, badges, or action buttons. Placed inside
// `AvatarListRowBody` it rides along with the row's click target; placed as a
// sibling of the body it becomes an independent action with its own target.
const avatarRowAside = tv({
  base: ["flex shrink-0 items-center gap-1.5 self-center"],
});

export type AvatarListRowAsideProps = ComponentPropsWithRef<"div">;

export function AvatarListRowAside({ className, ...props }: AvatarListRowAsideProps) {
  return (
    <div data-slot="avatar-list-row-aside" className={avatarRowAside({ className })} {...props} />
  );
}
