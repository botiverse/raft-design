import type { ReactNode } from "react";
import { useState } from "react";

import {
  SEARCH_CHANNEL_FIXTURES,
  SEARCH_SENDER_FIXTURES,
  type SearchChannelFixture,
  type SearchSenderFixture,
} from "../search.fixtures.ts";
import { BrutalSearchFilters } from "./search-panel.filters.tsx";
import {
  BrutalSearchFrame,
  BrutalSearchHeader,
  type BrutalSearchScope,
  type BrutalSearchSort,
  type BrutalSearchTimeRange,
} from "./search-panel.parts.tsx";

type ExampleFiltersProps = {
  query: string;
  initialSender?: SearchSenderFixture | null;
  openEmptySenderPopup?: boolean;
};

function ExampleFilters({
  query,
  initialSender = null,
  openEmptySenderPopup = false,
}: ExampleFiltersProps) {
  const [sender, setSender] = useState<SearchSenderFixture | null>(initialSender);
  const [channel, setChannel] = useState<SearchChannelFixture | null>(null);
  const [scopes, setScopes] = useState<BrutalSearchScope[]>([]);
  const [timeRange, setTimeRange] = useState<BrutalSearchTimeRange>("any");
  const [sort, setSort] = useState<BrutalSearchSort>("relevance");

  return (
    <BrutalSearchFilters
      senders={SEARCH_SENDER_FIXTURES}
      channels={SEARCH_CHANNEL_FIXTURES}
      query={query}
      sender={sender}
      channel={channel}
      scopes={scopes}
      timeRange={timeRange}
      sort={sort}
      showEmptySenderPopup={openEmptySenderPopup}
      onSenderChange={setSender}
      onChannelChange={setChannel}
      onScopesChange={setScopes}
      onTimeRangeChange={setTimeRange}
      onSortChange={setSort}
    />
  );
}

function SearchStateFrame({
  defaultQuery,
  filters,
  children,
}: {
  defaultQuery: string;
  filters: (query: string) => ReactNode;
  children: ReactNode;
}) {
  const [query, setQuery] = useState(defaultQuery);

  return (
    <BrutalSearchFrame>
      <BrutalSearchHeader
        query={query}
        onBack={() => window.history.back()}
        onQueryChange={setQuery}
        onCompositionStart={() => {}}
        onCompositionEnd={setQuery}
        onClear={() => setQuery("")}
      />
      {filters(query)}
      {children}
    </BrutalSearchFrame>
  );
}

export function BrutalSearchStateExample({
  defaultQuery,
  children,
}: {
  defaultQuery: string;
  children: ReactNode;
}) {
  return (
    <SearchStateFrame
      defaultQuery={defaultQuery}
      filters={(query) => <ExampleFilters query={query} />}
    >
      {children}
    </SearchStateFrame>
  );
}

export function BrutalSearchFilteredStateExample({ children }: { children: ReactNode }) {
  const selectedSender = SEARCH_SENDER_FIXTURES.find((sender) => sender.id === "agent-atlas");

  return (
    <SearchStateFrame
      defaultQuery=""
      filters={(query) => <ExampleFilters query={query} initialSender={selectedSender} />}
    >
      {children}
    </SearchStateFrame>
  );
}

export function BrutalSearchPopupStateExample({ children }: { children: ReactNode }) {
  return (
    <SearchStateFrame
      defaultQuery=""
      filters={(query) => <ExampleFilters query={query} openEmptySenderPopup />}
    >
      {children}
    </SearchStateFrame>
  );
}
