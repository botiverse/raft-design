import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";

// The row's primary column: the avatar, text content, and any inline aside. When
// `onClick` is set it renders as a `<button>` (the whole column becomes one click
// target); otherwise a plain `<div>`. Trailing actions that need their own click
// target live as a sibling `AvatarListRowAside` outside this body, never nested
// inside the button. Picks up `align` from the row's `group/avatar-row` marker.
const avatarRowBody = tv({
  base: [
    "flex min-w-0 flex-1 gap-3",
    "items-center group-data-[align=start]/avatar-row:items-start",
  ],
});

export type AvatarListRowBodyProps = ComponentPropsWithRef<"button">;

export function AvatarListRowBody({
  onClick,
  type = "button",
  className,
  children,
  ...props
}: AvatarListRowBodyProps) {
  if (onClick === undefined) {
    return (
      <div data-slot="avatar-list-row-body" className={avatarRowBody({ className })}>
        {children}
      </div>
    );
  }
  return (
    <button
      data-slot="avatar-list-row-body"
      type={type}
      onClick={onClick}
      className={avatarRowBody({ class: ["text-left", className] })}
      {...props}
    >
      {children}
    </button>
  );
}
