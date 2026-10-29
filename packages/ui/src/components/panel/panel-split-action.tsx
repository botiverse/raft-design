import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";

import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import {
  panelSplitAction,
  panelSplitActionMain,
  panelSplitActionMenu,
  panelSplitActionToggle,
} from "./panel-split-action.recipe";

export type PanelSplitActionProps = ComponentProps<"div"> & DataAttributes;

/**
 * One header action with a menu beside it, such as Comment and its ▾: a
 * `PanelSplitActionMain` (or `PanelSplitActionToggle`), then a `PanelSplitActionMenu` as the trigger of a
 * DropdownMenu or a Popover. The two parts read as one control.
 */
export function PanelSplitAction({ className, ...props }: PanelSplitActionProps) {
  return (
    <div
      role="group"
      {...props}
      data-slot="panel-split-action"
      className={panelSplitAction({ className })}
    />
  );
}

export type PanelSplitActionMainProps = Omit<StyledProps<BaseButton.Props>, "type"> &
  DataAttributes;

/**
 * The primary action of a split action, a panel action's square: a Base UI
 * Button. For an action that stays on, use `PanelSplitActionToggle`.
 */
export function PanelSplitActionMain({
  className,
  render,
  nativeButton,
  ...props
}: PanelSplitActionMainProps) {
  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="panel-split-action-main"
      data-split-action-main=""
      className={panelSplitActionMain({ className })}
    />
  );
}

export type PanelSplitActionToggleProps = Omit<StyledProps<BaseToggle.Props>, "type"> &
  DataAttributes;

/**
 * The primary action of a split action when it turns something on, such as
 * commenting: a Base UI Toggle (`aria-pressed`), the yellow sticker while
 * pressed, like PanelToggleAction.
 */
export function PanelSplitActionToggle({
  className,
  render,
  nativeButton,
  ...props
}: PanelSplitActionToggleProps) {
  return (
    <BaseToggle
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="panel-split-action-toggle"
      data-split-action-main=""
      className={panelSplitActionToggle({ className })}
    />
  );
}

export type PanelSplitActionMenuProps = Omit<StyledProps<BaseButton.Props>, "type"> &
  DataAttributes;

/**
 * The narrow part of a split action that opens its menu, with a chevron by
 * default. Render it as the trigger of a DropdownMenu or a Popover:
 * `<DropdownMenuTrigger render={<PanelSplitActionMenu aria-label="Comments" />} />`.
 */
export function PanelSplitActionMenu({
  className,
  render,
  nativeButton,
  children,
  ...props
}: PanelSplitActionMenuProps) {
  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="panel-split-action-menu"
      className={panelSplitActionMenu({ className })}
    >
      {children ?? <ChevronDown aria-hidden />}
    </BaseButton>
  );
}
