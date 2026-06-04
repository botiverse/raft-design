import type { HTMLAttributes } from "react";

type SpanPassthroughProps = HTMLAttributes<HTMLSpanElement> &
  Record<`data-${string}`, string | undefined>;

export interface AttentionDotProps extends Omit<SpanPassthroughProps, "children"> {
  size?: "sm" | "lg";
  tone?: string;
}

const SIZE_CLASS: Record<NonNullable<AttentionDotProps["size"]>, string> = {
  sm: "size-1",
  lg: "size-2.5",
};

export default function AttentionDot({
  size = "lg",
  tone = "bg-brutal-pink",
  className,
  ...rest
}: AttentionDotProps) {
  return (
    <span
      {...rest}
      className={`inline-block shrink-0 rounded-full border border-black ${SIZE_CLASS[size]} ${tone} ${className ?? ""}`}
    />
  );
}
