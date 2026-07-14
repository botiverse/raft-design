import type { PlaygroundActorId } from "./actors.ts";

export type PlaygroundLiveAgentActivity = {
  activity: "thinking" | "working";
  actorId: PlaygroundActorId;
  text: string;
};

export const PLAYGROUND_LIVE_AGENT_ACTIVITY = {
  activity: "working",
  actorId: "deployBot",
  text: "Deploying the release candidate to staging…",
} as const satisfies PlaygroundLiveAgentActivity;
