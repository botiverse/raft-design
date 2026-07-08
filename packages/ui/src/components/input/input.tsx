import { Input as BaseInput } from "@base-ui/react/input";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { WithoutChildren } from "../../lib/without-children";

// The brutal field visual (formerly the app's `.input-brutal` class). The error
// state is driven by `aria-invalid` so the control styles itself while Field /
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
          "aria-invalid:border-brutal-red aria-invalid:bg-brutal-red/5 aria-invalid:shadow-none aria-invalid:ring-2 aria-invalid:ring-brutal-red/60",
        ],
      },
    },
    {
      theme: "elegant",
      class: {
        root: [
          "rounded-md border border-[oklch(0.94_0_0)] bg-layer-field",
          "px-3 py-2 text-sm text-[oklch(0.205_0_0)] transition duration-200 ease-out dark:text-foreground",
          "placeholder:text-foreground-placeholder/70",
          "shadow-none hover:not-aria-invalid:border-[oklch(0.91_0_0)] hover:shadow-[oklch(0_0_0_/_0)_0px_0px_0px_0px,oklch(0_0_0_/_0)_0px_0px_0px_0px,oklch(0.159_0.016_266.594_/_0.03)_0px_1px_2px_0px]",
          "focus:border-line-strong/25 focus:bg-layer-field",
          "focus-visible:ring-2 focus-visible:ring-line-strong/8",
          "aria-invalid:border-danger-base/45 aria-invalid:hover:border-danger-base/75 aria-invalid:focus-visible:border-danger-base/75 aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-danger-base/12",
          "disabled:cursor-not-allowed disabled:border-line-subtle/60 disabled:bg-layer-muted/50 disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
          "disabled:hover:border-line-subtle/60 disabled:hover:shadow-none",
          "aria-invalid:disabled:border-line-subtle/60 aria-invalid:disabled:ring-0",
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

export function Input({ suppressPasswordManager, className, ...props }: InputProps) {
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
    />
  );
}
