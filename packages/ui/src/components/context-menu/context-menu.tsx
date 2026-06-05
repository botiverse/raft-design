import type { ComponentPropsWithRef } from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { tv } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const contextMenu = tv({
  slots: {
    trigger: ["select-none"],
    positioner: ["isolate z-50 outline-none"],
    content: ["max-h-[var(--available-height)] min-w-48 overflow-hidden bg-white", "outline-none"],
    item: [
      "flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1",
      "text-left text-sm outline-none transition-colors",
    ],
    shortcut: ["ml-auto shrink-0"],
    separator: ["border-t-2"],
  },
  variants: {
    theme: {
      brutal: {
        content: ["border-2 border-black shadow-[var(--shadow-hover)]"],
        item: [
          "font-medium text-black hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        ],
        shortcut: ["text-black/60"],
        separator: ["border-black"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type ContextMenuProps = BaseContextMenu.Root.Props;

export function ContextMenu(props: ContextMenuProps) {
  return <BaseContextMenu.Root data-slot="context-menu" {...props} />;
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
  > & {
    portalProps?: ContextMenuPortalProps;
  };

export function ContextMenuContent({
  align = "start",
  alignOffset = 4,
  anchor,
  arrowPadding,
  collisionAvoidance,
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

export type ContextMenuShortcutProps = ComponentPropsWithRef<"span">;

export function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps) {
  const theme = useTheme();
  const { shortcut } = contextMenu({ theme });
  return <span data-slot="context-menu-shortcut" className={shortcut({ className })} {...props} />;
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
