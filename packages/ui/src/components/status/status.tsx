import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const dot = tv({
  slots: {
    root: ["inline-block shrink-0 rounded-full"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border border-black",
      },
      elegant: {},
    },
    fill: {
      gray: {
        root: "bg-gray-400",
      },
      lime: {
        root: "bg-brutal-lime",
      },
      yellow: {
        root: "bg-brutal-yellow",
      },
      orange: {
        root: "bg-brutal-orange",
      },
      pink: {
        root: "bg-brutal-pink",
      },
      cyan: {
        root: "bg-brutal-cyan",
      },
      red: {
        root: "bg-brutal-red",
      },
      stone: {
        root: "bg-brutal-stone",
      },
    },
  },
});

const status = tv({
  extend: dot,
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    size: {
      sm: {
        root: "size-2",
      },
      md: {
        root: "size-2.5",
      },
      lg: {
        root: "size-[11px]",
      },
    },
    pulse: {
      true: {
        root: "animate-pulse",
      },
      false: {
        root: "",
      },
    },
  },
  defaultVariants: {
    size: "md",
    fill: "gray",
    pulse: false,
  },
});

const attention = tv({
  extend: dot,
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    size: {
      sm: {
        root: "size-1",
      },
      lg: {
        root: "size-2.5",
      },
    },
  },
  defaultVariants: {
    size: "lg",
    fill: "pink",
  },
});

export type StatusProps = Omit<useRender.ComponentProps<"span">, "children"> &
  Omit<VariantProps<typeof status>, "theme">;

export type StatusAttentionProps = Omit<useRender.ComponentProps<"span">, "children"> &
  Omit<VariantProps<typeof attention>, "theme">;

function StatusRoot({ size, fill, pulse, className, render, ref, ...props }: StatusProps) {
  const theme = useTheme();
  const { root } = status({ theme, size, fill, pulse });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "status",
      fill,
      pulse,
      size,
    },
  });
}

function Attention({ size, fill, className, render, ref, ...props }: StatusAttentionProps) {
  const theme = useTheme();
  const { root } = attention({ theme, size, fill });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "status-attention",
      fill,
      size,
    },
  });
}

export const Status = Object.assign(StatusRoot, { Attention });
