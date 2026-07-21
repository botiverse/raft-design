import { Hash, UserX } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Status,
  ComposerSuggestionAside,
  ComposerSuggestionContent,
  ComposerSuggestionGroup,
  ComposerSuggestionGroupLabel,
  ComposerSuggestionIcon,
  ComposerSuggestionMeta,
  ComposerSuggestionOption,
  ComposerSuggestionTitle,
  useComposerSuggestions,
} from "raft-ui";
import { ComposerSuggestionList } from "#/modules/chat-composer/composer-responsive.tsx";

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
    isPersonSuggestion(suggestion) ? !suggestion.outOfChannel : !suggestion.archived,
  );
  const secondaryItems = indexedItems.filter(({ suggestion }) =>
    isPersonSuggestion(suggestion)
      ? Boolean(suggestion.outOfChannel)
      : Boolean(suggestion.archived),
  );
  const showsPeople = items[0] !== undefined && isPersonSuggestion(items[0]);
  const primaryGroupLabel = showsPeople ? "In this channel" : "Active channels";
  const secondaryGroupLabel = showsPeople ? "Not in this channel" : "Archived channels";
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
      {primaryItems.length > 0 ? (
        <ComposerSuggestionGroup role="group" aria-label={primaryGroupLabel}>
          <ComposerSuggestionGroupLabel aria-hidden>
            {primaryGroupLabel}
          </ComposerSuggestionGroupLabel>
          {primaryItems.map(({ suggestion, index }) => renderSuggestion(suggestion, index))}
        </ComposerSuggestionGroup>
      ) : null}
      {secondaryItems.length > 0 ? (
        <ComposerSuggestionGroup
          separated={primaryItems.length > 0}
          role="group"
          aria-label={secondaryGroupLabel}
        >
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
    <ComposerSuggestionOption
      {...optionProps}
      className={suggestion.outOfChannel ? "opacity-60" : undefined}
    >
      <ComposerSuggestionIcon>
        <Avatar size="xs" type={suggestion.type}>
          {suggestion.avatarSrc ? <AvatarImage src={suggestion.avatarSrc} alt="" /> : null}
          <AvatarFallback>{suggestion.avatarFallback}</AvatarFallback>
        </Avatar>
      </ComposerSuggestionIcon>
      {suggestion.outOfChannel ? <UserX aria-hidden className="-ml-1 size-3 shrink-0" /> : null}
      <ComposerSuggestionContent>
        <ComposerSuggestionTitle>{suggestion.name}</ComposerSuggestionTitle>
        {suggestion.type === "agent" ? (
          <Status aria-label="Online" size="sm" variant="success" />
        ) : null}
        {suggestion.description ? (
          <ComposerSuggestionMeta>{suggestion.description}</ComposerSuggestionMeta>
        ) : null}
        <ComposerSuggestionAside>
          <ComposerSuggestionMeta variant="code">@{suggestion.handle}</ComposerSuggestionMeta>
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
        <ComposerSuggestionMeta
          className={suggestion.archived ? "text-foreground-disabled/70" : undefined}
        >
          {suggestion.description}
        </ComposerSuggestionMeta>
        <ComposerSuggestionAside>
          {suggestion.archived ? (
            <Badge appearance="soft" variant="muted">
              archived
            </Badge>
          ) : (
            <ComposerSuggestionMeta variant="code">#{suggestion.name}</ComposerSuggestionMeta>
          )}
        </ComposerSuggestionAside>
      </ComposerSuggestionContent>
    </ComposerSuggestionOption>
  );
}
