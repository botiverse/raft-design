import type { LiveAgentActivityBarItem } from "./live-agent-activity-bar.composition.tsx";

export const LIVE_AGENT_ACTIVITY_PREVIEW = {
  agentAvatarSrc: null,
  text: "Thinking…",
} as const satisfies LiveAgentActivityBarItem;
