import type { Agent } from "../../store/agentStore";
import type { User } from "../../store/authStore";
import type { Channel } from "../../store/channelStore";
import type { ServerMember } from "../../store/serverStore";

export type SearchEntityType = "channel" | "agentDm" | "humanDm";

export interface SearchEntityResult {
  key: string;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  channelId: string | null;
  agentId: string | null;
  userId: string | null;
  archivedAt: string | null;
  score: number;
}

interface SearchEntityCandidate {
  key: string;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  aliases: string[];
  channelId: string | null;
  agentId: string | null;
  userId: string | null;
  archivedAt: string | null;
}

type ScoredSearchEntityCandidate = SearchEntityCandidate & { score: number };

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function scoreAliasMatch(alias: string, query: string): number {
  const normalizedAlias = normalize(alias);
  if (!normalizedAlias || !query) return -1;
  if (normalizedAlias === query) return 400;
  if (normalizedAlias.startsWith(query)) return 300;
  if (normalizedAlias.split(/[\s._-]+/).some((part) => part.startsWith(query))) return 250;
  const index = normalizedAlias.indexOf(query);
  if (index >= 0) return 150 - Math.min(index, 100);
  return -1;
}

function dedupeAliases(values: (string | null | undefined)[]): string[] {
  const unique = new Set<string>();
  for (const value of values) {
    const normalized = normalize(value ?? "");
    if (!normalized) continue;
    unique.add(value!.trim());
  }
  return [...unique];
}

export function buildSearchEntityResults(params: {
  query: string;
  channels: Channel[];
  members: ServerMember[];
  agents: Agent[];
  currentUser: User | null;
  dmChannels: Channel[];
}): SearchEntityResult[] {
  const query = normalize(params.query);
  if (!query) return [];

  const candidates: SearchEntityCandidate[] = [];

  for (const channel of params.channels) {
    candidates.push({
      key: `channel:${channel.id}`,
      type: "channel",
      title: channel.name,
      subtitle: "Channel",
      aliases: dedupeAliases([channel.name, channel.description]),
      channelId: channel.id,
      agentId: null,
      userId: null,
      archivedAt: channel.archivedAt ?? null,
    });
  }

  for (const agent of params.agents) {
    if (agent.deletedAt) continue;
    const dmChannel = params.dmChannels.find((channel) => channel.peerType === "agent" && channel.peerId === agent.id);
    const visibleName = agent.displayName || agent.name;
    const secondaryName = agent.displayName ? `@${agent.name}` : "Agent DM";
    candidates.push({
      key: `agent:${agent.id}`,
      type: "agentDm",
      title: visibleName,
      subtitle: secondaryName,
      aliases: dedupeAliases([agent.displayName, agent.name, `@${agent.name}`]),
      channelId: dmChannel?.id ?? null,
      agentId: agent.id,
      userId: null,
      archivedAt: null,
    });
  }

  for (const member of params.members) {
    const dmChannel = params.dmChannels.find((channel) => channel.peerType === "user" && channel.peerId === member.userId);
    const visibleName = member.displayName || member.name;
    const isSelf = member.userId === params.currentUser?.id;
    const secondaryName = isSelf
      ? "Self DM"
      : member.description || (member.displayName ? member.name : "");
    candidates.push({
      key: `human:${member.userId}`,
      type: "humanDm",
      title: visibleName,
      subtitle: secondaryName,
      aliases: dedupeAliases([
        member.displayName,
        member.name,
        member.description,
        ...(isSelf ? ["self", "me", "myself", "self dm"] : []),
      ]),
      channelId: dmChannel?.id ?? null,
      agentId: null,
      userId: member.userId,
      archivedAt: null,
    });
  }

  return candidates
    .map((candidate) => {
      const score = Math.max(...candidate.aliases.map((alias) => scoreAliasMatch(alias, query)));
      return score < 0 ? null : { ...candidate, score };
    })
    .filter((candidate): candidate is ScoredSearchEntityCandidate => candidate !== null)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.type !== right.type) {
        const order: Record<SearchEntityType, number> = { channel: 0, agentDm: 1, humanDm: 2 };
        return order[left.type] - order[right.type];
      }
      return left.title.localeCompare(right.title);
    })
    .map(({ key, type, title, subtitle, channelId, agentId, userId, archivedAt, score }) => ({
      key,
      type,
      title,
      subtitle,
      channelId,
      agentId,
      userId,
      archivedAt,
      score,
    }));
}
