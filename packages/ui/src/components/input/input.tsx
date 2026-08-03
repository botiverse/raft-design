import { Input as BaseInput } from "@base-ui/react/input";
import { dataPresence, isAriaTrue } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { WithoutChildren } from "../../lib/without-children";

// The brutal field visual (formerly the app's `.input-brutal` class). Invalid
// visuals use `data-invalid` (mirrored from `aria-invalid` / Field) while Field /
// FieldError own the message.
const input = tv({
  slots: {
    root: ["w-full px-3 py-2 font-heading outline-none"],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      class: {
        root: [
          "border-2 border-line-strong bg-layer-panel",
          "shadow-sm focus:shadow-md",
          "data-invalid:border-brutal-red data-invalid:bg-brutal-red/5 data-invalid:shadow-none data-invalid:ring-2 data-invalid:ring-brutal-red/60",
        ],
      },
    },
    {
      theme: "elegant",
      class: {
        root: [
          "rounded-md border border-line-field bg-layer-panel",
          "px-3 py-2 text-sm text-foreground transition duration-200 ease-out dark:text-foreground-strong",
          "placeholder:text-foreground-placeholder/70",
          "shadow-none hover:not-data-invalid:border-line-field-hover hover:shadow-field-hover",
          "focus:bg-layer-panel",
          "focus-visible:ring-1 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-page",
          "data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75 data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-danger/12 data-invalid:focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:border-line-muted/60 disabled:bg-fill-muted/50 disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
          "disabled:hover:border-line-muted/60 disabled:hover:shadow-none",
          "data-invalid:disabled:border-line-muted/60 data-invalid:disabled:ring-0",
        ],
      },
    },
  ],
});

export type InputBehaviorProps = {
  /**
   * Add common password-manager ignore hints for non-credential fields where
   * extension overlays would obscure custom UI.
   */
  suppressPasswordManager?: boolean;
};

export type InputProps = WithoutChildren<StyledProps<BaseInput.Props>> & InputBehaviorProps;

export function Input({
  suppressPasswordManager,
  className,
  "aria-invalid": ariaInvalid,
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
      aria-invalid={ariaInvalid}
      {...(isAriaTrue(ariaInvalid) ? { "data-invalid": dataPresence(true) } : {})}
    />
  );
}
