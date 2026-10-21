import type { ComponentPropsWithRef, ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { tv } from "../../lib/tv";
import { Badge } from "../badge/index";
import type { BadgeProps } from "../badge/index";
import { Button } from "../button/index";
import { Kbd } from "../kbd/index";
import type { KbdProps } from "../kbd/index";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";

const dropdownMenu = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "max-h-(--available-height) overflow-hidden",
      "outline-none",
      "flex min-w-60 flex-col gap-0 rounded-container bg-layer-popover p-1.5 text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    item: [
      "flex w-full cursor-default select-none items-center",
      "text-left outline-none transition-colors",
      "min-h-option gap-2.5 rounded-control px-2.5 py-option-inset",
      "font-sans text-callout font-medium text-foreground",
      "hover:bg-brand-soft data-highlighted:bg-brand-soft",
      "data-checked:font-bold data-[selected]:font-bold data-[emphasis=strong]:font-bold",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
      "[&>svg]:text-foreground-muted data-disabled:[&>svg]:text-foreground-disabled",
    ],
    radioItem: [
      "flex w-full cursor-default select-none items-center",
      "text-left outline-none transition-colors",
      "min-h-option gap-2.5 rounded-control px-2.5 py-option-inset",
      "font-sans text-callout font-medium text-foreground",
      "hover:bg-brand-soft data-highlighted:bg-brand-soft",
      "data-checked:font-bold",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
      "[&>svg]:text-foreground-muted data-disabled:[&>svg]:text-foreground-disabled",
    ],
    submenuTrigger: [
      "flex w-full cursor-default select-none items-center",
      "text-left outline-none transition-colors",
      "min-h-option gap-2.5 rounded-control px-2.5 py-option-inset",
      "font-sans text-callout font-medium text-foreground",
      "hover:bg-brand-soft data-highlighted:bg-brand-soft data-popup-open:bg-brand-soft",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
      "[&>svg]:text-foreground-muted data-disabled:[&>svg]:text-foreground-disabled",
    ],
    itemLabel: ["min-w-0 flex-1 truncate text-left"],
    footer: ["px-3 py-2 text-xs text-foreground-muted tabular-nums"],
    label: ["px-2.5 pt-2 pb-1", "font-sans text-caption font-bold text-foreground-hint"],
    shortcut: [
      "ml-auto",
      "h-auto min-w-0 rounded-none bg-transparent p-0 shadow-none ring-0",
      "font-mono text-mono-meta font-normal text-foreground-hint",
    ],
    itemCount: ["ml-auto inline-flex min-w-5 justify-center gap-0 px-1 tabular-nums"],
    separator: ["-mx-1.5 my-1.5 h-px border-0 bg-line-hairline"],
    indicator: [
      "pointer-events-none ml-auto flex shrink-0 items-center justify-center",
      "size-4 text-foreground [&_svg]:size-4",
    ],
    radioLabel: ["min-w-0 flex-1 truncate"],
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
  const { trigger } = dropdownMenu();
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
  return <BaseMenu.Portal data-slot="dropdown-menu-portal" {...useThemeScopeProps(props)} />;
}

export type DropdownMenuPopupProps = ComponentPropsWithRef<"div">;

export function DropdownMenuPopup({ className, ...props }: DropdownMenuPopupProps) {
  const { content } = dropdownMenu();
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
  const resolvedSideOffset = sideOffset ?? 6;
  const { positioner, content } = dropdownMenu();
  return (
    <DropdownMenuPortal {...portalProps}>
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
    </DropdownMenuPortal>
  );
}

export type DropdownMenuItemProps = StyledProps<BaseMenu.Item.Props>;

export function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps) {
  const { item } = dropdownMenu();
  return (
    <BaseMenu.Item data-slot="dropdown-menu-item" className={item({ className })} {...props} />
  );
}

export type DropdownMenuItemLabelProps = StyledProps<ComponentPropsWithRef<"span">>;

export function DropdownMenuItemLabel({ className, ...props }: DropdownMenuItemLabelProps) {
  const { itemLabel } = dropdownMenu();
  return (
    <span data-slot="dropdown-menu-item-label" className={itemLabel({ className })} {...props} />
  );
}

export type DropdownMenuFooterProps = StyledProps<ComponentPropsWithRef<"div">>;

export function DropdownMenuFooter({ className, ...props }: DropdownMenuFooterProps) {
  const { footer } = dropdownMenu();
  return <div data-slot="dropdown-menu-footer" className={footer({ className })} {...props} />;
}

export type DropdownMenuSubmenuTriggerProps = StyledProps<BaseMenu.SubmenuTrigger.Props>;

export function DropdownMenuSubmenuTrigger({
  children,
  className,
  ...props
}: DropdownMenuSubmenuTriggerProps) {
  const { submenuTrigger, indicator } = dropdownMenu();
  return (
    <BaseMenu.SubmenuTrigger
      data-slot="dropdown-menu-submenu-trigger"
      className={submenuTrigger({ className })}
      {...props}
    >
      {children}
      <span
        className={indicator()}
        data-slot="dropdown-menu-submenu-trigger-indicator"
        aria-hidden="true"
      >
        <DropdownMenuSubmenuChevronIcon />
      </span>
    </BaseMenu.SubmenuTrigger>
  );
}

export type DropdownMenuLabelProps = StyledProps<ComponentPropsWithRef<"div">>;

export function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps) {
  const { label } = dropdownMenu();
  return <div data-slot="dropdown-menu-label" className={label({ className })} {...props} />;
}

export type DropdownMenuShortcutProps = KbdProps;

export function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps) {
  const { shortcut } = dropdownMenu();
  return <Kbd data-slot="dropdown-menu-shortcut" className={shortcut({ className })} {...props} />;
}

export type DropdownMenuItemCountProps = BadgeProps;

export function DropdownMenuItemCount({ className, ...props }: DropdownMenuItemCountProps) {
  const { itemCount } = dropdownMenu();
  return (
    <Badge data-slot="dropdown-menu-item-count" className={itemCount({ className })} {...props} />
  );
}

export type DropdownMenuSeparatorProps = StyledProps<BaseMenu.Separator.Props>;

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  const { separator } = dropdownMenu();
  return (
    <BaseMenu.Separator
      data-slot="dropdown-menu-separator"
      className={separator({ className })}
      {...props}
    />
  );
}

function DropdownMenuSubmenuChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="size-3 shrink-0">
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        stroke="currentColor"
      >
        <path d="M4.25 2.5L7.75 6l-3.5 3.5" />
      </g>
    </svg>
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
        <path d="M1.75 6.41L4.4 9.25L10.25 2.99" />
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
  const { radioItem, radioLabel, indicator } = dropdownMenu();
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
  const { item, indicator } = dropdownMenu();
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
