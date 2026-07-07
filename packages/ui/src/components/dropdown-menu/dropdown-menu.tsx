import type { ComponentPropsWithRef, ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { tv } from "../../lib/tv";
import { Badge, type BadgeProps } from "../badge/index";
import { Button } from "../button/index";
import { Kbd, type KbdProps } from "../kbd/index";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

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
    radioItem: [
      "flex w-full cursor-default select-none items-center gap-2 px-3",
      "text-left outline-none transition-colors",
    ],
    submenuTrigger: [
      "flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1",
      "text-left text-sm outline-none transition-colors",
    ],
    label: [],
    shortcut: ["ml-auto"],
    itemCount: ["ml-auto inline-flex min-w-5 justify-center gap-0 px-1 tabular-nums"],
    separator: ["border-t-2"],
    indicator: ["pointer-events-none ml-auto flex size-3 shrink-0 items-center justify-center"],
    radioLabel: [],
  },
  variants: {
    theme: {
      brutal: {
        trigger: [
          "data-[popup-open]:translate-x-0 data-[popup-open]:translate-y-0",
          "data-[popup-open]:hover:translate-x-0 data-[popup-open]:hover:translate-y-0",
        ],
        content: ["border-2 border-black bg-white shadow-lg"],
        item: [
          "py-2 font-sans text-sm font-medium text-black hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2 [&>svg:not([class*='size-'])]:size-3.5",
        ],
        radioItem: [
          "overflow-hidden py-2 font-sans text-sm font-medium leading-5 text-black",
          "border-b border-black/10 last:border-b-0",
          "hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2 [&>svg:not([class*='size-'])]:size-3.5",
        ],
        radioLabel: ["min-w-0 flex-1 truncate"],
        submenuTrigger: [
          "py-2 font-sans text-sm font-medium text-black hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30 data-[popup-open]:bg-soft-signal/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2 [&>svg:not([class*='size-'])]:size-3.5",
        ],
        label: [
          "border-b border-black px-3 py-2",
          "font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-black/60",
        ],
        shortcut: ["font-sans text-sm font-medium"],
        itemCount: [
          "rounded border border-black bg-brutal-pink px-1 py-0.5",
          "font-sans text-[10px] leading-none font-bold text-white",
        ],
        separator: ["border-black"],
        indicator: [],
      },
      elegant: {
        trigger: [
          "hover:bg-[color-mix(in_oklch,var(--line-subtle)_22%,var(--layer-panel))]",
          "data-[popup-open]:[--button-focus-outline:transparent] focus-visible:[--button-focus-outline:transparent]",
          "data-[popup-open]:shadow-[0_0_0_0.5px_oklch(0.21_0.006_285_/_0.14),0_0_0_3px_color-mix(in_oklch,var(--primary-400)_35%,transparent)] focus-visible:shadow-[0_0_0_0.5px_oklch(0.21_0.006_285_/_0.14),0_0_0_3px_color-mix(in_oklch,var(--primary-400)_35%,transparent)]",
        ],
        content: [
          "gap-0.5 rounded-md bg-layer-popover p-1",
          "shadow-lg outline-none",
          "flex flex-col",
        ],
        item: [
          "gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium tracking-[-0.005em]",
          "text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-foreground/[0.04] hover:text-foreground-strong",
          "data-[highlighted]:bg-foreground/[0.04] data-[highlighted]:text-foreground-strong",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
          "[&>svg:last-child]:size-3",
          "[&>svg]:text-foreground-muted",
          "hover:[&>svg]:text-foreground-strong",
          "data-[highlighted]:[&>svg]:text-foreground-strong",
        ],
        radioItem: [
          "gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium tracking-[-0.005em]",
          "text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-foreground/[0.04] hover:text-foreground-strong",
          "data-[highlighted]:bg-foreground/[0.04] data-[highlighted]:text-foreground-strong",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
          "[&>svg:last-child]:size-3",
          "[&>svg]:text-foreground-muted",
          "hover:[&>svg]:text-foreground-strong",
          "data-[highlighted]:[&>svg]:text-foreground-strong",
        ],
        radioLabel: ["min-w-0 flex-1 truncate"],
        submenuTrigger: [
          "gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium tracking-[-0.005em]",
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
          "-mx-1 border-b border-line-muted px-3 py-2",
          "text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground/45",
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

export function DropdownMenuTrigger({
  className,
  render = <Button variant="outline" size="md" />,
  ...props
}: DropdownMenuTriggerProps) {
  const theme = useThemeFamily();
  const { trigger } = dropdownMenu({ theme });
  return (
    <BaseMenu.Trigger
      data-slot="dropdown-menu-trigger"
      render={render}
      className={trigger({ className })}
      {...props}
    />
  );
}

export type DropdownMenuPortalProps = BaseMenu.Portal.Props;

export function DropdownMenuPortal(props: DropdownMenuPortalProps) {
  return <BaseMenu.Portal data-slot="dropdown-menu-portal" {...props} />;
}

export type DropdownMenuPopupProps = ComponentPropsWithRef<"div">;

export function DropdownMenuPopup({ className, ...props }: DropdownMenuPopupProps) {
  const theme = useThemeFamily();
  const { content } = dropdownMenu({ theme });
  return <div data-slot="dropdown-menu-content" className={content({ className })} {...props} />;
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
  sideOffset,
  sticky,
  portalProps,
  className,
  ...props
}: DropdownMenuContentProps) {
  const theme = useThemeFamily();
  const resolvedSideOffset = sideOffset ?? (theme === "elegant" ? 6 : 4);
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
        sideOffset={resolvedSideOffset}
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
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
  const { label } = dropdownMenu({ theme });
  return <div data-slot="dropdown-menu-label" className={label({ className })} {...props} />;
}

export type DropdownMenuShortcutProps = KbdProps;

export function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
  const theme = useThemeFamily();
  const { shortcut } = dropdownMenu({ theme });
  return <Kbd data-slot="dropdown-menu-shortcut" className={shortcut({ className })} {...props} />;
}

export type DropdownMenuItemCountProps = BadgeProps;

export function DropdownMenuItemCount({ className, ...props }: DropdownMenuItemCountProps) {
  const theme = useThemeFamily();
  const { itemCount } = dropdownMenu({ theme });
  return (
    <Badge data-slot="dropdown-menu-item-count" className={itemCount({ className })} {...props} />
  );
}

export type DropdownMenuSeparatorProps = StyledProps<BaseMenu.Separator.Props>;

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
  const { radioItem, radioLabel, indicator } = dropdownMenu({ theme });
  return (
    <BaseMenu.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={radioItem({ className })}
      {...props}
    >
      {renderRadioItemChildren(children, radioLabel())}
      <span className={indicator()}>
        <BaseMenu.RadioItemIndicator>
          <DropdownMenuCheckIcon />
        </BaseMenu.RadioItemIndicator>
      </span>
    </BaseMenu.RadioItem>
  );
}

function renderRadioItemChildren(children: ReactNode, className: string) {
  if (typeof children === "string" || typeof children === "number") {
    return (
      <span data-slot="dropdown-menu-radio-item-label" className={className}>
        {children}
      </span>
    );
  }

  if (Array.isArray(children) && children.every((child) => typeof child === "string")) {
    return (
      <span data-slot="dropdown-menu-radio-item-label" className={className}>
        {children}
      </span>
    );
  }

  return children;
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
  const theme = useThemeFamily();
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
