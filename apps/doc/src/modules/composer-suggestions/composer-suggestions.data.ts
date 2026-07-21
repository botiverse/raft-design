import type { ComposerSuggestionTriggerMatch } from "raft-ui";

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
    avatarFallback: "陈",
    avatarSrc: humanAvatar("7YVZYZeITc8"),
    description: "产品设计",
    handle: "chenmo",
    name: "陈默",
    type: "agent",
  },
  {
    avatarFallback: "J",
    avatarSrc: humanAvatar("rDEOVtE7vOs"),
    description: "Platform",
    handle: "jordan",
    name: "Jordan Lee",
    type: "human",
  },
  {
    avatarFallback: "林",
    avatarSrc: humanAvatar("mEZ3PoFGs_k"),
    description: "客户成功",
    handle: "linche",
    name: "林澈",
    type: "human",
  },
  {
    avatarFallback: "M",
    avatarSrc: humanAvatar("XHVpWcr5grQ"),
    description: "Mobile",
    handle: "mia",
    name: "Mia Chen",
    type: "agent",
  },
  {
    avatarFallback: "周",
    avatarSrc: humanAvatar("p2TQ-3Bh3Oo"),
    description: "工程效能",
    handle: "zhouran",
    name: "周然",
    type: "human",
  },
  {
    avatarFallback: "S",
    avatarSrc: humanAvatar("QXevDflbl8A"),
    description: "Research",
    handle: "sora",
    name: "Sora Kim",
    type: "human",
  },
  {
    avatarFallback: "王",
    avatarSrc: humanAvatar("6anudmpILw4"),
    description: "数据分析",
    handle: "wangyi",
    name: "王一",
    outOfChannel: true,
    type: "agent",
  },
  {
    avatarFallback: "M",
    avatarSrc: humanAvatar("mxwcEIqJ63Y"),
    description: "Partnerships",
    handle: "morgan",
    name: "Morgan Bell",
    outOfChannel: true,
    type: "human",
  },
];

const channels: readonly ChannelSuggestion[] = [
  { description: "Product design", name: "proj-uiux" },
  { description: "Engineering updates", name: "eng-platform" },
  { description: "产品设计讨论", name: "产品设计" },
  { description: "Design system", name: "design-system" },
  { description: "研发公告", name: "工程公告" },
  { description: "Customer feedback", name: "客户反馈" },
  { description: "Weekly planning", name: "研发周报" },
  { description: "Experiment tracking", name: "growth-lab" },
  { description: "开发者交流", name: "开发者社区" },
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
