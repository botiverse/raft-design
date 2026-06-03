import type { ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { tv } from "tailwind-variants";
import type { StyledProps } from "../lib/styled-props.ts";
import { useTheme } from "../lib/theme/use-theme.ts";

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
      elegant: {},
    },
  },
});

export type LegacyMenuItemProps = StyledProps<BaseButton.Props> & {
  icon?: ReactNode;
  trailing?: ReactNode;
};

export function LegacyMenuItem({
  icon,
  trailing,
  type = "button",
  role = "menuitem",
  className,
  children,
  ...props
}: LegacyMenuItemProps) {
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
