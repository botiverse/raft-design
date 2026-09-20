import { useId, useState } from "react";
import { Field, FieldDescription, FieldLabel } from "raft-ui";
import { ComboboxSelect } from "raft-ui/wip";
import type { ComboboxSelectValue } from "raft-ui/wip";

const modelOptions = [
  {
    type: "group" as const,
    key: "moonshot",
    label: "Moonshot AI",
    children: [{ value: "kimi-k2.6", label: "Kimi K2.6", provider: "Moonshot AI" }],
  },
  {
    type: "group" as const,
    key: "openai",
    label: "OpenAI",
    children: [
      { value: "gpt-mini-latest", label: "GPT Mini Latest", provider: "OpenAI" },
      {
        value: "gpt-audio-mini",
        label: "GPT Audio Mini (unavailable)",
        provider: "OpenAI",
        disabled: true,
      },
    ],
  },
  {
    type: "group" as const,
    key: "google",
    label: "Google",
    children: [
      { value: "gemma-4-31b", label: "Gemma 4 31B (free)", provider: "Google" },
      { value: "gemma-4-26b", label: "Gemma 4 26B A4B (free)", provider: "Google" },
    ],
  },
] as const;

function filterModel(query: string, option: { provider: string; label: string }) {
  const searchText = `${option.provider} ${option.label}`.toLowerCase();
  return searchText.includes(query.trim().toLowerCase());
}

export function ModelSelectComposition() {
  const id = useId();
  const [model, setModel] = useState<ComboboxSelectValue | null>("kimi-k2.6");

  return (
    <Field>
      <FieldLabel htmlFor={id}>Model</FieldLabel>
      <ComboboxSelect
        id={id}
        options={modelOptions}
        value={model}
        onValueChange={setModel}
        filterable
        filter={filterModel}
        clearable
        placeholder="Choose a model"
        emptyContent="No matching models"
      />
      <FieldDescription>Search by model or provider.</FieldDescription>
    </Field>
  );
}
