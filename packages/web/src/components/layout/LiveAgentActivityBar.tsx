import { useEffect } from "react";
import { LIVE_AGENT_ACTIVITY_VISIBLE_MS, type LiveAgentActivityItem } from "../../utils/liveAgentActivity";
import { useLiveAgentActivityStore } from "../../store/liveAgentActivityStore";
import AvatarSlot from "../ui/AvatarSlot";
import StatusDot from "../ui/StatusDot";

export default function LiveAgentActivityBar({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "mobile";
}) {
  const latest = useLiveAgentActivityStore((state) => state.items[0] ?? null);

  useEffect(() => {
    if (!latest) return;

    const remainingMs = LIVE_AGENT_ACTIVITY_VISIBLE_MS - (Date.now() - latest.createdAt);
    const timeout = window.setTimeout(() => {
      useLiveAgentActivityStore.getState().pruneExpired();
    }, Math.max(0, remainingMs) + 50);

    return () => window.clearTimeout(timeout);
  }, [latest]);

  if (!latest) return null;

  return <LiveAgentActivityBarPresentation latest={latest} variant={variant} />;
}

export function LiveAgentActivityBarPresentation({
  latest,
  variant = "sidebar",
}: {
  latest: LiveAgentActivityItem | null;
  variant?: "sidebar" | "mobile";
}) {
  if (!latest) return null;

  const containerClassName = variant === "mobile"
    ? "border-t-2 border-black bg-white px-3 py-2"
    : "border-t-2 border-black bg-brutal-cream px-3 py-2";

  return (
    <div
      data-testid="live-agent-activity-bar"
      className={containerClassName}
      aria-live="polite"
    >
      <div className="flex min-h-8 items-center gap-2">
        <AvatarSlot
          context="compact-list"
          type="agent"
          agentAvatarUrl={latest.agentAvatarUrl}
        />
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <StatusDot activity={latest.activity ?? "offline"} className="shrink-0" />
          <span className="min-w-0 truncate text-sm text-black/60 font-mono" title={latest.text}>
            {latest.text}
          </span>
        </div>
      </div>
    </div>
  );
}
