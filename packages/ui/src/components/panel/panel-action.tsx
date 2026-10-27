import { Button as BaseButton } from "@base-ui/react/button";

import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { useTapActivation } from "../../lib/tap-activation";
import { useMergedRef } from "../../lib/use-merged-ref";
import { panelAction } from "./panel-action.recipe";

export type PanelActionProps = Omit<StyledProps<BaseButton.Props>, "type"> &
  DataAttributes & {
    /**
     * Activate when the finger lifts instead of on the click after it, so a
     * tap that stops a scrolling page still acts. Give it to Back, the
     * header's navigation; not to actions that change things
     * (design/patterns/navigation.md#switching-on-finger-lift).
     */
    activateOnTouchEnd?: boolean;
  };

export function PanelAction({
  className,
  render,
  nativeButton,
  activateOnTouchEnd = false,
  ref,
  ...props
}: PanelActionProps) {
  const tapRef = useTapActivation<HTMLElement>(activateOnTouchEnd);
  const [setRef] = useMergedRef<HTMLElement>(tapRef, ref);
  return (
    <BaseButton
      {...props}
      ref={setRef}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="panel-action"
      data-icon-inset=""
      className={panelAction({ className })}
    />
  );
}
