import { Button as BaseButton } from "@base-ui/react/button";

import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { panelAction } from "./panel-action.recipe";

export type PanelActionProps = Omit<StyledProps<BaseButton.Props>, "type"> & DataAttributes;

export function PanelAction({ className, render, nativeButton, ...props }: PanelActionProps) {
  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="panel-action"
      className={panelAction({ className })}
    />
  );
}
