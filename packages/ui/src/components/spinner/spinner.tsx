import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import type { WithoutChildren } from "../../lib/without-children";

// The DS spinner: four pixels lit in turn, never a ring.
const SPINNER_STYLE = `
@keyframes raft-spinner-pixel {
  0%,
  24% {
    opacity: 1;
  }
  25%,
  100% {
    opacity: 0.2;
  }
}

[data-slot="spinner"] [data-spinner-pixel] {
  animation: raft-spinner-pixel 1s steps(1) infinite;
}

[data-slot="spinner"] [data-spinner-pixel]:nth-child(2) {
  animation-delay: 0.25s;
}

[data-slot="spinner"] [data-spinner-pixel]:nth-child(4) {
  animation-delay: 0.5s;
}

[data-slot="spinner"] [data-spinner-pixel]:nth-child(3) {
  animation-delay: 0.75s;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="spinner"] [data-spinner-pixel] {
    animation: none;
  }

  [data-slot="spinner"] [data-spinner-pixel]:first-child {
    opacity: 1;
  }
}
`;

const spinner = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "leading-none text-current",
      "[--spinner-pixel:5px] [--spinner-gap:2px]",
    ],
    ring: [
      "shrink-0",
      "grid size-auto grid-cols-[repeat(2,var(--spinner-pixel))] gap-(--spinner-gap)",
    ],
    pixel: ["block size-(--spinner-pixel) rounded-[1px] bg-current opacity-20"],
  },
  variants: {
    size: {
      xs: { root: ["[--spinner-pixel:4px] [--spinner-gap:1.5px]"] },
      sm: {},
      md: { root: ["[--spinner-pixel:6px] [--spinner-gap:2px]"] },
      lg: { root: ["[--spinner-pixel:8px] [--spinner-gap:3px]"] },
    },
    variant: {
      default: {},
      inverse: { root: ["text-foreground-inverse"] },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const spinnerStyle = (
  <style href="raft-ui-spinner" precedence="default">
    {SPINNER_STYLE}
  </style>
);

export type SpinnerProps = WithoutChildren<useRender.ComponentProps<"span">> &
  VariantProps<typeof spinner>;

export function Spinner({
  size = "sm",
  variant = "default",
  className,
  render,
  ...props
}: SpinnerProps) {
  const { root, ring, pixel } = spinner({ size, variant });
  const children = (
    <>
      {spinnerStyle}
      <span data-spinner-grid="" aria-hidden="true" className={ring()}>
        <span data-spinner-pixel="" className={pixel()} />
        <span data-spinner-pixel="" className={pixel()} />
        <span data-spinner-pixel="" className={pixel()} />
        <span data-spinner-pixel="" className={pixel()} />
      </span>
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
