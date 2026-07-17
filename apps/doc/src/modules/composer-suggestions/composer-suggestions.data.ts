import type { ComposerSuggestionTriggerMatch } from "raft-ui/wip";

export type PersonSuggestion = {
  disabled?: boolean;
  handle: string;
  name: string;
  role: string;
};

export type ChannelSuggestion = {
  archived?: boolean;
  description: string;
  name: string;
};

export type Suggestion = PersonSuggestion | ChannelSuggestion;

const people: readonly PersonSuggestion[] = [
  { handle: "atlas", name: "Atlas", role: "Design" },
  { handle: "avery", name: "Avery", role: "Engineering" },
  { disabled: true, handle: "morgan", name: "Morgan", role: "Unavailable" },
];

const channels: readonly ChannelSuggestion[] = [
  { description: "Product design", name: "proj-uiux" },
  { description: "Engineering updates", name: "eng-platform" },
  { archived: true, description: "Past launch", name: "launch-2025" },
];

export function isPersonSuggestion(suggestion: Suggestion): suggestion is PersonSuggestion {
  return "handle" in suggestion;
}

export function detectSuggestion(textBeforeCaret: string): ComposerSuggestionTriggerMatch | null {
  const match = /(?:^|\s)([@#])([^\s@#]*)$/.exec(textBeforeCaret);
  if (!match) return null;
  return {
    marker: match[1],
    query: match[2],
    start: match.index + match[0].lastIndexOf(match[1]),
  };
}

export function getSuggestions(match: ComposerSuggestionTriggerMatch): readonly Suggestion[] {
  return (match.marker === "@" ? people : channels).filter((suggestion) =>
    matchesQuery(suggestion, match.query),
  );
}

export function getSuggestionText(suggestion: Suggestion) {
  return isPersonSuggestion(suggestion) ? `@${suggestion.handle} ` : `#${suggestion.name} `;
}

export function isSuggestionDisabled(suggestion: Suggestion) {
  return isPersonSuggestion(suggestion)
    ? Boolean(suggestion.disabled)
    : Boolean(suggestion.archived);
}

function matchesQuery(suggestion: Suggestion, query: string) {
  const searchable = isPersonSuggestion(suggestion)
    ? `${suggestion.name} ${suggestion.handle} ${suggestion.role}`
    : `${suggestion.name} ${suggestion.description}`;
  return searchable.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}
