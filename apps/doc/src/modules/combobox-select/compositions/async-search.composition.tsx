import { useState } from "react";
import { ComboboxSelect } from "raft-ui/wip";
import type { ComboboxSelectOption, ComboboxSelectValue } from "raft-ui/wip";
import { mockQueryOptions, useMockQuery } from "#/lib/mock-query.ts";

const models = [
  { value: "reasoning", label: "Raft Reasoning" },
  { value: "fast", label: "Raft Fast" },
  { value: "vision", label: "Raft Vision" },
  { value: "code", label: "Raft Code" },
] as const satisfies readonly ComboboxSelectOption[];

const modelSearchQuery = mockQueryOptions({
  queryKey: ["combobox-select", "model-search"],
  delayMs: 450,
  shouldFail: false,
  queryFn: (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return models.slice(0, 3);
    }

    return models.filter((model) => model.label.toLowerCase().includes(normalizedQuery));
  },
});

export function AsyncSearchComposition() {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState<ComboboxSelectValue | null>(null);
  const { data: options = [], isLoading } = useMockQuery({
    query: modelSearchQuery,
    variables: query,
    clearOnFetch: true,
  });

  function handleSearch(nextQuery: string) {
    setQuery(nextQuery);
  }

  function handleValueChange(nextValue: ComboboxSelectValue | null) {
    setValue(nextValue);
  }

  return (
    <ComboboxSelect
      options={options}
      value={value}
      remote
      loading={isLoading}
      onSearch={handleSearch}
      onValueChange={handleValueChange}
      placeholder="Search models"
      aria-label="Search models"
    />
  );
}
