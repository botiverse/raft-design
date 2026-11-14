import { Button as BaseButton } from "@base-ui/react/button";
import { ChevronDown } from "lucide-react";

import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { panelTitleTrigger, panelTitleTriggerLabel } from "./panel-title-trigger.recipe";

export type PanelTitleTriggerProps = Omit<StyledProps<BaseButton.Props>, "type"> & DataAttributes;

/**
 * A panel's title that opens a menu of what the panel can show, such as the
 * Artifacts opened lately: the title, then a chevron. Put it in `PanelHeading`
 * where `PanelTitle` would be, as the trigger of a DropdownMenu:
 * `<DropdownMenuTrigger render={<PanelTitleTrigger />}>Q3 launch plan</DropdownMenuTrigger>`.
 * Its title starts where a `PanelTitle`'s does, and a long one truncates
 * before the chevron.
 */
export function PanelTitleTrigger({
  className,
  render,
  nativeButton,
  children,
  ...props
}: PanelTitleTriggerProps) {
  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="panel-title-trigger"
      className={panelTitleTrigger({ className })}
    >
      <span data-slot="panel-title-trigger-label" className={panelTitleTriggerLabel}>
        {children}
      </span>
      <ChevronDown aria-hidden />
    </BaseButton>
  );
}
