export const PLAYGROUND_SERVERS = [
  { id: "raft", name: "Raft Playground", initial: "R" },
  { id: "design-guild", name: "Design Guild", initial: "D" },
  { id: "open-source", name: "Open Source", initial: "O" },
] as const;

export type PlaygroundServerId = (typeof PLAYGROUND_SERVERS)[number]["id"];
export type PlaygroundServer = (typeof PLAYGROUND_SERVERS)[number];
