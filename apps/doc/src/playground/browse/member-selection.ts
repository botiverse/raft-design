import { PLAYGROUND_ACTORS, type PlaygroundActor } from "../mock/index.ts";

export const memberDetailId = {
  agent: (id: string) => `agent:${id}`,
  human: (id: string) => `human:${id}`,
} as const;

export function getSelectedMember(selectedId?: string): PlaygroundActor | undefined {
  if (!selectedId) return undefined;
  const separator = selectedId.indexOf(":");
  if (separator < 0) return undefined;
  const type = selectedId.slice(0, separator);
  const id = selectedId.slice(separator + 1);
  if (type !== "agent" && type !== "human") return undefined;
  return PLAYGROUND_ACTORS.find((actor) => actor.type === type && actor.id === id);
}
