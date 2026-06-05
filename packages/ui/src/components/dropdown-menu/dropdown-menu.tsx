import type { ComponentPropsWithRef } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { tv } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const dropdownMenu = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: ["max-h-[var(--available-height)] min-w-48 overflow-hidden bg-white", "outline-none"],
    item: [
      "flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1",
      "text-left text-sm outline-none transition-colors",
    ],
    actionItem: ["font-bold"],
    shortcut: ["ml-auto shrink-0"],
    separator: ["border-t-2"],
  },
  variants: {
    theme: {
      brutal: {
        content: ["border-2 border-black shadow-[var(--shadow-hover)]"],
        item: [
          "font-medium text-black hover:bg-brutal-yellow data-[highlighted]:bg-brutal-yellow",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        actionItem: ["hover:bg-brutal-pink data-[highlighted]:bg-brutal-pink"],
        shortcut: ["text-black/60"],
        separator: ["border-black"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type DropdownMenuProps = BaseMenu.Root.Props;

export function DropdownMenu(props: DropdownMenuProps) {
  return <BaseMenu.Root data-slot="dropdown-menu" {...props} />;
}

export type DropdownMenuTriggerProps = StyledProps<BaseMenu.Trigger.Props>;

export function DropdownMenuTrigger({ className, ...props }: DropdownMenuTriggerProps) {
  const theme = useTheme();
  const { trigger } = dropdownMenu({ theme });
  return (
    <BaseMenu.Trigger
      data-slot="dropdown-menu-trigger"
      className={trigger({ className })}
      {...props}
    />
  );
}

export type DropdownMenuPortalProps = BaseMenu.Portal.Props;

export function DropdownMenuPortal(props: DropdownMenuPortalProps) {
  return <BaseMenu.Portal data-slot="dropdown-menu-portal" {...props} />;
}

export type DropdownMenuContentProps = StyledProps<BaseMenu.Popup.Props> &
  Pick<
    BaseMenu.Positioner.Props,
    | "align"
    | "alignOffset"
    | "anchor"
    | "arrowPadding"
    | "collisionAvoidance"
    | "collisionBoundary"
    | "collisionPadding"
    | "disableAnchorTracking"
    | "positionMethod"
    | "side"
    | "sideOffset"
    | "sticky"
  >;

export function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking = true,
  positionMethod = "fixed",
  side = "bottom",
  sideOffset = 4,
  sticky,
  className,
  ...props
}: DropdownMenuContentProps) {
  const theme = useTheme();
  const { positioner, content } = dropdownMenu({ theme });
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        arrowPadding={arrowPadding}
        collisionAvoidance={collisionAvoidance}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        disableAnchorTracking={disableAnchorTracking}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
        className={positioner()}
      >
        <BaseMenu.Popup
          data-slot="dropdown-menu-content"
          className={content({ className })}
          {...props}
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export type DropdownMenuItemProps = StyledProps<BaseMenu.Item.Props>;

export function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps) {
  const theme = useTheme();
  const { item } = dropdownMenu({ theme });
  return (
    <BaseMenu.Item data-slot="dropdown-menu-item" className={item({ className })} {...props} />
  );
}

export type DropdownMenuActionItemProps = DropdownMenuItemProps;

export function DropdownMenuActionItem({ className, ...props }: DropdownMenuActionItemProps) {
  const theme = useTheme();
  const { actionItem } = dropdownMenu({ theme });
  return <DropdownMenuItem className={actionItem({ className })} {...props} />;
}

export type DropdownMenuShortcutProps = ComponentPropsWithRef<"span">;

export function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
  const theme = useTheme();
  const { shortcut } = dropdownMenu({ theme });
  return <span data-slot="dropdown-menu-shortcut" className={shortcut({ className })} {...props} />;
}

export type DropdownMenuSeparatorProps = StyledProps<BaseMenu.Separator.Props>;

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  const theme = useTheme();
  const { separator } = dropdownMenu({ theme });
  return (
    <BaseMenu.Separator
      data-slot="dropdown-menu-separator"
      className={separator({ className })}
      {...props}
    />
  );
}
