import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";

// The name/subtitle text column. The `root` reserves the flexible width so the
// name can truncate; the `inner` lays the parts out — centered rows put them on
// one baseline-aligned line, `align="start"` rows (from the row's
// `group/avatar-row` marker) stack them vertically.
const avatarRowContent = tv({
  slots: {
    root: ["min-w-0 flex-1"],
    inner: [
      "flex min-w-0 flex-wrap items-baseline gap-x-2",
      "group-data-[align=start]/avatar-row:flex-col group-data-[align=start]/avatar-row:flex-nowrap group-data-[align=start]/avatar-row:items-stretch group-data-[align=start]/avatar-row:gap-x-1 group-data-[align=start]/avatar-row:gap-y-1",
    ],
  },
});

export type AvatarListRowContentProps = ComponentPropsWithRef<"div">;

export function AvatarListRowContent({ className, children, ...props }: AvatarListRowContentProps) {
  const { root, inner } = avatarRowContent();
  return (
    <div data-slot="avatar-list-row-content" className={root({ class: className })} {...props}>
      <div className={inner()}>{children}</div>
    </div>
  );
}
