import { Button as BaseButton } from "@base-ui/react/button";

import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { chatPanelAction } from "./chat-panel-action.recipe";

export type ChatPanelActionProps = Omit<StyledProps<BaseButton.Props>, "type">;

export function ChatPanelAction({
  className,
  render,
  nativeButton,
  ...props
}: ChatPanelActionProps) {
  const theme = useThemeFamily();

  return (
    <BaseButton
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="chat-panel-action"
      className={chatPanelAction({ theme, className })}
    />
  );
}
