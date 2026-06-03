import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants";

// The row's primary column: the avatar, text content, and any inline aside. With
// `onClick` it renders as a real `<button>` (the whole column is one keyboard-
// focusable target); otherwise a plain `<div>`. Pass `render` to override the
// element. Trailing actions that need their own click target live as a sibling
// `AvatarListRowAside`, never nested inside the button. Picks up `align` from the
// row's `group/avatar-row` marker.
const avatarRowBody = tv({
  base: [
    "flex min-w-0 flex-1 gap-3",
    "items-center group-data-[align=start]/avatar-row:items-start",
  ],
  variants: {
    // The button case only: counteract the `<button>` UA `text-align: center`.
    interactive: {
      true: "text-left",
      false: "",
    },
  },
});

export type AvatarListRowBodyProps = useRender.ComponentProps<"button">;

export function AvatarListRowBody({
  render,
  onClick,
  className,
  ref,
  ...props
}: AvatarListRowBodyProps) {
  const interactive = onClick !== undefined;
  return useRender({
    render: render ?? (interactive ? <button type="button" /> : <div />),
    ref,
    props: {
      "data-slot": "avatar-list-row-body",
      onClick,
      className: avatarRowBody({ interactive, className }),
      ...props,
    },
  });
}
