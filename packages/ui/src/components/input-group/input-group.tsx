import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// The brutal shell, lifted off the control onto the wrapper so addons can sit
// inside the bordered box. The invalid look is driven by the inner control
// (`data-slot=input-group-control`) via `has-*`. `lift` toggles the focus shadow
// (off for a faithful SearchInput, which never lifted).
const inputGroup = tv({
  base: ["group/input-group relative flex w-full min-w-0 items-center"],
  variants: {
    theme: {
      brutal: [
        "border-2 border-black bg-white shadow-[var(--shadow)]",
        "has-[[data-slot=input-group-control][aria-invalid=true]]:border-brutal-red has-[[data-slot=input-group-control][aria-invalid=true]]:bg-brutal-red/5 has-[[data-slot=input-group-control][aria-invalid=true]]:ring-2 has-[[data-slot=input-group-control][aria-invalid=true]]:ring-brutal-red/60",
      ],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
    lift: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      lift: true,
      class: "has-[[data-slot=input-group-control]:focus]:shadow-[var(--shadow-hover)]",
    },
  ],
  defaultVariants: {
    lift: true,
  },
});

export type InputGroupProps = ComponentPropsWithRef<"div"> &
  Omit<VariantProps<typeof inputGroup>, "theme">;

export function InputGroup({ lift, className, ...props }: InputGroupProps) {
  const theme = useTheme();
  return (
    <div
      role="group"
      data-slot="input-group"
      className={inputGroup({ theme, lift, className })}
      {...props}
    />
  );
}
