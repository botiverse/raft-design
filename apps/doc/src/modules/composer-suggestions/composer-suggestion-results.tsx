import { AtSign, Hash } from "lucide-react";
import {
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
} from "raft-ui/wip";

import { isPersonSuggestion } from "./composer-suggestions.data.ts";
import type {
  ChannelSuggestion as ChannelSuggestionData,
  PersonSuggestion as PersonSuggestionData,
  Suggestion,
} from "./composer-suggestions.data.ts";

type ComposerSuggestions = ReturnType<typeof useComposerSuggestions<Suggestion>>;

type ComposerSuggestionResultsProps = Pick<
  ComposerSuggestions,
  "getListProps" | "getOptionProps" | "items"
>;

export function ComposerSuggestionResults({
  items,
  getListProps,
  getOptionProps,
}: ComposerSuggestionResultsProps) {
  const indexedItems = items.map((suggestion, index) => ({ index, suggestion }));
  const primaryItems = indexedItems.filter(({ suggestion }) =>
    isPersonSuggestion(suggestion) ? !suggestion.disabled : !suggestion.archived,
  );
  const secondaryItems = indexedItems.filter(({ suggestion }) =>
    isPersonSuggestion(suggestion) ? Boolean(suggestion.disabled) : Boolean(suggestion.archived),
  );
  const showsPeople = items[0] !== undefined && isPersonSuggestion(items[0]);
  const primaryGroupLabel = showsPeople ? "Available people" : "Active channels";
  const secondaryGroupLabel = showsPeople ? "Unavailable" : "Archived channels";
  const renderSuggestion = (suggestion: Suggestion, index: number) => {
    const optionProps = getOptionProps(suggestion, index);

    return isPersonSuggestion(suggestion) ? (
      <PersonSuggestion key={suggestion.handle} suggestion={suggestion} optionProps={optionProps} />
    ) : (
      <ChannelSuggestion key={suggestion.name} suggestion={suggestion} optionProps={optionProps} />
    );
  };

  return (
    <ComposerSuggestionList {...getListProps({ "aria-label": "Composer suggestions" })}>
      <ComposerSuggestionGroup role="group" aria-label={primaryGroupLabel}>
        <ComposerSuggestionGroupLabel aria-hidden>{primaryGroupLabel}</ComposerSuggestionGroupLabel>
        {primaryItems.map(({ suggestion, index }) => renderSuggestion(suggestion, index))}
      </ComposerSuggestionGroup>
      {secondaryItems.length > 0 ? (
        <ComposerSuggestionGroup separated role="group" aria-label={secondaryGroupLabel}>
          <ComposerSuggestionGroupLabel aria-hidden>
            {secondaryGroupLabel}
          </ComposerSuggestionGroupLabel>
          {secondaryItems.map(({ suggestion, index }) => renderSuggestion(suggestion, index))}
        </ComposerSuggestionGroup>
      ) : null}
    </ComposerSuggestionList>
  );
}

type SuggestionOptionProps = ReturnType<ComposerSuggestions["getOptionProps"]>;

type PersonSuggestionProps = {
  suggestion: PersonSuggestionData;
  optionProps: SuggestionOptionProps;
};

function PersonSuggestion({ suggestion, optionProps }: PersonSuggestionProps) {
  return (
    <ComposerSuggestionOption {...optionProps}>
      <ComposerSuggestionIcon variant="framed">
        <AtSign />
      </ComposerSuggestionIcon>
      <ComposerSuggestionContent>
        <ComposerSuggestionTitle>{suggestion.name}</ComposerSuggestionTitle>
        <ComposerSuggestionMeta>{suggestion.role}</ComposerSuggestionMeta>
        <ComposerSuggestionAside>
          {suggestion.disabled ? (
            <ComposerSuggestionBadge>unavailable</ComposerSuggestionBadge>
          ) : (
            <ComposerSuggestionBadge aria-label="Available" variant="indicator" />
          )}
        </ComposerSuggestionAside>
      </ComposerSuggestionContent>
    </ComposerSuggestionOption>
  );
}

type ChannelSuggestionProps = {
  suggestion: ChannelSuggestionData;
  optionProps: SuggestionOptionProps;
};

function ChannelSuggestion({ suggestion, optionProps }: ChannelSuggestionProps) {
  return (
    <ComposerSuggestionOption {...optionProps}>
      <ComposerSuggestionIcon variant="framed">
        <Hash />
      </ComposerSuggestionIcon>
      <ComposerSuggestionContent>
        <ComposerSuggestionTitle>{suggestion.name}</ComposerSuggestionTitle>
        <ComposerSuggestionMeta>{suggestion.description}</ComposerSuggestionMeta>
        <ComposerSuggestionAside>
          {suggestion.archived ? (
            <ComposerSuggestionBadge>archived</ComposerSuggestionBadge>
          ) : (
            <ComposerSuggestionMeta variant="code">#{suggestion.name}</ComposerSuggestionMeta>
          )}
        </ComposerSuggestionAside>
      </ComposerSuggestionContent>
    </ComposerSuggestionOption>
  );
}
