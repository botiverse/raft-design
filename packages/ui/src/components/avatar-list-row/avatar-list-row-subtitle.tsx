import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";

// Secondary text under/next to the name. In `align="start"` rows (from the row's
// `group/avatar-row` marker) it becomes a wrapping flex line so multiple meta
// chips (size · date · …) sit on their own row.
const avatarRowSubtitle = tv({
  base: [
    "font-mono text-xs text-black/50",
    "group-data-[align=start]/avatar-row:flex group-data-[align=start]/avatar-row:min-w-0 group-data-[align=start]/avatar-row:flex-wrap group-data-[align=start]/avatar-row:items-center group-data-[align=start]/avatar-row:gap-x-2 group-data-[align=start]/avatar-row:gap-y-1",
  ],
});

export type AvatarListRowSubtitleProps = ComponentPropsWithRef<"span">;

export function AvatarListRowSubtitle({ className, ...props }: AvatarListRowSubtitleProps) {
  return (
    <span
      data-slot="avatar-list-row-subtitle"
      className={avatarRowSubtitle({ className })}
      {...props}
    />
  );
}
