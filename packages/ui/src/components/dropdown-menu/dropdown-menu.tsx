import type { ComponentPropsWithRef } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { tv } from "tailwind-variants";
import { Kbd, type KbdProps } from "../kbd/index.ts";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const dropdownMenu = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "max-h-[var(--available-height)] min-w-48 overflow-hidden bg-layer-panel",
      "outline-none",
    ],
    item: [
      "flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1",
      "text-left text-sm outline-none transition-colors",
    ],
    actionItem: ["font-bold"],
    label: ["px-3 py-1 text-xs font-bold uppercase"],
    shortcut: ["ml-auto"],
    itemCount: ["ml-auto h-4 min-w-4 shrink-0 px-1.5 text-[0.6875rem] tabular-nums"],
    separator: ["border-t-2"],
  },
  variants: {
    theme: {
      brutal: {
        content: ["border-2 border-line-strong shadow-md"],
        item: [
          "font-medium text-foreground-strong hover:bg-primary-400 data-[highlighted]:bg-primary-400",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        actionItem: ["hover:bg-accent-400 data-[highlighted]:bg-accent-400"],
        label: ["text-foreground/50"],
        shortcut: [],
        itemCount: [
          "rounded border border-line-strong bg-accent-400",
          "font-bold leading-none text-foreground-inverse",
        ],
        separator: ["border-line-strong"],
      },
      elegant: {
        content: ["rounded-sm bg-layer-popover p-1", "shadow-lg outline-none", "flex flex-col"],
        item: [
          "gap-1 rounded-sm px-2 py-1 text-[0.812rem] font-medium tracking-[-0.005em]",
          "text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-layer-muted hover:text-foreground-strong",
          "data-[highlighted]:bg-layer-muted data-[highlighted]:text-foreground-strong",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&>svg]:pointer-events-none [&>svg]:size-6 [&>svg]:shrink-0 [&>svg]:stroke-1 [&>svg]:p-1",
          "[&>svg]:text-foreground-muted",
          "hover:[&>svg]:text-foreground-strong",
          "data-[highlighted]:[&>svg]:text-foreground-strong",
        ],
        actionItem: ["items-center gap-1 py-2 pl-3.5 font-medium", "[&>svg]:stroke-[1.5]"],
        label: [
          "px-2 py-2 pl-3.5 text-[0.75rem] font-medium tracking-[-0.005em]",
          "text-foreground-muted",
        ],
        shortcut: ["text-foreground-muted"],
        itemCount: [
          "inline-flex items-center justify-center rounded-full border-0",
          "bg-layer-muted font-medium leading-none",
          "text-foreground-muted",
        ],
        separator: ["my-1 -mx-1 h-px border-0 bg-line-muted"],
      },
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
  > & {
    portalProps?: DropdownMenuPortalProps;
  };

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
  portalProps,
  className,
  ...props
}: DropdownMenuContentProps) {
  const theme = useTheme();
  const { positioner, content } = dropdownMenu({ theme });
  return (
    <BaseMenu.Portal {...portalProps}>
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

export type DropdownMenuLabelProps = StyledProps<ComponentPropsWithRef<"div">>;

export function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  const theme = useTheme();
  const { label } = dropdownMenu({ theme });
  return <div data-slot="dropdown-menu-label" className={label({ className })} {...props} />;
}

export type DropdownMenuShortcutProps = KbdProps;

export function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
  const theme = useTheme();
  const { shortcut } = dropdownMenu({ theme });
  return <Kbd data-slot="dropdown-menu-shortcut" className={shortcut({ className })} {...props} />;
}

export type DropdownMenuItemCountProps = StyledProps<ComponentPropsWithRef<"span">>;

export function DropdownMenuItemCount({ className, ...props }: DropdownMenuItemCountProps) {
  const theme = useTheme();
  const { itemCount } = dropdownMenu({ theme });
  return (
    <span data-slot="dropdown-menu-item-count" className={itemCount({ className })} {...props} />
  );
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
