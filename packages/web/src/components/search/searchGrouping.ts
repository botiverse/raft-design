export type SearchTimeRange = "any" | "today" | "7d" | "30d";
export type SearchSort = "relevance" | "recent";

export interface SearchMessageResultLike {
  id: string;
  threadId: string | null;
  parentMessageId: string | null;
  parentMessageContent: string | null;
  createdAt: string;
}

export interface ThreadSearchResultGroup<T extends SearchMessageResultLike> {
  kind: "thread";
  key: string;
  threadId: string;
  parentMessageId: string;
  title: string;
  latestCreatedAt: string;
  hitCount: number;
  results: T[];
}

export interface MessageSearchResultGroup<T extends SearchMessageResultLike> {
  kind: "message";
  key: string;
  result: T;
}

export type SearchResultGroup<T extends SearchMessageResultLike> =
  | ThreadSearchResultGroup<T>
  | MessageSearchResultGroup<T>;

function getFiniteTimeMs(value: string): number | null {
  const timeMs = new Date(value).getTime();
  return Number.isFinite(timeMs) ? timeMs : null;
}

function truncateThreadTitle(value: string): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return "Thread discussion";
  return compact.length > 80 ? `${compact.slice(0, 77)}...` : compact;
}

export function buildTimeRangeParams(range: SearchTimeRange, now = new Date()): { after?: string; before?: string } {
  if (range === "any") return {};

  const before = new Date(now);
  const after = new Date(now);

  if (range === "today") {
    after.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    after.setDate(after.getDate() - 7);
  } else if (range === "30d") {
    after.setDate(after.getDate() - 30);
  }

  return {
    after: after.toISOString(),
    before: before.toISOString(),
  };
}

export function normalizeSearchTimeRange(value: string | null): SearchTimeRange {
  return value === "today" || value === "7d" || value === "30d" ? value : "any";
}

export function normalizeSearchSort(value: string | null): SearchSort {
  return value === "recent" ? "recent" : "relevance";
}

export function hasMeaningfulMessageSearchFilter(params: {
  senderId?: string | null;
  channelId?: string | null;
  timeRange: SearchTimeRange;
}): boolean {
  return Boolean(params.senderId || params.channelId || params.timeRange !== "any");
}

export function getEffectiveMessageSearchSort(query: string, sort: SearchSort): SearchSort {
  return query.trim() ? sort : "recent";
}

export function formatSearchRelativeTime(value: string, now = Date.now()): string {
  const timeMs = getFiniteTimeMs(value);
  if (timeMs == null) return "unknown time";

  const diffMs = timeMs - now;
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < hour) {
    return rtf.format(Math.round(diffMs / minute), "minute");
  }
  if (absMs < day) {
    return rtf.format(Math.round(diffMs / hour), "hour");
  }
  return rtf.format(Math.round(diffMs / day), "day");
}

export function groupMessageSearchResults<T extends SearchMessageResultLike>(results: T[]): SearchResultGroup<T>[] {
  const groups: SearchResultGroup<T>[] = [];
  const threadGroups = new Map<string, ThreadSearchResultGroup<T>>();

  for (const result of results) {
    if (!result.threadId || !result.parentMessageId) {
      groups.push({
        kind: "message",
        key: `message:${result.id}`,
        result,
      });
      continue;
    }

    const key = `thread:${result.threadId}`;
    const existing = threadGroups.get(key);
    if (existing) {
      existing.results.push(result);
      existing.hitCount += 1;
      const nextTimeMs = getFiniteTimeMs(result.createdAt);
      const currentTimeMs = getFiniteTimeMs(existing.latestCreatedAt);
      if (nextTimeMs != null && (currentTimeMs == null || nextTimeMs > currentTimeMs)) {
        existing.latestCreatedAt = result.createdAt;
      }
      continue;
    }

    const group: ThreadSearchResultGroup<T> = {
      kind: "thread",
      key,
      threadId: result.threadId,
      parentMessageId: result.parentMessageId,
      title: truncateThreadTitle(result.parentMessageContent ?? ""),
      latestCreatedAt: result.createdAt,
      hitCount: 1,
      results: [result],
    };
    threadGroups.set(key, group);
    groups.push(group);
  }

  return groups;
}
