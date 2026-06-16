import type { ComponentPropsWithRef } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { tv } from "tailwind-variants";
import { Badge, type BadgeProps } from "../badge/index.ts";
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
    submenuTrigger: [
      "flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1",
      "text-left text-sm outline-none transition-colors",
    ],
    label: ["px-3 py-1 text-xs font-bold uppercase"],
    shortcut: ["ml-auto"],
    itemCount: ["ml-auto tabular-nums"],
    separator: ["border-t-2"],
    indicator: ["pointer-events-none ml-auto flex size-3 shrink-0 items-center justify-center"],
  },
  variants: {
    theme: {
      brutal: {
        content: [
          "border-2 border-black bg-white shadow-[var(--shadow-hover,4px_4px_0px_var(--color-black))]",
        ],
        item: [
          "font-sans font-medium text-black hover:bg-brutal-yellow data-[highlighted]:bg-brutal-yellow",
          "data-[selected]:bg-brutal-yellow",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        submenuTrigger: [
          "font-sans font-medium text-black hover:bg-brutal-yellow data-[highlighted]:bg-brutal-yellow data-[popup-open]:bg-brutal-yellow",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        label: ["font-sans text-black/40"],
        shortcut: ["font-sans"],
        itemCount: [
          "rounded border border-black bg-brutal-pink px-1.5 py-0.5",
          "font-sans text-[10px] leading-none font-bold text-white",
        ],
        separator: ["border-black"],
        indicator: [],
      },
      elegant: {
        content: [
          "gap-0.5 rounded-md bg-layer-popover p-1",
          "shadow-[0_1px_1px_oklch(0.21_0.006_285_/_0.10),0_0_0_1px_oklch(0.21_0.006_285_/_0.04),0_2px_12px_-4px_oklch(0.21_0.006_285_/_0.16)] outline-none",
          "flex flex-col",
        ],
        item: [
          "gap-2.5 rounded-sm px-3 py-2 text-sm font-medium tracking-[-0.005em]",
          "text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-foreground/[0.04] hover:text-foreground-strong",
          "data-[highlighted]:bg-foreground/[0.04] data-[highlighted]:text-foreground-strong",
          "data-[selected]:bg-foreground/[0.04] data-[selected]:text-foreground-strong",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
          "[&>svg:last-child]:size-3",
          "[&>svg]:text-foreground-muted",
          "hover:[&>svg]:text-foreground-strong",
          "data-[highlighted]:[&>svg]:text-foreground-strong",
        ],
        submenuTrigger: [
          "gap-2.5 rounded-sm px-3 py-2 text-sm font-medium tracking-[-0.005em]",
          "text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-foreground/[0.04] hover:text-foreground-strong",
          "data-[highlighted]:bg-foreground/[0.04] data-[highlighted]:text-foreground-strong",
          "data-[popup-open]:bg-foreground/[0.04] data-[popup-open]:text-foreground-strong",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
          "[&>svg:last-child]:size-3",
          "[&>svg]:text-foreground-muted",
          "hover:[&>svg]:text-foreground-strong",
          "data-[highlighted]:[&>svg]:text-foreground-strong",
          "data-[popup-open]:[&>svg]:text-foreground-strong",
        ],
        label: [
          "px-2 py-2 pl-3.5 text-[11px] font-medium tracking-[-0.005em]",
          "text-foreground/45",
        ],
        shortcut: ["text-foreground-muted"],
        itemCount: [],
        separator: ["my-1 -mx-1 h-px border-0 bg-line-muted"],
        indicator: [],
      },
    },
  },
});

export type DropdownMenuProps = BaseMenu.Root.Props;

export function DropdownMenu(props: DropdownMenuProps) {
  return <BaseMenu.Root data-slot="dropdown-menu" {...props} />;
}

export type DropdownMenuSubmenuProps = BaseMenu.SubmenuRoot.Props;

export function DropdownMenuSubmenu(props: DropdownMenuSubmenuProps) {
  return <BaseMenu.SubmenuRoot data-slot="dropdown-menu-submenu" {...props} />;
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
  disableAnchorTracking = false,
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

export type DropdownMenuSubmenuTriggerProps = StyledProps<BaseMenu.SubmenuTrigger.Props>;

export function DropdownMenuSubmenuTrigger({
  className,
  ...props
}: DropdownMenuSubmenuTriggerProps) {
  const theme = useTheme();
  const { submenuTrigger } = dropdownMenu({ theme });
  return (
    <BaseMenu.SubmenuTrigger
      data-slot="dropdown-menu-submenu-trigger"
      className={submenuTrigger({ className })}
      {...props}
    />
  );
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

export type DropdownMenuItemCountProps = BadgeProps;

export function DropdownMenuItemCount({ className, ...props }: DropdownMenuItemCountProps) {
  const theme = useTheme();
  const { itemCount } = dropdownMenu({ theme });
  return (
    <Badge data-slot="dropdown-menu-item-count" className={itemCount({ className })} {...props} />
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

function DropdownMenuCheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="size-3 shrink-0">
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        stroke="currentColor"
      >
        <path d="M1.75391 6.41392L4.4001 9.24985L10.2467 2.98532" />
      </g>
    </svg>
  );
}

export type DropdownMenuRadioGroupProps = StyledProps<BaseMenu.RadioGroup.Props>;

export function DropdownMenuRadioGroup({ ...props }: DropdownMenuRadioGroupProps) {
  return <BaseMenu.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

export type DropdownMenuRadioItemProps = StyledProps<BaseMenu.RadioItem.Props>;

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  const theme = useTheme();
  const { item, indicator } = dropdownMenu({ theme });
  return (
    <BaseMenu.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={item({ className })}
      {...props}
    >
      {children}
      <span className={indicator()}>
        <BaseMenu.RadioItemIndicator>
          <DropdownMenuCheckIcon />
        </BaseMenu.RadioItemIndicator>
      </span>
    </BaseMenu.RadioItem>
  );
}

export type DropdownMenuRadioItemIndicatorProps = StyledProps<BaseMenu.RadioItemIndicator.Props>;

export function DropdownMenuRadioItemIndicator({
  className,
  ...props
}: DropdownMenuRadioItemIndicatorProps) {
  return (
    <BaseMenu.RadioItemIndicator
      data-slot="dropdown-menu-radio-item-indicator"
      className={className}
      {...props}
    />
  );
}

export type DropdownMenuCheckboxItemProps = StyledProps<BaseMenu.CheckboxItem.Props>;

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const theme = useTheme();
  const { item, indicator } = dropdownMenu({ theme });
  return (
    <BaseMenu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={item({ className })}
      {...props}
    >
      {children}
      <span className={indicator()}>
        <BaseMenu.CheckboxItemIndicator>
          <DropdownMenuCheckIcon />
        </BaseMenu.CheckboxItemIndicator>
      </span>
    </BaseMenu.CheckboxItem>
  );
}

export type DropdownMenuCheckboxItemIndicatorProps =
  StyledProps<BaseMenu.CheckboxItemIndicator.Props>;

export function DropdownMenuCheckboxItemIndicator({
  className,
  ...props
}: DropdownMenuCheckboxItemIndicatorProps) {
  return (
    <BaseMenu.CheckboxItemIndicator
      data-slot="dropdown-menu-checkbox-item-indicator"
      className={className}
      {...props}
    />
  );
}
