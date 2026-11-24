import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { helperTextSlot } from "../../lib/helper-text";
import type { HelperText } from "../../lib/helper-text";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

// A heading is never helper text, so it has no muted tone.
const headingColorVariants = {
  default: ["text-foreground"],
  primary: ["text-brand-strong"],
  information: ["text-info-strong"],
  note: ["text-foreground-hint"],
  accent: ["text-attention-700"],
  success: ["text-success"],
  warning: ["text-warning"],
  danger: ["text-danger"],
};

// `muted` is the helper-text tier: only a HelperText takes it (TextSansProps).
// `note` is the hint tier, for notes such as times, ids and counts.
const textColorVariants = {
  ...headingColorVariants,
  muted: ["text-foreground-muted"],
};

/** Every colour `Text.Sans` and `Text.Mono` take. */
export type TextTone = keyof typeof textColorVariants;

/**
 * `variant="muted"` takes only a `HelperText`, made with `helperText()`; every
 * other tone takes any children. A tone chosen at runtime
 * (`variant={quiet ? "muted" : "default"}`) fits neither: split the two cases.
 */
type TextToneProps<P> =
  | (P & { variant?: Exclude<TextTone, "muted">; children?: ReactNode })
  | (Omit<P, "children"> & { variant: "muted"; children: HelperText });

function toneChildren(variant: TextTone | undefined, children: unknown) {
  return variant === "muted"
    ? helperTextSlot('Text.Sans variant="muted"', children)
    : { children: children as ReactNode };
}

const heading = tv({
  base: ["m-0 font-heading font-medium text-foreground"],
  variants: {
    level: {
      1: ["text-[56px]/16 tracking-[-0.01em] "],
      2: ["text-5xl/14 tracking-[-0.01em] "],
      3: ["text-[40px]/12 tracking-[-0.01em] "],
      4: ["text-[32px]/10 tracking-[-0.005em] "],
      5: ["text-2xl/8 "],
      6: ["text-xl/7 "],
    },
    variant: headingColorVariants,
  },
  defaultVariants: {
    level: 1,
  },
});

const sans = tv({
  base: ["m-0 font-sans font-normal"],
  variants: {
    size: {
      large: ["text-lg/7  text-foreground"],
      body: ["text-base/6  text-foreground"],
      small: ["text-sm/5  text-foreground"],
      caption: ["text-xs/4  text-foreground"],
      group: ["text-footnote font-bold text-foreground-hint"],
    },
    variant: textColorVariants,
  },
  defaultVariants: {
    size: "body",
  },
});

const mono = tv({
  base: ["m-0 font-mono font-normal"],
  variants: {
    size: {
      code: ["text-sm/5  text-foreground"],
      meta: ["text-xs/4  text-foreground-hint"],
      tabular: ["text-sm/5 tabular-nums  text-foreground"],
    },
    variant: textColorVariants,
  },
  defaultVariants: {
    size: "code",
  },
});

export type TextHeadingProps = useRender.ComponentProps<"h1"> & VariantProps<typeof heading>;

export function TextHeading({ level = 1, variant, className, render, ...props }: TextHeadingProps) {
  const defaultProps: useRender.ElementProps<"h1"> = {
    className: heading({ level, variant, className }),
  };

  return useRender({
    defaultTagName: `h${level}`,
    render,
    props: mergeProps<"h1">(defaultProps, props),
    state: {
      slot: "text-heading",
      level,
      variant,
    },
  });
}

export type TextSansProps = TextToneProps<
  Omit<useRender.ComponentProps<"p">, "children"> & Omit<VariantProps<typeof sans>, "variant">
>;

export function TextSans({
  size = "body",
  variant,
  className,
  render,
  children,
  ...props
}: TextSansProps) {
  const defaultProps: useRender.ElementProps<"p"> = {
    className: sans({ size, variant, className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props, toneChildren(variant, children)),
    state: {
      slot: "text-sans",
      size,
      variant,
    },
  });
}

export type TextMonoProps = TextToneProps<
  Omit<useRender.ComponentProps<"p">, "children"> & Omit<VariantProps<typeof mono>, "variant">
>;

export function TextMono({
  size = "code",
  variant,
  className,
  render,
  children,
  ...props
}: TextMonoProps) {
  const defaultProps: useRender.ElementProps<"p"> = {
    className: mono({ size, variant, className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props, toneChildren(variant, children)),
    state: {
      slot: "text-mono",
      size,
      variant,
    },
  });
}

export const Text = {
  Heading: TextHeading,
  Sans: TextSans,
  Mono: TextMono,
};
