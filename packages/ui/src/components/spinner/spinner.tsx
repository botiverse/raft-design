import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv.ts";
import { useThemeFamily } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

const BRAILLE_SPINNER_STYLE = `
@keyframes raft-braille-spinner {
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
  animation: raft-braille-spinner 800ms steps(1, end) infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="spinner"] [data-spinner-glyph]::before {
    animation-duration: 1600ms;
  }
}
`;

const ELEGANT_SPINNER_STYLE = `
@keyframes raft-elegant-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes raft-elegant-spinner-dash {
  0% {
    stroke-dasharray: 1 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -124;
  }
}

[data-slot="spinner"] [data-spinner-ring] {
  animation: raft-elegant-spinner-spin 1600ms linear infinite;
  transform-box: fill-box;
  transform-origin: center;
  will-change: transform;
}

[data-slot="spinner"] [data-spinner-arc] {
  animation: raft-elegant-spinner-dash 1400ms cubic-bezier(0.42, 0, 0.58, 1) infinite;
  stroke-dasharray: 1 150;
  stroke-dashoffset: 0;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="spinner"] [data-spinner-ring] {
    animation-duration: 2400ms;
    will-change: auto;
  }

  [data-slot="spinner"] [data-spinner-arc] {
    animation: none;
    stroke-dasharray: 72 150;
    stroke-dashoffset: -30;
  }
}
`;

const SPINNER_STYLE = `${BRAILLE_SPINNER_STYLE}${ELEGANT_SPINNER_STYLE}`;

const spinner = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "leading-none text-current",
    ],
    glyph: "inline-block min-w-[1ch] font-mono tabular-nums",
    ring: "block size-full shrink-0",
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    size: {
      sm: {},
      lg: {},
    },
  },
  defaultVariants: {
    size: "sm",
  },
  compoundVariants: [
    {
      theme: "brutal",
      size: "sm",
      class: { root: "h-4 text-base" },
    },
    {
      theme: "brutal",
      size: "lg",
      class: { root: "h-6 text-xl" },
    },
    {
      theme: "elegant",
      size: "sm",
      class: { root: "size-3.5" },
    },
    {
      theme: "elegant",
      size: "lg",
      class: { root: "size-[18px]" },
    },
  ],
});

const spinnerStyle = (
  <style href="raft-ui-spinner" precedence="default">
    {SPINNER_STYLE}
  </style>
);

export type SpinnerProps = WithoutChildren<useRender.ComponentProps<"span">> &
  Omit<VariantProps<typeof spinner>, "theme">;

export function Spinner({ size = "sm", className, render, ...props }: SpinnerProps) {
  const theme = useThemeFamily();
  const { root, glyph, ring } = spinner({ theme, size });
  const children =
    theme === "elegant" ? (
      <>
        {spinnerStyle}
        <svg
          data-spinner-ring=""
          aria-hidden="true"
          className={ring()}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle
            data-spinner-arc=""
            className="opacity-80"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            pathLength="150"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        </svg>
      </>
    ) : (
      <>
        {spinnerStyle}
        <span data-spinner-glyph="" aria-hidden="true" className={glyph()} />
      </>
    );
  const defaultProps: useRender.ElementProps<"span"> = {
    role: "status",
    "aria-label": "Loading",
    className: root({ className }),
    children,
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "spinner",
      size,
    },
  });
}
