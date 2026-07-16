import { Button as BaseButton } from "@base-ui/react/button";

import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { panelAction } from "./panel-action.recipe";

export type PanelActionProps = Omit<StyledProps<BaseButton.Props>, "type">;

export function PanelAction({ className, render, nativeButton, ...props }: PanelActionProps) {
  const theme = useThemeFamily();

  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="panel-action"
      className={panelAction({ theme, className })}
    />
  );
}
