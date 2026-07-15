import { Toggle as BaseToggle } from "@base-ui/react/toggle";

import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { chatPanelToggleAction } from "./chat-panel-action.recipe";

export type ChatPanelToggleActionProps = Omit<StyledProps<BaseToggle.Props>, "type">;

export function ChatPanelToggleAction({ className, ...props }: ChatPanelToggleActionProps) {
  const theme = useThemeFamily();

  return (
    <BaseToggle
      {...props}
      type="button"
      data-slot="chat-panel-toggle-action"
      className={chatPanelToggleAction({ theme, className })}
    />
  );
}
