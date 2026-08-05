import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SEARCH_CHANNEL_FIXTURES,
  SEARCH_ENTITY_FIXTURES,
  SEARCH_MESSAGE_FIXTURES,
  SEARCH_SENDER_FIXTURES,
  type SearchChannelFixture,
  type SearchEntityFixture,
  type SearchMessageFixture,
  type SearchSenderFixture,
} from "../search.fixtures.ts";

import { BrutalSearchFilters } from "../search-panel/search-panel.filters.tsx";
import {
  BrutalSearchContent,
  BrutalSearchFrame,
  BrutalSearchHeader,
  type BrutalSearchScope,
  type BrutalSearchSort,
  type BrutalSearchTimeRange,
} from "../search-panel/search-panel.parts.tsx";
import { BrutalSearchResults } from "../search-panel/search-panel.results.tsx";

export type BrutalSearchPanelCompositionProps = {
  entities?: readonly SearchEntityFixture[];
  messages?: readonly SearchMessageFixture[];
  senders?: readonly SearchSenderFixture[];
  channels?: readonly SearchChannelFixture[];
  defaultQuery?: string;
  defaultSenderId?: string;
  defaultOpenEmptySenderPopup?: boolean;
  view?: "ready" | "loading" | "error";
  focusRequestKey?: number;
  query?: string;
  selectedKey?: string | null;
  onQueryChange?: (query: string) => void;
  onBack: () => void;
  onOpenEntity?: (entity: SearchEntityFixture) => void;
  onOpenMessage?: (message: SearchMessageFixture) => void;
};

type SelectableResult =
  | { key: string; kind: "entity"; entity: SearchEntityFixture }
  | { key: string; kind: "message"; message: SearchMessageFixture };

const PAGE_SIZE = 4;

function normalize(value: string) {
  return value.trim().toLocaleLowerCase();
}

function queryTokens(query: string) {
  return normalize(query).replace(/^[@#]/, "").split(/\s+/).filter(Boolean);
}

function includesTokens(value: string, tokens: readonly string[]) {
  const haystack = normalize(value);
  return tokens.every((token) => haystack.includes(token));
}

function score(value: string, tokens: readonly string[]) {
  const haystack = normalize(value);
  return tokens.reduce((total, token) => total + (haystack.split(token).length - 1), 0);
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
  const cleanQuery = normalize(query).replace(/^[@#]/, "");
  if (!cleanQuery) return { rank: 0, fieldPriority: 0, position: 0, gap: 0 };
  const normalizedQuery = normalizeSearchText(cleanQuery);
  let best: SearchEntityScore | null = null;
  for (const field of entity.fields) {
    const raw = normalize(field.value);
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
      candidate = {
        rank: 3,
        fieldPriority: field.priority,
        position: compactPosition,
        gap: 0,
      };
    } else if (legacyPosition >= 0) {
      candidate = {
        rank: 7,
        fieldPriority: field.priority,
        position: legacyPosition,
        gap: 0,
      };
    }
    if (!candidate) continue;
    if (
      !best ||
      candidate.rank < best.rank ||
      (candidate.rank === best.rank && candidate.fieldPriority < best.fieldPriority) ||
      (candidate.rank === best.rank &&
        candidate.fieldPriority === best.fieldPriority &&
        (candidate.position < best.position ||
          (candidate.position === best.position && candidate.gap < best.gap)))
    ) {
      best = candidate;
    }
  }
  return best;
}

function rankEntities(entities: readonly SearchEntityFixture[], query: string) {
  const prefix = normalize(query)[0];
  const matches: { entity: SearchEntityFixture; index: number; score: SearchEntityScore }[] = [];
  for (const [index, entity] of entities.entries()) {
    if (prefix === "#" && entity.type !== "channel") continue;
    if (prefix === "@" && entity.type !== "agentDm" && entity.type !== "humanDm") continue;
    const entityScore = scoreEntity(entity, query);
    if (entityScore === null) continue;
    matches.push({ entity, index, score: entityScore });
  }
  matches.sort(
    (left, right) =>
      left.score.rank - right.score.rank ||
      left.score.fieldPriority - right.score.fieldPriority ||
      left.score.position - right.score.position ||
      left.score.gap - right.score.gap ||
      SEARCH_ENTITY_TYPE_ORDER[left.entity.type] - SEARCH_ENTITY_TYPE_ORDER[right.entity.type] ||
      left.entity.title.localeCompare(right.entity.title, "en", {
        sensitivity: "base",
      }) ||
      left.index - right.index,
  );
  return matches.slice(0, 5).map(({ entity }) => entity);
}

function getExclusiveSenderKind(scopes: readonly BrutalSearchScope[]) {
  const hasHumans = scopes.includes("humans");
  const hasAgents = scopes.includes("agents");
  if (hasHumans === hasAgents) return null;
  return hasHumans ? "human" : "agent";
}

export function BrutalSearchPanelComposition(props: BrutalSearchPanelCompositionProps) {
  return <SearchPanel {...props} />;
}

function SearchPanel({
  entities = SEARCH_ENTITY_FIXTURES,
  messages = SEARCH_MESSAGE_FIXTURES,
  senders = SEARCH_SENDER_FIXTURES,
  channels = SEARCH_CHANNEL_FIXTURES,
  defaultQuery = "preview",
  defaultSenderId,
  defaultOpenEmptySenderPopup = false,
  view = "ready",
  focusRequestKey,
  query: controlledQuery,
  selectedKey: controlledSelectedKey,
  onQueryChange,
  onBack,
  onOpenEntity,
  onOpenMessage,
}: BrutalSearchPanelCompositionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Map<string, HTMLButtonElement>>(undefined);
  const composing = useRef(false);
  const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultQuery);
  const [sender, setSender] = useState<SearchSenderFixture | null>(
    () => senders.find((item) => item.id === defaultSenderId) ?? null,
  );
  const [channel, setChannel] = useState<SearchChannelFixture | null>(null);
  const [scopes, setScopes] = useState<BrutalSearchScope[]>([]);
  const [timeRange, setTimeRange] = useState<BrutalSearchTimeRange>("any");
  const [sort, setSort] = useState<BrutalSearchSort>("relevance");
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
  const [selectedKey, setSelectedKey] = useState<string | null>(controlledSelectedKey ?? null);
  const query = controlledQuery ?? uncontrolledQuery;

  function setQuery(nextQuery: string) {
    if (controlledQuery === undefined) setUncontrolledQuery(nextQuery);
    onQueryChange?.(nextQuery);
  }

  useEffect(() => {
    if (focusRequestKey === undefined) return;
    inputRef.current?.focus({ preventScroll: true });
    inputRef.current?.select();
  }, [focusRequestKey]);

  useEffect(() => {
    if (controlledSelectedKey !== undefined) setSelectedKey(controlledSelectedKey);
  }, [controlledSelectedKey]);

  const tokens = useMemo(() => queryTokens(query), [query]);
  const currentUserId = senders.find((item) => item.isCurrentUser)?.id;
  const scopeSet = useMemo(() => new Set(scopes), [scopes]);
  const referenceTime = Math.max(...messages.map((message) => Date.parse(message.createdAt)), 0);
  const entityResults = normalize(query) ? rankEntities(entities, query) : [];
  const messageResults = messages
    .filter((message) => {
      const messageSender = senders.find((item) => item.id === message.senderId);
      const messageChannel = channels.find((item) => item.id === message.channelId);
      if (!messageSender || !messageChannel) return false;
      if (sender && sender.id !== message.senderId) return false;
      if (channel && channel.id !== message.channelId) return false;
      if (scopeSet.has("mentioned") && currentUserId && !message.mentions.includes(currentUserId))
        return false;
      if (scopeSet.has("humans") !== scopeSet.has("agents")) {
        const requiredKind = scopeSet.has("humans") ? "human" : "agent";
        if (messageSender.kind !== requiredKind) return false;
      }
      if (timeRange !== "any") {
        const date = new Date(referenceTime);
        const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        const cutoff =
          timeRange === "today"
            ? today
            : referenceTime - Number.parseInt(timeRange) * 24 * 60 * 60 * 1000;
        if (Date.parse(message.createdAt) < cutoff) return false;
      }
      return (
        tokens.length === 0 ||
        includesTokens(`${message.content} ${messageSender.label} ${messageChannel.name}`, tokens)
      );
    })
    .sort((left, right) => {
      if (sort === "recent" || tokens.length === 0)
        return Date.parse(right.createdAt) - Date.parse(left.createdAt);
      return (
        score(right.content, tokens) - score(left.content, tokens) ||
        Date.parse(right.createdAt) - Date.parse(left.createdAt)
      );
    });

  const visibleMessages = messageResults.slice(0, visibleLimit);
  const hasActiveFilters = Boolean(sender || channel || scopes.length || timeRange !== "any");
  const hasIntent = Boolean(normalize(query) || hasActiveFilters);
  const selectableResults: SelectableResult[] =
    view === "ready"
      ? [
          ...entityResults.map((entity) => ({
            key: entity.key,
            kind: "entity" as const,
            entity,
          })),
          ...visibleMessages.map((message) => ({
            key: `message:${message.id}`,
            kind: "message" as const,
            message,
          })),
        ]
      : [];
  const resolvedSelectedKey = selectableResults.some((item) => item.key === selectedKey)
    ? selectedKey
    : (selectableResults[0]?.key ?? null);

  function setResultRef(key: string, element: HTMLButtonElement | null) {
    const refs = (resultRefs.current ??= new Map());
    if (element) refs.set(key, element);
    else refs.delete(key);
  }

  function activate(result: SelectableResult) {
    setSelectedKey(result.key);
    if (result.kind === "entity") onOpenEntity?.(result.entity);
    else onOpenMessage?.(result.message);
  }

  function moveSelection(offset: number) {
    if (selectableResults.length === 0) return;
    const current = Math.max(
      0,
      selectableResults.findIndex((item) => item.key === resolvedSelectedKey),
    );
    const next = Math.max(0, Math.min(selectableResults.length - 1, current + offset));
    const result = selectableResults[next];
    if (!result) return;
    setSelectedKey(result.key);
    resultRefs.current?.get(result.key)?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.nativeEvent.isComposing || composing.current) return;
    const target = event.target;
    const isSearchNavigationTarget =
      target === inputRef.current ||
      (target instanceof HTMLElement &&
        target.closest(
          "[data-slot='search-entity-result-open'], [data-slot='search-message-result']",
        ));
    if (!isSearchNavigationTarget) return;
    if (event.key === "Escape") {
      if (query) {
        event.preventDefault();
        setQuery("");
        inputRef.current?.focus();
      } else {
        onBack?.();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1);
    } else if (event.key === "Enter" && event.target === inputRef.current) {
      const result = selectableResults.find((item) => item.key === resolvedSelectedKey);
      if (result) {
        event.preventDefault();
        activate(result);
      }
    }
  }

  return (
    <BrutalSearchFrame onKeyDown={handleKeyDown}>
      <BrutalSearchHeader
        inputRef={inputRef}
        query={query}
        onBack={onBack}
        onQueryChange={(value) => {
          setQuery(value);
          setVisibleLimit(PAGE_SIZE);
        }}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={(value) => {
          composing.current = false;
          setQuery(value);
          setVisibleLimit(PAGE_SIZE);
        }}
        onClear={() => {
          setQuery("");
          inputRef.current?.focus();
        }}
      />

      <BrutalSearchContent>
        <BrutalSearchFilters
          senders={senders}
          channels={channels}
          query={query}
          sender={sender}
          channel={channel}
          scopes={scopes}
          timeRange={timeRange}
          sort={sort}
          showEmptySenderPopup={defaultOpenEmptySenderPopup}
          onSenderChange={(nextSender) => {
            setSender(nextSender);
            if (!nextSender) return;
            const exclusiveKind = getExclusiveSenderKind(scopes);
            if (exclusiveKind && exclusiveKind !== nextSender.kind) {
              setScopes((current) =>
                current.filter(
                  (scope) =>
                    scope === "mentioned" ||
                    (scope === "humans" && nextSender.kind === "human") ||
                    (scope === "agents" && nextSender.kind === "agent"),
                ),
              );
            }
          }}
          onChannelChange={setChannel}
          onScopesChange={(nextScopes) => {
            setScopes(nextScopes);
            const exclusiveKind = getExclusiveSenderKind(nextScopes);
            if (sender && exclusiveKind && exclusiveKind !== sender.kind) setSender(null);
          }}
          onTimeRangeChange={setTimeRange}
          onSortChange={setSort}
        />

        <BrutalSearchResults
          entities={entityResults}
          messages={visibleMessages}
          messageCount={messageResults.length}
          senders={senders}
          channels={channels}
          query={query}
          selectedKey={resolvedSelectedKey}
          hasIntent={hasIntent}
          hasActiveFilters={hasActiveFilters}
          view={view}
          setResultRef={setResultRef}
          onOpenEntity={(entity) => activate({ key: entity.key, kind: "entity", entity })}
          onOpenMessage={(message) =>
            activate({ key: `message:${message.id}`, kind: "message", message })
          }
          onLoadMore={() => setVisibleLimit((limit) => limit + PAGE_SIZE)}
        />
      </BrutalSearchContent>
    </BrutalSearchFrame>
  );
}
