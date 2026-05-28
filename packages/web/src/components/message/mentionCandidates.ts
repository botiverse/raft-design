import type { Message } from "../../store/messageStore";

export interface MentionCandidate {
  id: string;
  serverId?: string | null;
  serverName?: string | null;
  serverSlug?: string | null;
  name: string;
  displayName: string | null;
  type: "agent" | "user";
  avatarUrl: string | null;
  gravatarHash?: string | null;
  email?: string | null;
  description?: string | null;
}

interface BuildMentionCandidateGroupsOptions {
  candidates: MentionCandidate[];
  query: string;
  channelMemberIds: Set<string>;
  threadMessages?: Message[];
  prioritizeThreadParticipants?: boolean;
}

interface MentionCandidateGroups {
  inChannel: MentionCandidate[];
  notInChannel: MentionCandidate[];
  flat: MentionCandidate[];
}

export function getMentionCandidateDescription(candidate: MentionCandidate): string | null {
  if (candidate.type !== "agent") return null;
  const description = candidate.description?.trim().replace(/\s+/g, " ");
  return description || null;
}

export function getMentionCandidateServerLabel(candidate: MentionCandidate): string | null {
  return candidate.serverName || candidate.serverSlug || null;
}

function buildRecentParticipantRanks(threadMessages: Message[]): Map<string, number> {
  const ranks = new Map<string, number>();
  let nextRank = 0;

  for (let i = threadMessages.length - 1; i >= 0; i -= 1) {
    const senderId = threadMessages[i]?.senderId;
    if (!senderId || ranks.has(senderId)) continue;
    ranks.set(senderId, nextRank);
    nextRank += 1;
  }

  return ranks;
}

function sortByThreadRecency(
  candidates: MentionCandidate[],
  originalOrder: Map<string, number>,
  recentParticipantRanks: Map<string, number>,
): MentionCandidate[] {
  return [...candidates].sort((a, b) => {
    const aRank = recentParticipantRanks.get(a.id) ?? Number.POSITIVE_INFINITY;
    const bRank = recentParticipantRanks.get(b.id) ?? Number.POSITIVE_INFINITY;
    if (aRank !== bRank) return aRank - bRank;

    const aOrder = originalOrder.get(a.id) ?? Number.POSITIVE_INFINITY;
    const bOrder = originalOrder.get(b.id) ?? Number.POSITIVE_INFINITY;
    return aOrder - bOrder;
  });
}

export function buildMentionCandidateGroups({
  candidates,
  query,
  channelMemberIds,
  threadMessages = [],
  prioritizeThreadParticipants = false,
}: BuildMentionCandidateGroupsOptions): MentionCandidateGroups {
  const normalizedQuery = query.toLowerCase();
  const queryFiltered = normalizedQuery
    ? candidates.filter((candidate) =>
        candidate.name.toLowerCase().includes(normalizedQuery) ||
        (candidate.displayName && candidate.displayName.toLowerCase().includes(normalizedQuery)))
    : candidates;

  const inChannel = queryFiltered.filter((candidate) => channelMemberIds.has(candidate.id));
  const notInChannel = queryFiltered.filter((candidate) => !channelMemberIds.has(candidate.id));

  if (!prioritizeThreadParticipants || threadMessages.length === 0) {
    return { inChannel, notInChannel, flat: [...inChannel, ...notInChannel] };
  }

  const originalOrder = new Map(queryFiltered.map((candidate, index) => [candidate.id, index]));
  const recentParticipantRanks = buildRecentParticipantRanks(threadMessages);
  const sortedInChannel = sortByThreadRecency(inChannel, originalOrder, recentParticipantRanks);
  const sortedNotInChannel = sortByThreadRecency(notInChannel, originalOrder, recentParticipantRanks);

  return {
    inChannel: sortedInChannel,
    notInChannel: sortedNotInChannel,
    flat: [...sortedInChannel, ...sortedNotInChannel],
  };
}
