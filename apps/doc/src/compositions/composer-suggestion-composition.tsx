import { AtSign, Hash } from "lucide-react";
import { useState } from "react";
import {
  ChatMainPanelFooter,
  ComposerInput,
  ComposerRoot,
  ComposerSuggestionAside,
  ComposerSuggestionBadge,
  ComposerSuggestionContent,
  ComposerSuggestionGroup,
  ComposerSuggestionGroupLabel,
  ComposerSuggestionIcon,
  ComposerSuggestionList,
  ComposerSuggestionMeta,
  ComposerSuggestionOption,
  ComposerSuggestionTitle,
  useComposerSuggestions,
  type ComposerSuggestionTriggerMatch,
} from "raft-ui/wip";

import { ComposerBodyComposition } from "#/compositions/composer-composition.tsx";

type PersonSuggestion = {
  disabled?: boolean;
  handle: string;
  kind: "person";
  name: string;
  role: string;
};

type ChannelSuggestion = {
  archived?: boolean;
  description: string;
  kind: "channel";
  name: string;
};

type Suggestion = PersonSuggestion | ChannelSuggestion;

const PEOPLE: readonly PersonSuggestion[] = [
  { handle: "atlas", kind: "person", name: "Atlas", role: "Design" },
  { handle: "avery", kind: "person", name: "Avery", role: "Engineering" },
  { disabled: true, handle: "morgan", kind: "person", name: "Morgan", role: "Unavailable" },
];

const CHANNELS: readonly ChannelSuggestion[] = [
  { description: "Product design", kind: "channel", name: "proj-uiux" },
  { description: "Engineering updates", kind: "channel", name: "eng-platform" },
  { archived: true, description: "Past launch", kind: "channel", name: "launch-2025" },
];

function detectSuggestion(textBeforeCaret: string): ComposerSuggestionTriggerMatch | null {
  const match = /(?:^|\s)([@#])([^\s@#]*)$/.exec(textBeforeCaret);
  if (!match) return null;
  return {
    marker: match[1],
    query: match[2],
    start: match.index + match[0].lastIndexOf(match[1]),
  };
}

function matchesQuery(suggestion: Suggestion, query: string) {
  const searchable =
    suggestion.kind === "person"
      ? `${suggestion.name} ${suggestion.handle} ${suggestion.role}`
      : `${suggestion.name} ${suggestion.description}`;
  return searchable.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export function ComposerSuggestionComposition() {
  const [value, setValue] = useState("@");
  const autocomplete = useComposerSuggestions<Suggestion>({
    value,
    onValueChange: setValue,
    detectTrigger: detectSuggestion,
    getItems: (match) =>
      (match.marker === "@" ? PEOPLE : CHANNELS).filter((suggestion) =>
        matchesQuery(suggestion, match.query),
      ),
    getItemText: (suggestion) =>
      suggestion.kind === "person" ? `@${suggestion.handle} ` : `#${suggestion.name} `,
    isItemDisabled: (suggestion) =>
      suggestion.kind === "person" ? Boolean(suggestion.disabled) : Boolean(suggestion.archived),
  });
  const indexedItems = autocomplete.items.map((suggestion, index) => ({ index, suggestion }));
  const primaryItems = indexedItems.filter(({ suggestion }) =>
    suggestion.kind === "person" ? !suggestion.disabled : !suggestion.archived,
  );
  const secondaryItems = indexedItems.filter(({ suggestion }) =>
    suggestion.kind === "person" ? Boolean(suggestion.disabled) : Boolean(suggestion.archived),
  );
  const showsPeople = autocomplete.items[0]?.kind === "person";
  const primaryGroupLabel = showsPeople ? "Available people" : "Active channels";
  const secondaryGroupLabel = showsPeople ? "Unavailable" : "Archived channels";

  const renderSuggestion = ({ suggestion, index }: (typeof indexedItems)[number]) => (
    <ComposerSuggestionOption
      key={suggestion.kind === "person" ? suggestion.handle : suggestion.name}
      {...autocomplete.getOptionProps(suggestion, index)}
    >
      <ComposerSuggestionIcon variant="framed">
        {suggestion.kind === "person" ? <AtSign /> : <Hash />}
      </ComposerSuggestionIcon>
      <ComposerSuggestionContent>
        <ComposerSuggestionTitle>{suggestion.name}</ComposerSuggestionTitle>
        <ComposerSuggestionMeta>
          {suggestion.kind === "person" ? suggestion.role : suggestion.description}
        </ComposerSuggestionMeta>
        <ComposerSuggestionAside>
          {suggestion.kind === "person" ? (
            suggestion.disabled ? (
              <ComposerSuggestionBadge>unavailable</ComposerSuggestionBadge>
            ) : (
              <ComposerSuggestionBadge aria-label="Available" variant="indicator" />
            )
          ) : suggestion.archived ? (
            <ComposerSuggestionBadge>archived</ComposerSuggestionBadge>
          ) : (
            <ComposerSuggestionMeta variant="code">#{suggestion.name}</ComposerSuggestionMeta>
          )}
        </ComposerSuggestionAside>
      </ComposerSuggestionContent>
    </ComposerSuggestionOption>
  );

  return (
    <div className="flex h-full flex-col justify-end bg-layer-panel">
      <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
        <ComposerRoot positioned>
          {autocomplete.open ? (
            <ComposerSuggestionList
              {...autocomplete.getListProps({ "aria-label": "Composer suggestions" })}
            >
              <ComposerSuggestionGroup role="group" aria-label={primaryGroupLabel}>
                <ComposerSuggestionGroupLabel aria-hidden>
                  {primaryGroupLabel}
                </ComposerSuggestionGroupLabel>
                {primaryItems.map(renderSuggestion)}
              </ComposerSuggestionGroup>
              {secondaryItems.length > 0 ? (
                <ComposerSuggestionGroup separated role="group" aria-label={secondaryGroupLabel}>
                  <ComposerSuggestionGroupLabel aria-hidden>
                    {secondaryGroupLabel}
                  </ComposerSuggestionGroupLabel>
                  {secondaryItems.map(renderSuggestion)}
                </ComposerSuggestionGroup>
              ) : null}
            </ComposerSuggestionList>
          ) : null}
          <ComposerBodyComposition
            input={
              <ComposerInput
                {...autocomplete.getInputProps({
                  "aria-label": "Message #proj-uiux",
                  placeholder: "Type @ for people or # for channels",
                })}
              />
            }
          />
        </ComposerRoot>
      </ChatMainPanelFooter>
    </div>
  );
}
