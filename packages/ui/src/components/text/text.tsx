import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

const textColorVariants = {
  default: ["text-foreground"],
  primary: ["text-brand-strong"],
  information: ["text-info-strong"],
  muted: ["text-foreground-muted"],
  placeholder: ["text-foreground-hint"],
  accent: ["text-attention-700"],
  success: ["text-success"],
  warning: ["text-warning"],
  danger: ["text-danger"],
};

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
    variant: textColorVariants,
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
      small: ["text-sm/5  text-foreground-muted"],
      caption: ["text-xs/4  text-foreground-muted"],
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
      meta: ["text-xs/4  text-foreground-muted"],
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

export type TextSansProps = useRender.ComponentProps<"p"> & VariantProps<typeof sans>;

export function TextSans({ size = "body", variant, className, render, ...props }: TextSansProps) {
  const defaultProps: useRender.ElementProps<"p"> = {
    className: sans({ size, variant, className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
    state: {
      slot: "text-sans",
      size,
      variant,
    },
  });
}

export type TextMonoProps = useRender.ComponentProps<"p"> & VariantProps<typeof mono>;

export function TextMono({ size = "code", variant, className, render, ...props }: TextMonoProps) {
  const defaultProps: useRender.ElementProps<"p"> = {
    className: mono({ size, variant, className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
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
