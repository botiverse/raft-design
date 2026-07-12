import type { RefObject } from "react";
import { useRef, useState } from "react";
import { AtSign, ChevronDown } from "lucide-react";
import {
  Avatar,
  Combobox,
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

type MentionSuggestion = {
  id: string;
  label: string;
  kind: "person" | "note";
};

const suggestions: readonly MentionSuggestion[] = [
  { id: "atlas", label: "Atlas", kind: "person" },
  { id: "avery", label: "Avery", kind: "person" },
  { id: "design-notes", label: "Design notes", kind: "note" },
];

export function ComposerMentionComboboxComposition() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("at");
  const [selectedSuggestion, setSelectedSuggestion] = useState<MentionSuggestion | null>(
    suggestions[0],
  );

  return (
    <div
      ref={portalRef}
      className="relative flex h-full min-h-56 w-full items-start justify-center pt-8"
    >
      <Combobox<MentionSuggestion>
        open
        autoHighlight
        inputValue={query}
        items={suggestions}
        filter={null}
        isItemEqualToValue={(item, value) => item.id === value.id}
        itemToStringLabel={(suggestion) => suggestion.label}
        value={selectedSuggestion}
        onInputValueChange={(nextQuery, eventDetails) => {
          if (eventDetails.reason !== "item-press") {
            setQuery(nextQuery);
          }
        }}
        onValueChange={setSelectedSuggestion}
      >
        <ComboboxTrigger className="h-8 w-40 py-0">
          <AtSign aria-hidden />
          <span className="min-w-0 truncate text-left">
            {selectedSuggestion?.label ?? "Mention"}
          </span>
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
            <ComboboxLabel>Mentions</ComboboxLabel>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search mentions"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          <ComboboxList>
            {(suggestion: MentionSuggestion) => (
              <ComboboxItem key={suggestion.id} value={suggestion}>
                <span className="flex min-w-0 items-center gap-1.5 [[data-theme=brutal]_&]:gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    {suggestion.kind === "person" ? (
                      <Avatar size="xs" type="human" />
                    ) : (
                      <span aria-hidden className="size-5" />
                    )}
                  </span>
                  <span className="truncate leading-6 [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:font-bold">
                    {suggestion.label}
                  </span>
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
