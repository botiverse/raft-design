import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConversationPanelContent, SearchShellRoot } from "@botiverse/raft-ui";
import {
  SEARCH_CHANNEL_FIXTURES,
  SEARCH_ENTITY_FIXTURES,
  SEARCH_MESSAGE_FIXTURES,
  SEARCH_SENDER_FIXTURES,
} from "../search.fixtures.ts";
import type {
  SearchChannelFixture,
  SearchEntityFixture,
  SearchMessageFixture,
  SearchSenderFixture,
} from "../search.fixtures.ts";

import { SearchFilters } from "../search-panel/search-panel.filters.tsx";
import { SearchHeader } from "../search-panel/search-panel.parts.tsx";
import type {
  SearchScope,
  SearchSort,
  SearchTimeRange,
} from "../search-panel/search-panel.parts.tsx";
import { SearchResults } from "../search-panel/search-panel.results.tsx";
import {
  filterSearchMessages,
  getExclusiveSenderKind,
  normalizeSearchQuery,
  rankSearchEntities,
  SEARCH_PAGE_SIZE,
} from "../search-panel.logic.ts";

export type SearchPanelCompositionProps = {
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

export function SearchPanelComposition(props: SearchPanelCompositionProps) {
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
}: SearchPanelCompositionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Map<string, HTMLButtonElement>>(undefined);
  const composing = useRef(false);
  const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultQuery);
  const [sender, setSender] = useState<SearchSenderFixture | null>(
    () => senders.find((item) => item.id === defaultSenderId) ?? null,
  );
  const [channel, setChannel] = useState<SearchChannelFixture | null>(null);
  const [scopes, setScopes] = useState<SearchScope[]>([]);
  const [timeRange, setTimeRange] = useState<SearchTimeRange>("any");
  const [sort, setSort] = useState<SearchSort>("relevance");
  const [visibleLimit, setVisibleLimit] = useState(SEARCH_PAGE_SIZE);
  const [selectedKey, setSelectedKey] = useState<string | null>(controlledSelectedKey ?? null);
  const [prevControlledSelectedKey, setPrevControlledSelectedKey] = useState(controlledSelectedKey);
  const query = controlledQuery ?? uncontrolledQuery;

  if (controlledSelectedKey !== prevControlledSelectedKey) {
    setPrevControlledSelectedKey(controlledSelectedKey);
    if (controlledSelectedKey !== undefined) setSelectedKey(controlledSelectedKey);
  }

  const setQuery = useCallback(
    (nextQuery: string) => {
      if (controlledQuery === undefined) setUncontrolledQuery(nextQuery);
      onQueryChange?.(nextQuery);
    },
    [controlledQuery, onQueryChange],
  );

  useEffect(() => {
    if (focusRequestKey === undefined) return;
    inputRef.current?.focus({ preventScroll: true });
    inputRef.current?.select();
  }, [focusRequestKey]);

  const entityResults = useMemo(
    () => (normalizeSearchQuery(query) ? rankSearchEntities(entities, query) : []),
    [entities, query],
  );
  const messageResults = useMemo(
    () =>
      filterSearchMessages({
        messages,
        senders,
        channels,
        query,
        sender,
        channel,
        scopes,
        timeRange,
        sort,
      }),
    [messages, senders, channels, query, sender, channel, scopes, timeRange, sort],
  );

  const visibleMessages = useMemo(
    () => messageResults.slice(0, visibleLimit),
    [messageResults, visibleLimit],
  );
  const hasActiveFilters = Boolean(sender || channel || scopes.length || timeRange !== "any");
  const hasIntent = Boolean(normalizeSearchQuery(query) || hasActiveFilters);
  const selectableResults = useMemo<SelectableResult[]>(
    () =>
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
        : [],
    [entityResults, view, visibleMessages],
  );
  const resolvedSelectedKey = selectableResults.some((item) => item.key === selectedKey)
    ? selectedKey
    : null;
  const keyboardSelectedKey = resolvedSelectedKey ?? selectableResults[0]?.key ?? null;

  const setResultRef = useCallback((key: string, element: HTMLButtonElement | null) => {
    const refs = (resultRefs.current ??= new Map());
    if (element) refs.set(key, element);
    else refs.delete(key);
  }, []);

  const activate = useCallback(
    (result: SelectableResult) => {
      setSelectedKey(result.key);
      if (result.kind === "entity") onOpenEntity?.(result.entity);
      else onOpenMessage?.(result.message);
    },
    [onOpenEntity, onOpenMessage],
  );

  const moveSelection = useCallback(
    (offset: number) => {
      if (selectableResults.length === 0) return;
      const currentIndex = selectableResults.findIndex((item) => item.key === resolvedSelectedKey);
      const current = currentIndex >= 0 ? currentIndex : offset > 0 ? -1 : selectableResults.length;
      const next = Math.max(0, Math.min(selectableResults.length - 1, current + offset));
      const result = selectableResults[next];
      if (!result) return;
      setSelectedKey(result.key);
      resultRefs.current?.get(result.key)?.focus();
    },
    [resolvedSelectedKey, selectableResults],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || event.nativeEvent.isComposing || composing.current) return;
      const target = event.target;
      const isSearchNavigationTarget =
        target === inputRef.current ||
        (target instanceof HTMLElement &&
          target.closest(
            "[data-slot='search-entity-result'], [data-slot='search-message-result']",
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
        const result = selectableResults.find((item) => item.key === keyboardSelectedKey);
        if (result) {
          event.preventDefault();
          activate(result);
        }
      }
    },
    [activate, keyboardSelectedKey, moveSelection, onBack, query, selectableResults, setQuery],
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setVisibleLimit(SEARCH_PAGE_SIZE);
    },
    [setQuery],
  );

  const handleCompositionStart = useCallback(() => {
    composing.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (value: string) => {
      composing.current = false;
      setQuery(value);
      setVisibleLimit(SEARCH_PAGE_SIZE);
    },
    [setQuery],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    inputRef.current?.focus();
  }, [setQuery]);

  const handleSenderChange = useCallback(
    (nextSender: SearchSenderFixture | null) => {
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
    },
    [scopes],
  );

  const handleScopesChange = useCallback(
    (nextScopes: SearchScope[]) => {
      setScopes(nextScopes);
      const exclusiveKind = getExclusiveSenderKind(nextScopes);
      if (sender && exclusiveKind && exclusiveKind !== sender.kind) setSender(null);
    },
    [sender],
  );

  const handleOpenEntity = useCallback(
    (entity: SearchEntityFixture) => activate({ key: entity.key, kind: "entity", entity }),
    [activate],
  );

  const handleOpenMessage = useCallback(
    (message: SearchMessageFixture) =>
      activate({ key: `message:${message.id}`, kind: "message", message }),
    [activate],
  );

  const handleLoadMore = useCallback(
    () => setVisibleLimit((limit) => limit + SEARCH_PAGE_SIZE),
    [],
  );

  return (
    <SearchShellRoot onKeyDown={handleKeyDown}>
      <SearchHeader
        inputRef={inputRef}
        query={query}
        onBack={onBack}
        onQueryChange={handleQueryChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onClear={handleClear}
      />

      <ConversationPanelContent render={<section />}>
        <SearchFilters
          senders={senders}
          channels={channels}
          query={query}
          sender={sender}
          channel={channel}
          scopes={scopes}
          timeRange={timeRange}
          sort={sort}
          showEmptySenderPopup={defaultOpenEmptySenderPopup}
          onSenderChange={handleSenderChange}
          onChannelChange={setChannel}
          onScopesChange={handleScopesChange}
          onTimeRangeChange={setTimeRange}
          onSortChange={setSort}
        />

        <SearchResults
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
          onOpenEntity={handleOpenEntity}
          onOpenMessage={handleOpenMessage}
          onLoadMore={handleLoadMore}
        />
      </ConversationPanelContent>
    </SearchShellRoot>
  );
}
