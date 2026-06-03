import type { ComponentPropsWithRef } from "react";
import { useRender } from "@base-ui/react/use-render";
import { cn, tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import {
  SurfaceListItem,
  type SurfaceListItemProps,
} from "../surface-list-item/surface-list-item.tsx";

// AvatarListRow family: a card-style row that routes its outer frame through
// SurfaceListItem (shared selected / interactive contract) then lays out its
// parts in a flex row. All parts share one `tv()` slots config so theme / layout
// styling lives in a single place — the elegant family overrides the name /
// subtitle text colors under `theme`. The avatar itself stays a caller-supplied
// node, keeping this orthogonal to any avatar primitive.
//
// `align` is published to descendants via the `group/avatar-row` marker plus a
// `data-align` attribute (same mechanism as Field's `group/field`), so parts
// flip their layout with `group-data-[align=start]/avatar-row:*` — no context.
const avatarRow = tv({
  slots: {
    row: ["group/avatar-row flex w-full min-w-0 gap-3"],
    body: [
      "flex min-w-0 flex-1 gap-3",
      "items-center group-data-[align=start]/avatar-row:items-start",
    ],
    content: ["min-w-0 flex-1"],
    contentInner: [
      "flex min-w-0 flex-wrap items-baseline gap-x-2",
      "group-data-[align=start]/avatar-row:flex-col group-data-[align=start]/avatar-row:flex-nowrap group-data-[align=start]/avatar-row:items-stretch group-data-[align=start]/avatar-row:gap-x-1 group-data-[align=start]/avatar-row:gap-y-1",
    ],
    name: ["truncate text-sm font-bold"],
    subtitle: [
      "font-mono text-xs",
      "group-data-[align=start]/avatar-row:flex group-data-[align=start]/avatar-row:min-w-0 group-data-[align=start]/avatar-row:flex-wrap group-data-[align=start]/avatar-row:items-center group-data-[align=start]/avatar-row:gap-x-2 group-data-[align=start]/avatar-row:gap-y-1",
    ],
    aside: ["flex shrink-0 items-center gap-1.5 self-center"],
  },
  variants: {
    theme: {
      brutal: {
        name: "text-black",
        subtitle: "text-black/50",
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    align: {
      start: { row: "items-start" },
      center: { row: "items-center" },
    },
    // The button case only: counteract the `<button>` UA `text-align: center`.
    interactive: {
      true: { body: "text-left" },
      false: { body: "" },
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
  const { row } = avatarRow({ align });
  return (
    <SurfaceListItem
      data-slot="avatar-list-row"
      selected={selected}
      interactive={interactive}
      className={cn("group px-3 py-2", className)}
    >
      <div data-align={align} className={row()} {...props}>
        {children}
      </div>
    </SurfaceListItem>
  );
}

export type AvatarListRowBodyProps = useRender.ComponentProps<"button">;

// The row's primary column: the avatar, text content, and any inline aside. With
// `onClick` it renders as a real `<button>` (the whole column is one keyboard-
// focusable target); otherwise a plain `<div>`. Pass `render` to override the
// element. Trailing actions that need their own click target live as a sibling
// `AvatarListRowAside`, never nested inside the button.
export function AvatarListRowBody({
  render,
  onClick,
  className,
  ref,
  ...props
}: AvatarListRowBodyProps) {
  const interactive = onClick !== undefined;
  const { body } = avatarRow({ interactive });
  return useRender({
    render: render ?? (interactive ? <button type="button" /> : <div />),
    ref,
    props: {
      "data-slot": "avatar-list-row-body",
      onClick,
      className: body({ className }),
      ...props,
    },
  });
}

export type AvatarListRowContentProps = ComponentPropsWithRef<"div">;

// The name/subtitle text column. The outer slot reserves the flexible width so
// the name can truncate; the inner slot lays the parts out — centered rows put
// them on one baseline-aligned line, `align="start"` rows stack them vertically.
export function AvatarListRowContent({ className, children, ...props }: AvatarListRowContentProps) {
  const { content, contentInner } = avatarRow();
  return (
    <div data-slot="avatar-list-row-content" className={content({ className })} {...props}>
      <div className={contentInner()}>{children}</div>
    </div>
  );
}

export type AvatarListRowNameProps = ComponentPropsWithRef<"span">;

// Primary text of the row. Truncates so a long name never wraps or pushes the
// trailing slots out of the frame.
export function AvatarListRowName({ className, ...props }: AvatarListRowNameProps) {
  const theme = useTheme();
  const { name } = avatarRow({ theme });
  return <span data-slot="avatar-list-row-name" className={name({ className })} {...props} />;
}

export type AvatarListRowSubtitleProps = ComponentPropsWithRef<"span">;

// Secondary text under/next to the name. In `align="start"` rows it becomes a
// wrapping flex line so multiple meta chips (size · date · …) sit on their own row.
export function AvatarListRowSubtitle({ className, ...props }: AvatarListRowSubtitleProps) {
  const theme = useTheme();
  const { subtitle } = avatarRow({ theme });
  return (
    <span data-slot="avatar-list-row-subtitle" className={subtitle({ className })} {...props} />
  );
}

export type AvatarListRowAsideProps = ComponentPropsWithRef<"div">;

// A trailing slot for status dots, badges, or action buttons. Placed inside
// `AvatarListRowBody` it rides along with the row's click target; placed as a
// sibling of the body it becomes an independent action with its own target.
export function AvatarListRowAside({ className, ...props }: AvatarListRowAsideProps) {
  const { aside } = avatarRow();
  return <div data-slot="avatar-list-row-aside" className={aside({ className })} {...props} />;
}
