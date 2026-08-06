import type {
  SearchChannelFixture,
  SearchEntityFixture,
  SearchMessageFixture,
  SearchSenderFixture,
} from "./search.fixtures.ts";
import type {
  SearchScope,
  SearchSort,
  SearchTimeRange,
} from "./search-panel/search-panel.parts.tsx";

export const SEARCH_PAGE_SIZE = 4;

export function normalizeSearchQuery(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function getExclusiveSenderKind(scopes: readonly SearchScope[]) {
  const hasHumans = scopes.includes("humans");
  const hasAgents = scopes.includes("agents");
  if (hasHumans === hasAgents) return null;
  return hasHumans ? "human" : "agent";
}

type SearchEntityScore = {
  rank: number;
  fieldPriority: number;
  position: number;
  gap: number;
};

const SEARCH_ENTITY_TYPE_ORDER: Record<SearchEntityFixture["type"], number> = {
  channel: 0,
  computer: 1,
  agentDm: 2,
  humanDm: 3,
};

function normalizeSearchText(value: string) {
  const tokens = value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return { compact: tokens.join(""), tokens };
}

function getTokenPrefixScore(candidateTokens: readonly string[], queryTokens: readonly string[]) {
  if (candidateTokens.length === 0 || queryTokens.length === 0) return null;
  const start = candidateTokens.findIndex((token) => token.startsWith(queryTokens[0] ?? ""));
  if (start < 0) return null;
  let candidateIndex = start;
  for (const queryToken of queryTokens) {
    while (
      candidateIndex < candidateTokens.length &&
      !candidateTokens[candidateIndex]?.startsWith(queryToken)
    ) {
      candidateIndex += 1;
    }
    if (candidateIndex >= candidateTokens.length) return null;
    candidateIndex += 1;
  }
  return { position: start, gap: candidateIndex - start - queryTokens.length };
}

function scoreEntity(entity: SearchEntityFixture, query: string): SearchEntityScore | null {
  const cleanQuery = normalizeSearchQuery(query).replace(/^[@#]/, "");
  if (!cleanQuery) return { rank: 0, fieldPriority: 0, position: 0, gap: 0 };
  const normalizedQuery = normalizeSearchText(cleanQuery);
  let best: SearchEntityScore | null = null;
  for (const field of entity.fields) {
    const raw = normalizeSearchQuery(field.value);
    const normalizedField = normalizeSearchText(field.value);
    const compactPosition = normalizedField.compact.indexOf(normalizedQuery.compact);
    const tokenPrefix = getTokenPrefixScore(normalizedField.tokens, normalizedQuery.tokens);
    const legacyPosition = raw.indexOf(cleanQuery);
    let candidate: SearchEntityScore | null = null;
    if (normalizedQuery.compact === normalizedField.compact) {
      candidate = { rank: 0, fieldPriority: field.priority, position: 0, gap: 0 };
    } else if (
      normalizedQuery.compact &&
      normalizedField.compact.startsWith(normalizedQuery.compact)
    ) {
      candidate = {
        rank: 1,
        fieldPriority: field.priority,
        position: 0,
        gap: normalizedField.compact.length - normalizedQuery.compact.length,
      };
    } else if (normalizedQuery.compact && tokenPrefix) {
      candidate = { rank: 2, fieldPriority: field.priority, ...tokenPrefix };
    } else if (normalizedQuery.compact && compactPosition >= 0) {
      candidate = { rank: 3, fieldPriority: field.priority, position: compactPosition, gap: 0 };
    } else if (legacyPosition >= 0) {
      candidate = { rank: 7, fieldPriority: field.priority, position: legacyPosition, gap: 0 };
    }
    if (
      candidate &&
      (!best ||
        candidate.rank < best.rank ||
        (candidate.rank === best.rank && candidate.fieldPriority < best.fieldPriority) ||
        (candidate.rank === best.rank &&
          candidate.fieldPriority === best.fieldPriority &&
          (candidate.position < best.position ||
            (candidate.position === best.position && candidate.gap < best.gap))))
    ) {
      best = candidate;
    }
  }
  return best;
}

export function rankSearchEntities(entities: readonly SearchEntityFixture[], query: string) {
  const prefix = normalizeSearchQuery(query)[0];
  const matches: { entity: SearchEntityFixture; index: number; score: SearchEntityScore }[] = [];
  for (const [index, entity] of entities.entries()) {
    if (prefix === "#" && entity.type !== "channel") continue;
    if (prefix === "@" && entity.type !== "agentDm" && entity.type !== "humanDm") continue;
    const entityScore = scoreEntity(entity, query);
    if (entityScore) matches.push({ entity, index, score: entityScore });
  }
  matches.sort(
    (left, right) =>
      left.score.rank - right.score.rank ||
      left.score.fieldPriority - right.score.fieldPriority ||
      left.score.position - right.score.position ||
      left.score.gap - right.score.gap ||
      SEARCH_ENTITY_TYPE_ORDER[left.entity.type] - SEARCH_ENTITY_TYPE_ORDER[right.entity.type] ||
      left.entity.title.localeCompare(right.entity.title, "en", { sensitivity: "base" }) ||
      left.index - right.index,
  );
  return matches.slice(0, 5).map(({ entity }) => entity);
}

export function filterSearchMessages(options: {
  messages: readonly SearchMessageFixture[];
  senders: readonly SearchSenderFixture[];
  channels: readonly SearchChannelFixture[];
  query: string;
  sender: SearchSenderFixture | null;
  channel: SearchChannelFixture | null;
  scopes: readonly SearchScope[];
  timeRange: SearchTimeRange;
  sort: SearchSort;
}) {
  const { messages, senders, channels, query, sender, channel, scopes, timeRange, sort } = options;
  const tokens = normalizeSearchQuery(query).replace(/^[@#]/, "").split(/\s+/).filter(Boolean);
  const scopeSet = new Set(scopes);
  const currentUserId = senders.find((item) => item.isCurrentUser)?.id;
  const referenceTime = Math.max(...messages.map((message) => Date.parse(message.createdAt)), 0);
  return messages
    .filter((message) => {
      const messageSender = senders.find((item) => item.id === message.senderId);
      const messageChannel = channels.find((item) => item.id === message.channelId);
      if (!messageSender || !messageChannel || (sender && sender.id !== message.senderId))
        return false;
      if (channel && channel.id !== message.channelId) return false;
      if (scopeSet.has("mentioned") && currentUserId && !message.mentions.includes(currentUserId))
        return false;
      const exclusiveKind = getExclusiveSenderKind(scopes);
      if (exclusiveKind && messageSender.kind !== exclusiveKind) return false;
      if (timeRange !== "any") {
        const date = new Date(referenceTime);
        const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        const cutoff =
          timeRange === "today" ? today : referenceTime - Number.parseInt(timeRange) * 86400000;
        if (Date.parse(message.createdAt) < cutoff) return false;
      }
      const haystack = normalizeSearchQuery(
        `${message.content} ${messageSender.label} ${messageChannel.name}`,
      );
      return tokens.every((token) => haystack.includes(token));
    })
    .sort((left, right) => {
      if (sort === "recent" || tokens.length === 0)
        return Date.parse(right.createdAt) - Date.parse(left.createdAt);
      const score = (value: string) =>
        tokens.reduce(
          (total, token) => total + (normalizeSearchQuery(value).split(token).length - 1),
          0,
        );
      return (
        score(right.content) - score(left.content) ||
        Date.parse(right.createdAt) - Date.parse(left.createdAt)
      );
    });
}
