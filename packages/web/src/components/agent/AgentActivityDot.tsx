import { useAgentDisplayState } from "../../store/agentStore";
import type { AgentActivity } from "@slock-ai/shared";
import StatusDot, { type StatusDotProps } from "../ui/StatusDot";

/**
 * Isolated component that subscribes to a single agent's activity and renders
 * a colored `<StatusDot />`. This is the zustand-bound flavor — for static
 * activity values, use `<StatusDot activity={...} />` directly.
 *
 * Pass `size` / `className` through to control size and positioning
 * (e.g. `size="lg"` + `className="absolute -bottom-0.5 -right-0.5"` for an
 * avatar overlay).
 */
export default function AgentActivityDot({
  agentId,
  fallbackActivity = "offline",
  size,
  className,
  ...rest
}: { agentId: string; fallbackActivity?: AgentActivity } & Omit<StatusDotProps, "activity" | "tone">) {
  const fallbackStatus = fallbackActivity === "offline" ? "stopped" : "active";
  const displayState = useAgentDisplayState(agentId, { status: fallbackStatus });
  const title = rest.title ?? displayState.activityText;
  return <StatusDot activity={displayState.activity} size={size} className={className} {...rest} title={title} />;
}
