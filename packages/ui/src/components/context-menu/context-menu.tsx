import { ContextMenu as BaseContextMenu } from "@base-ui/react";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv.ts";
import { Kbd, type KbdProps } from "../kbd/index.ts";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const contextMenu = tv({
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
          "py-1.5 font-sans text-sm font-semibold leading-6 text-black hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        radioItem: [
          "h-9 overflow-hidden font-sans text-sm font-semibold leading-6 text-black",
          "border-b border-black/10 last:border-b-0",
          "hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        submenuTrigger: [
          "py-1.5 font-sans text-sm font-semibold leading-6 text-black hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30 data-[popup-open]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        label: [
          "border-b border-black px-3 py-2",
          "font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-black/60",
        ],
        shortcut: ["font-sans text-sm font-semibold leading-6"],
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
        separator: ["my-1 -mx-1 h-px border-0 bg-line-muted"],
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
  const theme = useTheme();
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
  return <BaseContextMenu.Portal data-slot="context-menu-portal" {...props} />;
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
    side: "none",
    align: "none",
    fallbackAxisSide: "none",
  },
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking = true,
  positionMethod = "fixed",
  side = "right",
  sideOffset = 0,
  sticky,
  portalProps,
  className,
  ...props
}: ContextMenuContentProps) {
  const theme = useTheme();
  const { positioner, content } = contextMenu({ theme });
  return (
    <BaseContextMenu.Portal {...portalProps}>
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
    </BaseContextMenu.Portal>
  );
}

export type ContextMenuItemProps = StyledProps<BaseContextMenu.Item.Props>;

export function ContextMenuItem({ className, ...props }: ContextMenuItemProps) {
  const theme = useTheme();
  const { item } = contextMenu({ theme });
  return (
    <BaseContextMenu.Item
      data-slot="context-menu-item"
      className={item({ className })}
      {...props}
    />
  );
}

export type ContextMenuSubmenuTriggerProps = StyledProps<BaseContextMenu.SubmenuTrigger.Props>;

export function ContextMenuSubmenuTrigger({ className, ...props }: ContextMenuSubmenuTriggerProps) {
  const theme = useTheme();
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
  const theme = useTheme();
  const { label } = contextMenu({ theme });
  return <div data-slot="context-menu-label" className={label({ className })} {...props} />;
}

export type ContextMenuShortcutProps = KbdProps;

export function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
  const theme = useTheme();
  const { shortcut } = contextMenu({ theme });
  return <Kbd data-slot="context-menu-shortcut" className={shortcut({ className })} {...props} />;
}

export type ContextMenuSeparatorProps = StyledProps<BaseContextMenu.Separator.Props>;

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  const theme = useTheme();
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
        <path d="M1.75391 6.41392L4.4001 9.24985L10.2467 2.98532" />
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
  const theme = useTheme();
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
  const theme = useTheme();
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
