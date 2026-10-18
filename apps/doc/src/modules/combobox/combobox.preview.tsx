import { ChevronDown, Sparkles } from "lucide-react";
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTriggerIndicator,
  Field,
  FieldLabel,
} from "raft-ui";
import { useState } from "react";

import { models } from "./combobox.constants.ts";
import type { Model } from "./combobox.constants.ts";

function getModelLabel(model: Model) {
  return model.label;
}

function ComboboxModelList() {
  return (
    <>
      <ComboboxList>
        {(model: Model) => (
          <ComboboxItem key={model.id} value={model}>
            <span className="truncate leading-6">{model.label}</span>
            <ComboboxItemIndicator />
          </ComboboxItem>
        )}
      </ComboboxList>
      <ComboboxEmpty>No models found</ComboboxEmpty>
    </>
  );
}

export function PreviewCombobox() {
  const [selectedModel, setSelectedModel] = useState<Model | null>(models[0]);

  return (
    <div className="relative flex justify-center">
      <Combobox<Model>
        items={models}
        value={selectedModel}
        itemToStringLabel={getModelLabel}
        onValueChange={setSelectedModel}
        autoHighlight
      >
        <Field className="w-56 gap-1.5">
          <FieldLabel>Model</FieldLabel>
          <ComboboxControl>
            <Sparkles aria-hidden className="text-foreground-muted" />
            <ComboboxInput
              aria-label="Search models"
              placeholder="Search models..."
              suppressPasswordManager
            />
            <ComboboxClear aria-label="Clear model" />
            <ComboboxTriggerIndicator>
              <ChevronDown aria-hidden />
            </ComboboxTriggerIndicator>
          </ComboboxControl>
        </Field>
        <ComboboxContent initialFocus={false} finalFocus={false} className="w-(--anchor-width)">
          <ComboboxModelList />
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
