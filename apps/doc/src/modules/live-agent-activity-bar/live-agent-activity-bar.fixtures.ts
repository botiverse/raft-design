import type { LiveAgentActivityBarItem } from "./live-agent-activity-bar.composition.tsx";

export const LIVE_AGENT_ACTIVITY_PREVIEW = {
  activity: "thinking",
  agentAvatarSrc: null,
  text: "Thinking…",
} as const satisfies LiveAgentActivityBarItem;
