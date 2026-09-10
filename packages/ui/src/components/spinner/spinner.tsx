import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { WithoutChildren } from "../../lib/without-children";

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

const spinner = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "leading-none text-current",
    ],
    ring: "block size-full shrink-0",
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
    },
    variant: {
      default: {},
      inverse: {},
    },
  },
  defaultVariants: {
    size: "sm",
  },
  compoundVariants: [
    {
      theme: "brutal",
      size: "xs",
      class: { root: "size-2.5" },
    },
    {
      theme: "brutal",
      size: "sm",
      class: { root: "size-4" },
    },
    {
      theme: "brutal",
      size: "md",
      class: { root: "size-5" },
    },
    {
      theme: "brutal",
      size: "lg",
      class: { root: "size-8" },
    },
    {
      theme: "brutal",
      variant: "default",
      class: {
        root: "text-black",
        ring: "animate-spin rounded-full border-2 border-current/20 border-t-current",
      },
    },
    {
      theme: "brutal",
      variant: "inverse",
      class: {
        root: "text-white",
        ring: "animate-spin rounded-full border-2 border-current/40 border-t-current",
      },
    },
    {
      theme: "elegant",
      size: "xs",
      class: { root: "size-3.5" },
    },
    {
      theme: "elegant",
      size: "sm",
      class: { root: "size-3.5" },
    },
    {
      theme: "elegant",
      size: "md",
      class: { root: "size-4.5" },
    },
    {
      theme: "elegant",
      size: "lg",
      class: { root: "size-4.5" },
    },
  ],
});

const spinnerStyle = (
  <style href="raft-ui-spinner" precedence="default">
    {ELEGANT_SPINNER_STYLE}
  </style>
);

export type SpinnerProps = WithoutChildren<useRender.ComponentProps<"span">> &
  Omit<VariantProps<typeof spinner>, "theme">;

export function Spinner({
  size = "sm",
  variant = "default",
  className,
  render,
  ...props
}: SpinnerProps) {
  const theme = useThemeFamily();
  const { root, ring } = spinner({ theme, size, variant });
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
      <span data-spinner-ring="" aria-hidden="true" className={ring()} />
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
