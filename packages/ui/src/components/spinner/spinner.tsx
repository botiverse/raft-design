import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

const SPINNER_STYLE = `
@keyframes slock-braille-spinner {
  0%,
  9.99% {
    content: "⠋";
  }
  10%,
  19.99% {
    content: "⠙";
  }
  20%,
  29.99% {
    content: "⠹";
  }
  30%,
  39.99% {
    content: "⠸";
  }
  40%,
  49.99% {
    content: "⠼";
  }
  50%,
  59.99% {
    content: "⠴";
  }
  60%,
  69.99% {
    content: "⠦";
  }
  70%,
  79.99% {
    content: "⠧";
  }
  80%,
  89.99% {
    content: "⠇";
  }
  90%,
  100% {
    content: "⠏";
  }
}

[data-slot="spinner"] [data-spinner-glyph]::before {
  content: "⠋";
  animation: slock-braille-spinner 800ms steps(1, end) infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="spinner"] [data-spinner-glyph]::before {
    animation-duration: 1600ms;
  }
}
`;

const spinner = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "font-mono leading-none text-current tabular-nums",
    ],
    glyph: "inline-block min-w-[1ch]",
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    size: {
      sm: {
        root: "h-4 text-base",
      },
      lg: {
        root: "h-6 text-xl",
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const { glyph } = spinner();
const spinnerChildren = (
  <>
    <style href="slock-ui-spinner" precedence="default">
      {SPINNER_STYLE}
    </style>
    <span data-spinner-glyph="" aria-hidden="true" className={glyph()} />
  </>
);

export type SpinnerProps = WithoutChildren<useRender.ComponentProps<"span">> &
  Omit<VariantProps<typeof spinner>, "theme">;

export function Spinner({ size = "sm", className, render, ref, ...props }: SpinnerProps) {
  const theme = useTheme();
  const { root } = spinner({ theme, size });
  const defaultProps: useRender.ElementProps<"span"> = {
    role: "status",
    "aria-label": "Loading",
    className: root({ className }),
    children: spinnerChildren,
  };

  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "spinner",
      size,
    },
  });
}
