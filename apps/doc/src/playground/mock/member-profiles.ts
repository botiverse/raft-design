import type { PlaygroundActor, PlaygroundActorId } from "./actors.ts";

export type PlaygroundMemberRole = "owner" | "admin" | "member";

export type PlaygroundHumanProfile = {
  actorId: PlaygroundActorId;
  createdAgentIds: readonly PlaygroundActorId[];
  email: string;
  handle: string;
  joinedAt: string;
  role: PlaygroundMemberRole;
};

const humanProfiles = {
  robin: {
    actorId: "robin",
    createdAgentIds: ["atlas"],
    email: "robin@zolplay.com",
    handle: "robin",
    joinedAt: "May 27, 2026",
    role: "owner",
  },
  developer: {
    actorId: "developer",
    createdAgentIds: ["codePilot"],
    email: "developer@zolplay.com",
    handle: "developer",
    joinedAt: "May 29, 2026",
    role: "admin",
  },
  ada: {
    actorId: "ada",
    createdAgentIds: ["mira"],
    email: "ada@zolplay.com",
    handle: "ada",
    joinedAt: "Jun 1, 2026",
    role: "member",
  },
  cindy: {
    actorId: "cindy",
    createdAgentIds: ["deployBot"],
    email: "cindy@zolplay.com",
    handle: "cindy",
    joinedAt: "Jun 3, 2026",
    role: "member",
  },
} as const satisfies Partial<Record<PlaygroundActorId, PlaygroundHumanProfile>>;

export function getPlaygroundHumanProfile(actor: PlaygroundActor): PlaygroundHumanProfile {
  if (actor.type !== "human") {
    throw new Error(`Expected a human actor, received ${actor.type}:${actor.id}`);
  }

  const profile = humanProfiles[actor.id as keyof typeof humanProfiles];
  if (profile) return profile;

  return {
    actorId: actor.id as PlaygroundActorId,
    createdAgentIds: [],
    email: `${actor.id}@zolplay.com`,
    handle: actor.id,
    joinedAt: "Jun 5, 2026",
    role: actor.meta === "admin" ? "admin" : "member",
  };
}
