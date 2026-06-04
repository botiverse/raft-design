import type { ComponentProps } from "react";
import { cn } from "tailwind-variants";

type SpinnerSize = "sm" | "lg";

type SpinnerProps = ComponentProps<"span"> & {
  size?: SpinnerSize;
};

const SPINNER_STYLE = `
@keyframes sitefire-braille-spinner {
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
  animation: sitefire-braille-spinner 800ms steps(1, end) infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="spinner"] [data-spinner-glyph]::before {
    animation-duration: 1600ms;
  }
}
`;

export default function Spinner({
  className,
  size = "sm",
  "aria-label": ariaLabel = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <span
      data-slot="spinner"
      data-size={size}
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center font-mono leading-none text-current tabular-nums",
        size === "sm" ? "h-4 text-base" : "h-6 text-xl",
        className,
      )}
      {...props}
    >
      <style>{SPINNER_STYLE}</style>
      <span data-spinner-glyph="" aria-hidden="true" className="inline-block min-w-[1ch]" />
    </span>
  );
}
