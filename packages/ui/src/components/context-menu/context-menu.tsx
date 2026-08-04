import { ContextMenu as BaseContextMenu } from "@base-ui/react";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import { Kbd, type KbdProps } from "../kbd/index";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";

const contextMenu = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "flex flex-col max-h-[var(--available-height)] min-w-48 overflow-hidden bg-layer-panel",
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
    itemLabel: ["min-w-0 flex-1 truncate text-left"],
    footer: ["px-3 py-2 text-xs text-foreground-muted tabular-nums"],
    label: [],
    shortcut: ["ml-auto"],
    separator: ["border-t-2"],
    indicator: ["pointer-events-none ml-auto flex size-3 shrink-0 items-center justify-center"],
  },
  variants: {
    theme: {
      brutal: {
        content: ["border-2 border-black bg-layer-popover shadow-raft-md"],
        item: [
          "py-2 font-sans text-sm font-semibold leading-5 text-foreground-strong hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-strong/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        radioItem: [
          "h-9 overflow-hidden font-sans text-sm font-semibold leading-6 text-foreground-strong",
          "border-b border-ink-10 last:border-b-0",
          "hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-strong/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        submenuTrigger: [
          "py-2 font-sans text-sm font-semibold leading-5 text-foreground-strong hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30 data-[popup-open]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-strong/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        label: [
          "border-b border-line-strong px-3 py-2",
          "font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-foreground-strong/60",
        ],
        shortcut: ["font-sans text-sm font-semibold leading-6"],
        separator: ["border-black"],
        indicator: [],
      },
      elegant: {
        content: ["gap-0.5 rounded-md bg-layer-popover p-1", "shadow-raft-lg outline-none"],
        item: [
          "gap-2.5 rounded-sm px-3 py-1.5 text-[13px] font-normal tracking-[-0.005em]",
          "text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-ink-4 hover:text-foreground",
          "data-[highlighted]:bg-ink-4 data-[highlighted]:text-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
          "[&>svg]:text-foreground-muted",
          "hover:[&>svg]:text-foreground",
          "data-[highlighted]:[&>svg]:text-foreground",
        ],
        radioItem: [
          "gap-2.5 rounded-sm px-3 py-1.5 text-[13px] font-normal tracking-[-0.005em]",
          "text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-ink-4 hover:text-foreground",
          "data-[highlighted]:bg-ink-4 data-[highlighted]:text-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
          "[&>svg]:text-foreground-muted",
          "hover:[&>svg]:text-foreground",
          "data-[highlighted]:[&>svg]:text-foreground",
        ],
        submenuTrigger: [
          "gap-2.5 rounded-sm px-3 py-1.5 text-[13px] font-normal tracking-[-0.005em]",
          "text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-ink-4 hover:text-foreground",
          "data-[highlighted]:bg-ink-4 data-[highlighted]:text-foreground",
          "data-[popup-open]:bg-ink-4 data-[popup-open]:text-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
          "[&>svg~svg:last-child]:size-3",
          "[&>svg]:text-foreground-muted",
          "hover:[&>svg]:text-foreground",
          "data-[highlighted]:[&>svg]:text-foreground",
          "data-[popup-open]:[&>svg]:text-foreground",
        ],
        label: [
          "-mx-1 mb-1 border-b border-line-hairline px-3 py-2 dark:border-ink-6",
          "text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground-strong/45",
        ],
        shortcut: ["text-foreground-muted"],
        separator: ["my-1 -mx-1 h-px border-0 bg-line-hairline dark:bg-ink-6"],
        indicator: [],
      },
    },
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
  const theme = useThemeFamily();
  const { trigger } = contextMenu({ theme });
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
      | "collisionPadding"
      | "disableAnchorTracking"
      | "positionMethod"
      | "side"
      | "sideOffset"
      | "sticky"
    >
  > & {
    portalProps?: ContextMenuPortalProps;
  };

export function ContextMenuContent({
  align = "start",
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance = {
    side: "shift",
    align: "shift",
    fallbackAxisSide: "none",
  },
  collisionBoundary,
  collisionPadding = 8,
  disableAnchorTracking = true,
  positionMethod = "fixed",
  side = "right",
  sideOffset = 0,
  sticky,
  portalProps,
  className,
  ...props
}: ContextMenuContentProps) {
  const theme = useThemeFamily();
  const { positioner, content } = contextMenu({ theme });
  return (
    <ContextMenuPortal {...portalProps}>
      <BaseContextMenu.Positioner
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
        <BaseContextMenu.Popup
          data-slot="context-menu-content"
          className={content({ className })}
          {...props}
        />
      </BaseContextMenu.Positioner>
    </ContextMenuPortal>
  );
}

export type ContextMenuPopupProps = ComponentPropsWithRef<"div">;

export function ContextMenuPopup({ className, ...props }: ContextMenuPopupProps) {
  const theme = useThemeFamily();
  const { content } = contextMenu({ theme });
  return <div data-slot="context-menu-content" className={content({ className })} {...props} />;
}

export type ContextMenuItemProps = StyledProps<BaseContextMenu.Item.Props>;

export function ContextMenuItem({ className, ...props }: ContextMenuItemProps) {
  const theme = useThemeFamily();
  const { item } = contextMenu({ theme });
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

export function ContextMenuSubmenuTrigger({ className, ...props }: ContextMenuSubmenuTriggerProps) {
  const theme = useThemeFamily();
  const { submenuTrigger } = contextMenu({ theme });
  return (
    <BaseContextMenu.SubmenuTrigger
      data-slot="context-menu-submenu-trigger"
      className={submenuTrigger({ className })}
      {...props}
    />
  );
}

export type ContextMenuLabelProps = StyledProps<ComponentPropsWithRef<"div">>;

export function ContextMenuLabel({ className, ...props }: ContextMenuLabelProps) {
  const theme = useThemeFamily();
  const { label } = contextMenu({ theme });
  return <div data-slot="context-menu-label" className={label({ className })} {...props} />;
}

export type ContextMenuShortcutProps = KbdProps;

export function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
  const theme = useThemeFamily();
  const { shortcut } = contextMenu({ theme });
  return <Kbd data-slot="context-menu-shortcut" className={shortcut({ className })} {...props} />;
}

export type ContextMenuSeparatorProps = StyledProps<BaseContextMenu.Separator.Props>;

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  const theme = useThemeFamily();
  const { separator } = contextMenu({ theme });
  return (
    <BaseContextMenu.Separator
      data-slot="context-menu-separator"
      className={separator({ className })}
      {...props}
    />
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

export function ContextMenuRadioItem({ className, children, ...props }: ContextMenuRadioItemProps) {
  const theme = useThemeFamily();
  const { radioItem, indicator } = contextMenu({ theme });
  return (
    <BaseContextMenu.RadioItem
      data-slot="context-menu-radio-item"
      className={radioItem({ className })}
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
  const theme = useThemeFamily();
  const { item, indicator } = contextMenu({ theme });
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
