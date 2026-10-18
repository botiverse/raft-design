import { useState } from "react";
import { ComboboxSelect } from "@botiverse/raft-ui/wip";
import type { ComboboxSelectOption, ComboboxSelectValue } from "@botiverse/raft-ui/wip";
import { mockQueryOptions, useMockQuery } from "#/lib/mock-query.ts";

const repositories = [
  { value: "raft-ui", label: "raft-ui" },
  { value: "raft", label: "raft" },
  { value: "source", label: "source" },
] as const satisfies readonly ComboboxSelectOption[];

const repositoryQuery = mockQueryOptions({
  queryKey: ["combobox-select", "repositories"],
  delayMs: 700,
  shouldFail: false,
  queryFn: () => repositories,
});

function repositoryForValue(value: ComboboxSelectValue) {
  return (
    repositories.find((repository) => repository.value === value) ?? {
      value: String(value),
      label: String(value),
    }
  );
}

export function AsyncOptionsComposition() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<ComboboxSelectValue | null>(null);
  const { data: options = [], isLoading } = useMockQuery({
    query: repositoryQuery,
    enabled: open,
    clearOnFetch: true,
  });

  return (
    <ComboboxSelect
      options={options}
      value={value}
      open={open}
      remote
      loading={isLoading}
      onOpenChange={setOpen}
      onValueChange={setValue}
      fallbackOption={repositoryForValue}
      placeholder="Choose repository"
      aria-label="Choose repository"
    />
  );
}
