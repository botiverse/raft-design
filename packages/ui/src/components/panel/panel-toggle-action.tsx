import { Toggle as BaseToggle } from "@base-ui/react/toggle";

import type { StyledProps } from "../../lib/styled-props";
import { panelToggleAction } from "./panel-action.recipe";

export type PanelToggleActionProps = Omit<StyledProps<BaseToggle.Props>, "type">;

export function PanelToggleAction({ className, ...props }: PanelToggleActionProps) {
  return (
    <BaseToggle
      {...props}
      type="button"
      data-slot="panel-toggle-action"
      className={panelToggleAction({ className })}
    />
  );
}
