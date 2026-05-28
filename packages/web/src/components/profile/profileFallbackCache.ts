import type { Agent } from "../../store/agentStore";
import type { ChannelHuman } from "../../hooks/useChannelMembers";
import type { HumanProfile } from "../member/HumanDetailPanel";

const agentProfileCache = new Map<string, Agent>();
const humanProfileCache = new Map<string, HumanProfile>();

function humanCacheKey(serverId: string, userId: string) {
  return `${serverId}:${userId}`;
}

export function getCachedAgentProfile(agentId: string): Agent | null {
  return agentProfileCache.get(agentId) ?? null;
}

export function setCachedAgentProfile(agent: Agent) {
  agentProfileCache.set(agent.id, agent);
}

export function getCachedHumanProfile(serverId: string, userId: string): HumanProfile | null {
  return humanProfileCache.get(humanCacheKey(serverId, userId)) ?? null;
}

export function setCachedHumanProfile(serverId: string, human: HumanProfile) {
  humanProfileCache.set(humanCacheKey(serverId, human.userId), human);
}

export function primeHumanProfileFromChannelMember(serverId: string, human: ChannelHuman) {
  setCachedHumanProfile(serverId, {
    userId: human.id,
    serverId: human.serverId,
    serverName: human.serverName,
    serverSlug: human.serverSlug,
    email: null,
    gravatarHash: "",
    name: human.name,
    displayName: human.displayName,
    description: human.description,
    avatarUrl: human.avatarUrl,
    role: null,
    joinedAt: null,
    membershipStatus: "active",
    createdAgents: [],
  });
}
