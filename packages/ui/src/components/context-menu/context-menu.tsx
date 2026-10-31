import { ContextMenu as BaseContextMenu } from "@base-ui/react";
import type { ComponentPropsWithRef } from "react";
import { usePopupCollision } from "../../lib/frame-insets";
import { tv } from "../../lib/tv";
import { Kbd } from "../kbd/index";
import type { KbdProps } from "../kbd/index";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";

const contextMenu = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "flex flex-col max-h-(--available-height) overflow-hidden",
      "outline-none",
      "min-w-60 gap-0 rounded-container bg-layer-popover p-1 text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    item: [
      "flex w-full cursor-default select-none items-center",
      "text-left outline-none transition-colors",
      "min-h-option gap-2.5 rounded-chip px-2.5 py-option-inset",
      "font-sans text-callout font-medium text-foreground",
      "hover:bg-brand-soft data-highlighted:bg-brand-soft",
      "data-checked:font-bold",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&>svg:not([class*='size-'])]:size-4",
      "[&>svg]:text-foreground-muted data-disabled:[&>svg]:text-foreground-disabled",
    ],
    radioItem: [
      "flex w-full cursor-default select-none items-center",
      "text-left outline-none transition-colors",
      "min-h-option gap-2.5 rounded-chip px-2.5 py-option-inset",
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
      "min-h-option gap-2.5 rounded-chip px-2.5 py-option-inset",
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
    separator: ["-mx-1 my-1 h-px border-0 bg-line-hairline"],
    indicator: [
      "pointer-events-none ml-auto flex shrink-0 items-center justify-center",
      "size-4 text-foreground [&_svg]:size-4",
    ],
  },
});

export type ContextMenuProps = BaseContextMenu.Root.Props;

export function ContextMenu(props: ContextMenuProps) {
  return <BaseContextMenu.Root data-slot="context-menu" {...props} />;
}

export type ContextMenuSubmenuProps = BaseContextMenu.SubmenuRoot.Props;

export function ContextMenuSubmenu(props: ContextMenuSubmenuProps) {
  return <BaseContextMenu.SubmenuRoot data-slot="context-menu-submenu" {...props} />;
}

export type ContextMenuTriggerProps = StyledProps<BaseContextMenu.Trigger.Props>;

export function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
  const { trigger } = contextMenu();
  return (
    <BaseContextMenu.Trigger
      data-slot="context-menu-trigger"
      className={trigger({ className })}
      {...props}
    />
  );
}

export type ContextMenuPortalProps = BaseContextMenu.Portal.Props;

export function ContextMenuPortal(props: ContextMenuPortalProps) {
  return <BaseContextMenu.Portal data-slot="context-menu-portal" {...useThemeScopeProps(props)} />;
}

type ContextMenuFramePositionerProps = BaseContextMenu.Positioner.Props & {
  container?: ContextMenuPortalProps["container"];
};

// Inside the portal, so it mounts each time the popup opens and reads the
// frame insets then: 8px from each inset, and from the window's edge elsewhere.
function ContextMenuFramePositioner({
  collisionBoundary,
  collisionPadding,
  container,
  ...props
}: ContextMenuFramePositionerProps) {
  const collision = usePopupCollision(collisionPadding, collisionBoundary, 8, container);
  return <BaseContextMenu.Positioner {...collision} {...props} />;
}

export type ContextMenuContentProps = StyledProps<BaseContextMenu.Popup.Props> &
  Partial<
    Pick<
      BaseContextMenu.Positioner.Props,
      | "align"
      | "alignOffset"
      | "anchor"
      | "arrowPadding"
      | "collisionAvoidance"
      | "collisionBoundary"
      | "disableAnchorTracking"
      | "positionMethod"
      | "side"
      | "sideOffset"
      | "sticky"
    >
  > & {
    /**
     * Additional space to maintain from the edge of the collision boundary: 8px
     * from the window's edge, and 8px from a frame inset where a shell keeps one.
     * A value you pass is kept as it is.
     * @default 8
     */
    collisionPadding?: BaseContextMenu.Positioner.Props["collisionPadding"];
    portalProps?: ContextMenuPortalProps;
  };

const CONTENT_COLLISION_AVOIDANCE: BaseContextMenu.Positioner.Props["collisionAvoidance"] = {
  side: "shift",
  align: "shift",
  fallbackAxisSide: "none",
};

export function ContextMenuContent({
  align = "start",
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance = CONTENT_COLLISION_AVOIDANCE,
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking,
  positionMethod = "fixed",
  side = "right",
  sideOffset = 0,
  sticky,
  portalProps,
  className,
  ...props
}: ContextMenuContentProps) {
  const { positioner, content } = contextMenu();
  return (
    <ContextMenuPortal {...portalProps}>
      <ContextMenuFramePositioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        arrowPadding={arrowPadding}
        collisionAvoidance={collisionAvoidance}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        container={portalProps?.container}
        disableAnchorTracking={disableAnchorTracking}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        sticky={sticky}
        className={positioner()}
      >
        <BaseContextMenu.Popup
          data-slot="context-menu-content"
          className={content({ className })}
          {...props}
        />
      </ContextMenuFramePositioner>
    </ContextMenuPortal>
  );
}

export type ContextMenuPopupProps = ComponentPropsWithRef<"div">;

export function ContextMenuPopup({ className, ...props }: ContextMenuPopupProps) {
  const { content } = contextMenu();
  return <div data-slot="context-menu-content" className={content({ className })} {...props} />;
}

export type ContextMenuItemProps = StyledProps<BaseContextMenu.Item.Props>;

export function ContextMenuItem({ className, ...props }: ContextMenuItemProps) {
  const { item } = contextMenu();
  return (
    <BaseContextMenu.Item
      data-slot="context-menu-item"
      className={item({ className })}
      {...props}
    />
  );
}

export type ContextMenuItemLabelProps = StyledProps<ComponentPropsWithRef<"span">>;

export function ContextMenuItemLabel({ className, ...props }: ContextMenuItemLabelProps) {
  const { itemLabel } = contextMenu();
  return (
    <span data-slot="context-menu-item-label" className={itemLabel({ className })} {...props} />
  );
}

export type ContextMenuFooterProps = StyledProps<ComponentPropsWithRef<"div">>;

export function ContextMenuFooter({ className, ...props }: ContextMenuFooterProps) {
  const { footer } = contextMenu();
  return <div data-slot="context-menu-footer" className={footer({ className })} {...props} />;
}

export type ContextMenuSubmenuTriggerProps = StyledProps<BaseContextMenu.SubmenuTrigger.Props>;

export function ContextMenuSubmenuTrigger({
  children,
  className,
  ...props
}: ContextMenuSubmenuTriggerProps) {
  const { submenuTrigger, indicator } = contextMenu();
  return (
    <BaseContextMenu.SubmenuTrigger
      data-slot="context-menu-submenu-trigger"
      className={submenuTrigger({ className })}
      {...props}
    >
      {children}
      <span
        className={indicator()}
        data-slot="context-menu-submenu-trigger-indicator"
        aria-hidden="true"
      >
        <ContextMenuSubmenuChevronIcon />
      </span>
    </BaseContextMenu.SubmenuTrigger>
  );
}

export type ContextMenuLabelProps = StyledProps<ComponentPropsWithRef<"div">>;

export function ContextMenuLabel({ className, ...props }: ContextMenuLabelProps) {
  const { label } = contextMenu();
  return <div data-slot="context-menu-label" className={label({ className })} {...props} />;
}

export type ContextMenuShortcutProps = KbdProps;

export function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
  const { shortcut } = contextMenu();
  return <Kbd data-slot="context-menu-shortcut" className={shortcut({ className })} {...props} />;
}

export type ContextMenuSeparatorProps = StyledProps<BaseContextMenu.Separator.Props>;

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  const { separator } = contextMenu();
  return (
    <BaseContextMenu.Separator
      data-slot="context-menu-separator"
      className={separator({ className })}
      {...props}
    />
  );
}

function ContextMenuSubmenuChevronIcon() {
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

function ContextMenuCheckIcon() {
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

export type ContextMenuRadioGroupProps = StyledProps<BaseContextMenu.RadioGroup.Props>;

export function ContextMenuRadioGroup({ ...props }: ContextMenuRadioGroupProps) {
  return <BaseContextMenu.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

export type ContextMenuRadioItemProps = StyledProps<BaseContextMenu.RadioItem.Props>;

// Choosing a radio item closes the menu, as in DropdownMenuRadioItem.
export function ContextMenuRadioItem({
  className,
  children,
  closeOnClick = true,
  ...props
}: ContextMenuRadioItemProps) {
  const { radioItem, indicator } = contextMenu();
  return (
    <BaseContextMenu.RadioItem
      data-slot="context-menu-radio-item"
      className={radioItem({ className })}
      closeOnClick={closeOnClick}
      {...props}
    >
      {children}
      <span className={indicator()}>
        <BaseContextMenu.RadioItemIndicator>
          <ContextMenuCheckIcon />
        </BaseContextMenu.RadioItemIndicator>
      </span>
    </BaseContextMenu.RadioItem>
  );
}

export type ContextMenuRadioItemIndicatorProps =
  StyledProps<BaseContextMenu.RadioItemIndicator.Props>;

export function ContextMenuRadioItemIndicator({
  className,
  ...props
}: ContextMenuRadioItemIndicatorProps) {
  return (
    <BaseContextMenu.RadioItemIndicator
      data-slot="context-menu-radio-item-indicator"
      className={className}
      {...props}
    />
  );
}

export type ContextMenuCheckboxItemProps = StyledProps<BaseContextMenu.CheckboxItem.Props>;

export function ContextMenuCheckboxItem({
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  const { item, indicator } = contextMenu();
  return (
    <BaseContextMenu.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={item({ className })}
      {...props}
    >
      {children}
      <span className={indicator()}>
        <BaseContextMenu.CheckboxItemIndicator>
          <ContextMenuCheckIcon />
        </BaseContextMenu.CheckboxItemIndicator>
      </span>
    </BaseContextMenu.CheckboxItem>
  );
}

export type ContextMenuCheckboxItemIndicatorProps =
  StyledProps<BaseContextMenu.CheckboxItemIndicator.Props>;

export function ContextMenuCheckboxItemIndicator({
  className,
  ...props
}: ContextMenuCheckboxItemIndicatorProps) {
  return (
    <BaseContextMenu.CheckboxItemIndicator
      data-slot="context-menu-checkbox-item-indicator"
      className={className}
      {...props}
    />
  );
}
