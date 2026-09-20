import { useEffect, useMemo, useState } from "react";
import { ComboboxSelect } from "raft-ui/wip";
import type { ComboboxSelectGroup, ComboboxSelectOption, ComboboxSelectValue } from "raft-ui/wip";

const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
] as const satisfies readonly ComboboxSelectOption[];

const modelsByProvider: readonly ComboboxSelectGroup[] = [
  {
    type: "group",
    key: "raft",
    label: "Raft",
    children: [
      { value: "raft-fast", label: "Raft Fast" },
      { value: "raft-reasoning", label: "Raft Reasoning" },
    ],
  },
  {
    type: "group",
    key: "openai",
    label: "OpenAI",
    children: [
      { value: "gpt-5.6", label: "GPT-5.6" },
      { value: "gpt-5.5", label: "GPT-5.5" },
    ],
  },
  {
    type: "group",
    key: "anthropic",
    label: "Anthropic",
    children: [
      { value: "claude-sonnet", label: "Claude Sonnet" },
      { value: "claude-haiku", label: "Claude Haiku" },
    ],
  },
];

const locations = [
  { value: "shanghai", label: "Shanghai" },
  { value: "london", label: "London" },
  { value: "new-york", label: "New York" },
  { value: "berlin", label: "Berlin" },
] as const satisfies readonly ComboboxSelectOption[];

const remoteDirectory = [
  { value: "design", label: "Design systems" },
  { value: "docs", label: "Documentation" },
  { value: "frontend", label: "Frontend platform" },
  { value: "research", label: "User research" },
] as const satisfies readonly ComboboxSelectOption[];

function RemoteSearchExample() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<readonly ComboboxSelectOption[]>(remoteDirectory);
  const [value, setValue] = useState<ComboboxSelectValue | null>(null);

  useEffect(() => {
    if (!query) {
      setOptions(remoteDirectory);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = window.setTimeout(() => {
      const normalized = query.toLowerCase();
      setOptions(remoteDirectory.filter((item) => item.label.toLowerCase().includes(normalized)));
      setLoading(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <ComboboxSelect
      options={options}
      value={value}
      remote
      loading={loading}
      onSearch={setQuery}
      onValueChange={setValue}
      placeholder="Search teams"
      aria-label="Search teams"
    />
  );
}

export function ComboboxSelectComposition() {
  const [model, setModel] = useState<ComboboxSelectValue | null>("raft-fast");
  const [locationsValue, setLocationsValue] = useState<ComboboxSelectValue[]>([
    "shanghai",
    "london",
  ]);
  const [teamValue, setTeamValue] = useState<ComboboxSelectValue | null>(null);
  const [created, setCreated] = useState<ComboboxSelectOption[]>([]);
  const allCreatableOptions = useMemo(() => [...frameworks, ...created], [created]);
  const handleCreateTeam = (label: string) => {
    const option = { value: label.toLowerCase().replaceAll(" ", "-"), label };
    setCreated((previous) => [...previous, option]);
    return option;
  };

  return (
    <div className="grid w-full max-w-2xl gap-8 sm:grid-cols-2">
      <div className="grid gap-2">
        <span className="text-xs font-medium text-foreground-muted">Grouped models + filter</span>
        <ComboboxSelect
          options={modelsByProvider}
          value={model}
          onValueChange={setModel}
          clearable
          placeholder="Choose a model"
          aria-label="Choose a model"
        />
      </div>
      <div className="grid gap-2">
        <span className="text-xs font-medium text-foreground-muted">Multiple + maxTagCount</span>
        <ComboboxSelect
          options={locations}
          multiple
          value={locationsValue}
          onValueChange={setLocationsValue}
          maxTagCount={3}
          clearable
          placeholder="Choose locations"
          aria-label="Choose locations"
        />
      </div>
      <div className="grid gap-2">
        <span className="text-xs font-medium text-foreground-muted">Remote search</span>
        <RemoteSearchExample />
      </div>
      <div className="grid gap-2">
        <span className="text-xs font-medium text-foreground-muted">Creatable</span>
        <ComboboxSelect
          options={allCreatableOptions}
          value={teamValue}
          create
          onCreate={handleCreateTeam}
          onValueChange={setTeamValue}
          placeholder="Create a team"
          aria-label="Create a team"
        />
      </div>
    </div>
  );
}
