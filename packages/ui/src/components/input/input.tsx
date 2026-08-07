import { Input as BaseInput } from "@base-ui/react/input";
import type { DataAttributes } from "../../lib/data-attributes";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { WithoutChildren } from "../../lib/without-children";
import { input } from "./input.recipe";

// The brutal field visual (formerly the app's `.input-brutal` class). Invalid
// visuals key off `data-invalid`; the control mirrors it to `aria-invalid` for
// assistive tech while Field / FieldError own the message.
export type InputBehaviorProps = {
  /**
   * Add common password-manager ignore hints for non-credential fields where
   * extension overlays would obscure custom UI.
   */
  suppressPasswordManager?: boolean;
};

export type InputProps = WithoutChildren<StyledProps<BaseInput.Props>> &
  InputBehaviorProps &
  DataAttributes;

export function Input({
  suppressPasswordManager,
  className,
  "data-invalid": dataInvalid,
  ...props
}: InputProps) {
  const theme = useThemeFamily();
  const { root } = input({ theme });

  return (
    <BaseInput
      data-slot="input"
      className={root({ className: [suppressPasswordManager && "keeper-ignore", className] })}
      data-1p-ignore={suppressPasswordManager ? "true" : undefined}
      data-bwignore={suppressPasswordManager ? "true" : undefined}
      data-form-type={suppressPasswordManager ? "other" : undefined}
      data-lpignore={suppressPasswordManager ? "true" : undefined}
      {...props}
      data-invalid={dataInvalid || undefined}
      aria-invalid={dataInvalid ? "true" : undefined}
    />
  );
}
