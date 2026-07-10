export type PlaygroundPresence = "online" | "working" | "idle" | "offline";

export type PlaygroundActor = {
  id: string;
  name: string;
  type: "human" | "agent";
  meta: string;
  presence?: PlaygroundPresence;
  fallback?: string;
  avatarSrc?: string;
};

const humanAvatar = (photoId: string) =>
  `https://unsplash.com/photos/${photoId}/download?force=true&w=160&h=160&fit=crop&crop=faces`;

const agentPixelAvatar = (fill: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="crispEdges"><rect width="64" height="64" fill="${fill}"/><rect x="8" y="0" width="48" height="8" fill="#141111"/><rect x="0" y="8" width="8" height="24" fill="#141111"/><rect x="56" y="8" width="8" height="24" fill="#141111"/><rect x="8" y="32" width="48" height="8" fill="#141111"/><rect x="16" y="16" width="8" height="8" fill="#FFFFFF"/><rect x="40" y="16" width="8" height="8" fill="#FFFFFF"/><rect x="16" y="48" width="8" height="16" fill="#141111"/><rect x="40" y="48" width="8" height="16" fill="#141111"/></svg>`,
  )}`;

export const PLAYGROUND_ACTORS = [
  { id: "cuvii", name: "Cuvii", type: "human", meta: "member", fallback: "C" },
  { id: "developer", name: "Developer", type: "human", meta: "member", fallback: "D" },
  { id: "ada", name: "Ada", type: "human", meta: "member", fallback: "A" },
  { id: "avery", name: "Avery", type: "human", meta: "product", fallback: "A" },
  { id: "cindy", name: "Cindy", type: "human", meta: "design", fallback: "C" },
  { id: "mxChen", name: "Mx. Chen", type: "human", meta: "member", fallback: "MC" },
  { id: "viewer", name: "Viewer", type: "human", meta: "viewer", fallback: "V" },
  { id: "admin", name: "Admin", type: "human", meta: "admin", fallback: "A" },
  {
    id: "noah",
    name: "Noah Bennett",
    type: "human",
    meta: "growth",
    fallback: "N",
    avatarSrc: humanAvatar("n4KewLKFOZw"),
  },
  {
    id: "samira",
    name: "Samira Khan",
    type: "human",
    meta: "security",
    fallback: "S",
    avatarSrc: humanAvatar("H6FbE_vxaxQ"),
  },
  {
    id: "elliot",
    name: "Elliot Park",
    type: "human",
    meta: "developer experience",
    fallback: "E",
    avatarSrc: humanAvatar("mxwcEIqJ63Y"),
  },
  {
    id: "olivia",
    name: "Olivia Carter",
    type: "human",
    meta: "quality assurance",
    fallback: "O",
    avatarSrc: humanAvatar("8CEKQlmnf50"),
  },
  {
    id: "mateo",
    name: "Mateo Alvarez",
    type: "human",
    meta: "infrastructure",
    fallback: "M",
    avatarSrc: humanAvatar("iFgRcqHznqg"),
  },
  {
    id: "atlas",
    name: "Atlas",
    type: "agent",
    meta: "claude-opus",
    presence: "online",
    avatarSrc: agentPixelAvatar("#27CCF3"),
  },
  {
    id: "claudeAssistant",
    name: "Claude Assistant",
    type: "agent",
    meta: "claude-opus",
    presence: "online",
    avatarSrc: agentPixelAvatar("#27CCF3"),
  },
  {
    id: "deployBot",
    name: "Deploy Bot",
    type: "agent",
    meta: "deploy agent",
    presence: "working",
    avatarSrc: agentPixelAvatar("#FF9F43"),
  },
  {
    id: "nyx",
    name: "Nyx",
    type: "agent",
    meta: "external agent",
    presence: "online",
    avatarSrc: agentPixelAvatar("#7DD3FC"),
  },
  {
    id: "relay",
    name: "Relay",
    type: "agent",
    meta: "shared agent",
    presence: "working",
    avatarSrc: agentPixelAvatar("#5EEAD4"),
  },
  {
    id: "legacyBot",
    name: "Legacy Bot",
    type: "agent",
    meta: "deactivated agent",
    presence: "offline",
    avatarSrc: agentPixelAvatar("#A3A3A3"),
  },
  {
    id: "mira",
    name: "Mira",
    type: "agent",
    meta: "research agent",
    presence: "working",
    avatarSrc: agentPixelAvatar("#B794F4"),
  },
  {
    id: "searchScout",
    name: "Search Scout",
    type: "agent",
    meta: "retrieval agent",
    presence: "idle",
    avatarSrc: agentPixelAvatar("#F7D358"),
  },
  {
    id: "releaseScribe",
    name: "Release Scribe",
    type: "agent",
    meta: "release agent",
    presence: "working",
    avatarSrc: agentPixelAvatar("#FF7AB6"),
  },
  {
    id: "codePilot",
    name: "Code Pilot",
    type: "agent",
    meta: "coding agent",
    presence: "online",
    avatarSrc: agentPixelAvatar("#A3E86A"),
  },
  {
    id: "incidentTriage",
    name: "Incident Triage",
    type: "agent",
    meta: "operations agent",
    presence: "offline",
    avatarSrc: agentPixelAvatar("#FF9F43"),
  },
  {
    id: "qaSentinel",
    name: "QA Sentinel",
    type: "agent",
    meta: "quality agent",
    avatarSrc: agentPixelAvatar("#B794F4"),
  },
  {
    id: "deployWatch",
    name: "Deploy Watch",
    type: "agent",
    meta: "deployment agent",
    presence: "working",
    avatarSrc: agentPixelAvatar("#5EEAD4"),
  },
  {
    id: "researchLark",
    name: "Research Lark",
    type: "agent",
    meta: "research agent",
    presence: "idle",
    avatarSrc: agentPixelAvatar("#FB7185"),
  },
  {
    id: "specWriter",
    name: "Spec Writer",
    type: "agent",
    meta: "product agent",
    presence: "idle",
    avatarSrc: agentPixelAvatar("#7DD3FC"),
  },
  {
    id: "dataWeaver",
    name: "Data Weaver",
    type: "agent",
    meta: "analytics agent",
    presence: "working",
    avatarSrc: agentPixelAvatar("#FBBF24"),
  },
  {
    id: "supportGuide",
    name: "Support Guide",
    type: "agent",
    meta: "support agent",
    presence: "idle",
    avatarSrc: agentPixelAvatar("#F9A8D4"),
  },
] as const satisfies readonly PlaygroundActor[];

export type PlaygroundActorId = (typeof PLAYGROUND_ACTORS)[number]["id"];

const actorsById = new Map<PlaygroundActorId, PlaygroundActor>();
for (const actor of PLAYGROUND_ACTORS) {
  if (actorsById.has(actor.id)) {
    throw new Error(`Duplicate playground actor: ${actor.id}`);
  }
  actorsById.set(actor.id, actor);
}

export function getPlaygroundActor(id: PlaygroundActorId): PlaygroundActor {
  const actor = actorsById.get(id);
  if (!actor) throw new Error(`Unknown playground actor: ${id}`);
  return actor;
}

const INVITABLE_ACTOR_IDS = [
  "atlas",
  "avery",
  "mira",
] as const satisfies readonly PlaygroundActorId[];

export const PLAYGROUND_INVITABLE_ACTORS = INVITABLE_ACTOR_IDS.map(getPlaygroundActor);
