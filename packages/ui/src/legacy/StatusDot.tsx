import type { HTMLAttributes } from "react";

type AgentActivity = "online" | "thinking" | "working" | "error" | "offline";

type SpanPassthroughProps = HTMLAttributes<HTMLSpanElement> &
  Record<`data-${string}`, string | undefined>;

export interface StatusDotProps extends Omit<SpanPassthroughProps, "children"> {
  activity?: AgentActivity;
  tone?: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const SIZE_CLASS: Record<NonNullable<StatusDotProps["size"]>, string> = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-[11px]",
};

function getActivityDotClass(activity: AgentActivity): string {
  switch (activity) {
    case "online":
      return "bg-brutal-lime";
    case "thinking":
    case "working":
      return "bg-brutal-yellow animate-pulse";
    case "error":
      return "bg-brutal-orange";
    case "offline":
    default:
      return "bg-gray-400";
  }
}

export default function StatusDot({
  activity,
  tone,
  size = "md",
  pulse = false,
  className,
  ...rest
}: StatusDotProps) {
  const colorClass = activity ? getActivityDotClass(activity) : (tone ?? "bg-gray-400");
  return (
    <span
      {...rest}
      className={`inline-block shrink-0 rounded-full border border-black ${SIZE_CLASS[size]} ${colorClass} ${pulse ? "animate-pulse" : ""} ${className ?? ""}`}
    />
  );
}
