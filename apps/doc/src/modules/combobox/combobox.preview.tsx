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
import type { RefObject } from "react";
import { useRef, useState } from "react";

import { models, type Model } from "./combobox.constants.ts";

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
  const portalRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState<Model | null>(models[0]);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Combobox<Model>
        items={models}
        value={selectedModel}
        itemToStringLabel={(model) => model.label}
        onValueChange={setSelectedModel}
        autoHighlight
      >
        <Field className="w-56 gap-1.5">
          <FieldLabel>Model</FieldLabel>
          <ComboboxControl>
            <Sparkles
              aria-hidden
              className="text-foreground-muted [[data-theme=brutal]_&]:text-black/60"
            />
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
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[var(--anchor-width)]"
        >
          <ComboboxModelList />
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
