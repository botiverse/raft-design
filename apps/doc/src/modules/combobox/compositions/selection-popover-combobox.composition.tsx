import type { RefObject } from "react";
import { useRef, useState } from "react";
import { ChevronDown, Hash } from "lucide-react";
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxHeader,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxTriggerIndicator,
} from "raft-ui";

type LabelOption = {
  id: string;
  label: string;
};

const labels: readonly LabelOption[] = [
  { id: "design", label: "Design" },
  { id: "bug", label: "Bug" },
  { id: "review", label: "Review" },
];

export function SelectionPopoverComboboxComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<LabelOption | null>(labels[0]);

  return (
    <div
      ref={portalRef}
      className="relative flex h-full min-h-56 w-full items-start justify-center pt-8"
    >
      <Combobox<LabelOption>
        open
        autoHighlight
        inputValue={query}
        items={labels}
        isItemEqualToValue={(item, value) => item.id === value.id}
        itemToStringLabel={(label) => label.label}
        value={selectedLabel}
        onInputValueChange={(nextQuery, eventDetails) => {
          if (eventDetails.reason !== "item-press") {
            setQuery(nextQuery);
          }
        }}
        onValueChange={setSelectedLabel}
      >
        <ComboboxTrigger className="h-8 w-40 py-0">
          <Hash aria-hidden />
          <span className="min-w-0 truncate text-left">{selectedLabel?.label ?? "Labels"}</span>
          <ComboboxTriggerIndicator>
            <ChevronDown aria-hidden />
          </ComboboxTriggerIndicator>
        </ComboboxTrigger>
        <ComboboxContent
          initialFocus={false}
          finalFocus={false}
          collisionAvoidance={{ side: "none", align: "none", fallbackAxisSide: "none" }}
          positionMethod="absolute"
          side="bottom"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[18rem]"
        >
          <ComboboxHeader>
            <ComboboxLabel>Labels</ComboboxLabel>
            <ComboboxClear>Clear</ComboboxClear>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search labels"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          <ComboboxList>
            {(label: LabelOption) => (
              <ComboboxItem key={label.id} value={label}>
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <Hash className="text-foreground-muted [[data-theme=brutal]_&]:text-black/50" />
                  </span>
                  <span className="truncate leading-6">{label.label}</span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
