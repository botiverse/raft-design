import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants/lite";
import { useTheme } from "../../lib/theme/use-theme.ts";

const label = tv({
  slots: {
    root: [
      "group/label inline-flex w-fit items-center gap-1",
      "cursor-pointer select-none",
      "text-sm leading-none",
      "aria-disabled:cursor-not-allowed aria-disabled:text-foreground-disabled",
    ],
    asterisk: ["text-accent-400", "group-aria-disabled/label:text-foreground-disabled"],
    sub: ["font-normal normal-case", "group-aria-disabled/label:text-foreground-disabled"],
  },
  variants: {
    theme: {
      brutal: {
        root: "font-bold text-foreground-strong",
        sub: "font-bold tracking-wide text-black/40",
      },
      elegant: {
        root: "font-medium text-foreground",
        sub: "text-foreground/40",
      },
    },
    size: {
      sm: { root: "text-xs" },
      md: { root: "text-sm" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type LabelProps = useRender.ComponentProps<"label"> &
  Omit<VariantProps<typeof label>, "theme"> & {
    disabled?: boolean;
  };

function LabelRoot({ size, disabled, className, render, ...props }: LabelProps) {
  const theme = useTheme();
  const { root } = label({ theme, size });
  const defaultProps: useRender.ElementProps<"label"> = {
    "aria-disabled": disabled ? true : undefined,
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "label",
    render,
    props: mergeProps<"label">(defaultProps, props),
    state: {
      slot: "label",
      disabled: disabled ?? false,
    },
  });
}

export type LabelAsteriskProps = ComponentPropsWithRef<"span">;

export function LabelAsterisk({ className, children = "*", ...props }: LabelAsteriskProps) {
  const theme = useTheme();
  const { asterisk } = label({ theme });

  return (
    <span data-slot="label-asterisk" className={asterisk({ className })} {...props}>
      {children}
    </span>
  );
}

export type LabelSubProps = ComponentPropsWithRef<"span">;

export function LabelSub({ className, ...props }: LabelSubProps) {
  const theme = useTheme();
  const { sub } = label({ theme });

  return <span data-slot="label-sub" className={sub({ className })} {...props} />;
}

export type LabelOptionalProps = LabelSubProps;

export function LabelOptional({ children = "(optional)", ...props }: LabelOptionalProps) {
  return (
    <LabelSub data-slot="label-optional" {...props}>
      {children}
    </LabelSub>
  );
}

export const Label = Object.assign(LabelRoot, {
  Asterisk: LabelAsterisk,
  Optional: LabelOptional,
  Sub: LabelSub,
});
