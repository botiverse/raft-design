import { Input as BaseInput } from "@base-ui/react/input";
import { tv, type VariantProps } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

// The brutal field visual (formerly the app's `.input-brutal` class). The error
// state is driven by `aria-invalid` so the control styles itself while Field /
// FieldError own the message. `unstyled` drops the shell so an InputGroup can own
// the border/shadow/invalid look while the control stays bare.
const input = tv({
  slots: {
    root: ["w-full px-3 py-2 font-display outline-none"],
  },
  variants: {
    theme: {
      brutal: {},
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    unstyled: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      unstyled: false,
      class: {
        root: [
          "border-2 border-black bg-white",
          "shadow-[var(--shadow)] focus:shadow-[var(--shadow-hover)]",
          "aria-invalid:border-brutal-red aria-invalid:bg-brutal-red/5 aria-invalid:shadow-none aria-invalid:ring-2 aria-invalid:ring-brutal-red/60",
        ],
      },
    },
  ],
  defaultVariants: {
    unstyled: false,
  },
});

export type InputProps = WithoutChildren<StyledProps<BaseInput.Props>> &
  Omit<VariantProps<typeof input>, "theme">;

export function Input({ unstyled, className, ...props }: InputProps) {
  const theme = useTheme();
  const { root } = input({ theme, unstyled });
  return <BaseInput data-slot="input" className={root({ className })} {...props} />;
}
