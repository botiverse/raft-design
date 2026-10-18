import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentPropsWithRef } from "react";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

const label = tv({
  slots: {
    root: [
      "group/label inline-flex w-fit items-center gap-1",
      "cursor-pointer select-none",
      "text-sm leading-none",
      "data-disabled:cursor-not-allowed data-disabled:text-foreground-disabled",
      "font-sans font-semibold text-foreground-muted",
    ],
    asterisk: ["group-data-disabled/label:text-foreground-disabled", "text-foreground-hint"],
    sub: [
      "normal-case",
      "group-data-disabled/label:text-foreground-disabled",
      "font-normal tracking-normal text-foreground-hint",
    ],
  },
  variants: {
    size: {
      sm: { root: ["text-caption font-semibold"] },
      md: { root: ["text-footnote font-semibold"] },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type LabelProps = useRender.ComponentProps<"label"> &
  VariantProps<typeof label> & {
    disabled?: boolean;
  };

function LabelRoot({ size, disabled, className, render, ...props }: LabelProps) {
  const { root } = label({ size });
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
  const { asterisk } = label();

  return (
    <span data-slot="label-asterisk" className={asterisk({ className })} {...props}>
      {children}
    </span>
  );
}

export type LabelSubProps = ComponentPropsWithRef<"span">;

export function LabelSub({ className, ...props }: LabelSubProps) {
  const { sub } = label();

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
