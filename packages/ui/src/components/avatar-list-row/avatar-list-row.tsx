import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import {
  SurfaceListItem,
  type SurfaceListItemProps,
} from "../surface-list-item/surface-list-item.tsx";

// Card-style row root: routes its outer frame through SurfaceListItem so the
// selected / interactive contract stays shared, then lays out its children in a
// flex row. The parts (`AvatarListRowBody`, `AvatarListRowContent`,
// `AvatarListRowAside`, …) are composed in as children — the avatar itself stays
// a caller-supplied node, keeping this orthogonal to any avatar primitive.
//
// `align` is published to descendants via the `group/avatar-row` marker plus a
// `data-align` attribute (same mechanism as Field's `group/field`), so parts
// flip their layout with `group-data-[align=start]/avatar-row:*` — no context.
const avatarRow = tv({
  base: ["group/avatar-row flex w-full min-w-0 gap-3"],
  variants: {
    align: {
      start: "items-start",
      center: "items-center",
    },
  },
  defaultVariants: {
    align: "center",
  },
});

export type AvatarListRowProps = Pick<VariantProps<typeof avatarRow>, "align"> &
  Pick<SurfaceListItemProps, "selected" | "interactive"> &
  ComponentPropsWithRef<"div">;

export function AvatarListRow({
  align = "center",
  selected,
  interactive,
  className,
  children,
  ...props
}: AvatarListRowProps) {
  return (
    <SurfaceListItem
      data-slot="avatar-list-row"
      selected={selected}
      interactive={interactive}
      className={`group px-3 py-2${className ? ` ${className}` : ""}`}
    >
      <div data-align={align} className={avatarRow({ align })} {...props}>
        {children}
      </div>
    </SurfaceListItem>
  );
}
