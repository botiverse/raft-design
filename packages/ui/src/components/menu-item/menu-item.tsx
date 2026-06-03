import type { ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { tv } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Pure-action menu row: no checkmark, no selected fill. The hover token
// (`bg-brutal-yellow/30`) matches the selection-family surfaces. The compact
// `[@media(max-height:600px)]:py-1` density is applied unconditionally.
//
// Kept as a button (not base-ui `Menu.Item`) so it works standalone in hand-
// rolled menus / popovers without requiring a Menu.Root ancestor — the original
// contract. Base UI Button owns the native button foundation.
const menuItem = tv({
  slots: {
    root: [
      "flex w-full items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1",
      "text-left text-sm transition-colors",
    ],
    content: ["min-w-0 flex-1 truncate"],
    trailing: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "font-medium text-black hover:bg-brutal-yellow/30",
          "disabled:cursor-not-allowed disabled:text-black/30",
        ],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type MenuItemProps = StyledProps<BaseButton.Props> & {
  /** Optional leading icon. Conventionally a lucide icon at `size={14}`. */
  icon?: ReactNode;
  /** Optional right-aligned slot (e.g. shortcut hint). */
  trailing?: ReactNode;
};

export function MenuItem({
  icon,
  trailing,
  type = "button",
  role = "menuitem",
  className,
  children,
  ...props
}: MenuItemProps) {
  const theme = useTheme();
  const { root, content, trailing: trailingSlot } = menuItem({ theme });
  return (
    <BaseButton
      type={type}
      role={role}
      data-slot="menu-item"
      className={root({ className })}
      {...props}
    >
      {icon}
      <span className={content()}>{children}</span>
      {trailing ? <span className={trailingSlot()}>{trailing}</span> : null}
    </BaseButton>
  );
}
