export const models = [
  { id: "reasoning", label: "Raft Reasoning", description: "Long-context planning" },
  { id: "fast", label: "Raft Fast", description: "Low-latency responses" },
  { id: "vision", label: "Raft Vision", description: "Image understanding" },
  { id: "code", label: "Raft Code", description: "Repository-aware coding" },
] as const;

export type Model = (typeof models)[number];
