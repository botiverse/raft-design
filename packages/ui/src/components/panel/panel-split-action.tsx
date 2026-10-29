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
  panelSplitActionToggleMain,
} from "./panel-split-action.recipe";

export type PanelSplitActionProps = ComponentProps<"div"> & DataAttributes;

/**
 * One header action with a menu beside it, such as Comment and its ▾: a
 * `PanelSplitActionMain`, then a `PanelSplitActionMenu` as the trigger of a
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

export type PanelSplitActionMainProps = Omit<StyledProps<BaseToggle.Props>, "type"> &
  DataAttributes;

/**
 * The primary action of a split action, a panel action's square. Given
 * `pressed`, `defaultPressed` or `onPressedChange` it is a Base UI Toggle
 * (`aria-pressed`, the yellow sticker when pressed, like PanelToggleAction);
 * otherwise a plain Base UI Button.
 */
export function PanelSplitActionMain({
  className,
  pressed,
  defaultPressed,
  onPressedChange,
  value,
  render,
  nativeButton,
  ...props
}: PanelSplitActionMainProps) {
  if (pressed !== undefined || defaultPressed !== undefined || onPressedChange) {
    return (
      <BaseToggle
        {...props}
        pressed={pressed}
        defaultPressed={defaultPressed}
        onPressedChange={onPressedChange}
        value={value}
        render={render}
        nativeButton={nativeButton}
        type="button"
        data-slot="panel-split-action-main"
        className={panelSplitActionToggleMain({ className })}
      />
    );
  }
  return (
    <BaseButton
      {...(props as StyledProps<BaseButton.Props>)}
      render={render as BaseButton.Props["render"]}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="panel-split-action-main"
      className={panelSplitActionMain({ className })}
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
