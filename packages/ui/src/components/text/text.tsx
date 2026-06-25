import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv.ts";

const textColorVariants = {
  default: ["text-foreground-strong"],
  primary: ["text-primary-700"],
  information: ["text-info-dark"],
  muted: ["text-foreground-muted"],
  placeholder: ["text-foreground-placeholder"],
  accent: ["text-accent-700"],
  success: ["text-success-base"],
  warning: ["text-warning-base"],
  danger: ["text-danger-base"],
};

const heading = tv({
  base: ["m-0 font-heading font-medium text-foreground-strong"],
  variants: {
    level: {
      1: ["text-[3.5rem] tracking-[-0.01em] leading-[64px]"],
      2: ["text-[3rem] tracking-[-0.01em] leading-[56px]"],
      3: ["text-[2.5rem] tracking-[-0.01em] leading-[48px]"],
      4: ["text-[2rem] tracking-[-0.005em] leading-[40px]"],
      5: ["text-[1.5rem] leading-8"],
      6: ["text-[1.25rem] leading-7"],
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
      large: ["text-lg leading-7 text-foreground"],
      body: ["text-base leading-6 text-foreground"],
      small: ["text-sm leading-5 text-foreground-muted"],
      caption: ["text-xs leading-4 text-foreground-muted"],
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
      code: ["text-sm leading-5 text-foreground"],
      meta: ["text-xs leading-4 text-foreground-muted"],
      eyebrow: [
        "text-[10px] font-medium uppercase tracking-wide leading-none",
        "text-foreground-placeholder",
      ],
      tabular: ["text-sm tabular-nums leading-5 text-foreground"],
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
