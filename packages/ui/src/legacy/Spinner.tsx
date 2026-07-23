import type { HTMLAttributes } from "react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerVariant = "default" | "inverse";

const SIZE_CLASS: Record<SpinnerSize, string> = {
  xs: "size-2.5 border-2",
  sm: "size-4 border-2",
  md: "size-5 border-2",
  lg: "size-8 border-2",
};

const VARIANT_CLASS: Record<SpinnerVariant, string> = {
  default: "border-black/20 border-t-black",
  inverse: "border-white/40 border-t-white",
};

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, "size"> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  className?: string;
}

export default function Spinner({
  size = "md",
  variant = "default",
  label,
  className = "",
  ...props
}: SpinnerProps) {
  return (
    <span
      {...props}
      role="status"
      aria-label={label ?? "Loading"}
      className={[
        "inline-block shrink-0 animate-spin rounded-full",
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
