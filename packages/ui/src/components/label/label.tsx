import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentPropsWithRef } from "react";
import { type SlotElementProps } from "../../lib/data-attributes";
import { tv, type VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const label = tv({
  slots: {
    root: [
      "group/label inline-flex w-fit items-center gap-1",
      "cursor-pointer select-none",
      "text-sm leading-none",
      "data-disabled:cursor-not-allowed data-disabled:text-foreground-disabled",
    ],
    asterisk: ["text-accent-400", "group-data-disabled/label:text-foreground-disabled"],
    sub: ["font-normal normal-case", "group-data-disabled/label:text-foreground-disabled"],
  },
  variants: {
    theme: {
      brutal: {
        root: "font-bold text-foreground",
        sub: "font-bold tracking-wide text-foreground-strong/40",
      },
      elegant: {
        root: "font-medium text-foreground-strong dark:text-foreground-hint",
        sub: "text-foreground-strong/40",
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
  const theme = useThemeFamily();
  const { root } = label({ theme, size });
  const defaultProps: SlotElementProps<"label"> = {
    "aria-disabled": disabled ? true : undefined,
    "data-disabled": disabled ? "" : undefined,
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
  const theme = useThemeFamily();
  const { asterisk } = label({ theme });

  return (
    <span data-slot="label-asterisk" className={asterisk({ className })} {...props}>
      {children}
    </span>
  );
}

export type LabelSubProps = ComponentPropsWithRef<"span">;

export function LabelSub({ className, ...props }: LabelSubProps) {
  const theme = useThemeFamily();
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
