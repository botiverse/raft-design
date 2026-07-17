import type { ComposerSuggestionTriggerMatch } from "raft-ui/wip";

export type PersonSuggestion = {
  avatarFallback: string;
  avatarSrc?: string;
  description?: string;
  handle: string;
  name: string;
  outOfChannel?: boolean;
  type: "agent" | "human";
};

export type ChannelSuggestion = {
  archived?: boolean;
  description: string;
  name: string;
};

export type Suggestion = PersonSuggestion | ChannelSuggestion;

const humanAvatar = (photoId: string) =>
  `https://unsplash.com/photos/${photoId}/download?force=true&w=80&h=80&fit=crop&crop=faces`;

const people: readonly PersonSuggestion[] = [
  {
    avatarFallback: "A",
    avatarSrc: humanAvatar("n4KewLKFOZw"),
    description: "Design",
    handle: "atlas",
    name: "Atlas",
    type: "agent",
  },
  {
    avatarFallback: "A",
    avatarSrc: humanAvatar("H6FbE_vxaxQ"),
    handle: "avery",
    name: "Avery",
    type: "human",
  },
  {
    avatarFallback: "M",
    avatarSrc: humanAvatar("mxwcEIqJ63Y"),
    handle: "morgan",
    name: "Morgan",
    outOfChannel: true,
    type: "human",
  },
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
  return !isPersonSuggestion(suggestion) && Boolean(suggestion.archived);
}

function matchesQuery(suggestion: Suggestion, query: string) {
  const searchable = isPersonSuggestion(suggestion)
    ? `${suggestion.name} ${suggestion.handle} ${suggestion.description ?? ""}`
    : `${suggestion.name} ${suggestion.description}`;
  return searchable.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}
