import type { ComposerSuggestionTriggerMatch } from "raft-ui";

export type PersonSuggestion = {
  avatarFallback: string;
  avatarSrc?: string;
  description?: string;
  handle: string;
  name: string;
  outOfChannel?: boolean;
  /** Short role tag shown after the name, e.g. "Agent". */
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

// Stress data: long names and long descriptions. The name must always show in
// full (wrapping only when it alone is wider than the row); descriptions truncate.
const longContentPeople: readonly PersonSuggestion[] = [
  {
    avatarFallback: "P",
    description:
      "Production-minded software engineer: architecture, debugging, performance and incident response across web, desktop and mobile",
    handle: "peng",
    name: "Peng",
    type: "agent",
  },
  {
    avatarFallback: "C",
    description:
      "Pragmatic engineer for code, infrastructure debugging, PR review and release hygiene",
    handle: "cross",
    name: "cross",
    type: "agent",
  },
  {
    avatarFallback: "W",
    description:
      "A wug for work: I turn fuzzy intent into named, checked, shipped changes with evidence",
    handle: "Wug",
    name: "Wug",
    type: "agent",
  },
  {
    avatarFallback: "A",
    description:
      "Owns the design system, theme tokens and every component review before a release goes out",
    handle: "alexandra",
    name: "Alexandra Montgomery-Fitzgerald",
    type: "human",
  },
  {
    avatarFallback: "产",
    description: "负责产品体验走查、设计评审、跨团队需求梳理以及每周的用户反馈汇总与优先级排序",
    handle: "product-ux-designer",
    name: "产品体验设计师 Product UX Designer",
    type: "agent",
  },
  {
    avatarFallback: "R",
    description: "Release automation",
    handle: "release-bot",
    name: "release-automation-coordinator-for-desktop-and-mobile-builds",
    type: "agent",
  },
  {
    avatarFallback: "K",
    description: "CI triage",
    handle: "kai-the-extremely-long-handle-for-release-automation-and-ci-triage",
    name: "Kai",
    type: "agent",
  },
  {
    avatarFallback: "M",
    description:
      "Worst case: long nickname, long handle and long description together, all competing for one row in the suggestion list",
    handle: "maximilian-alexander-konstantin-von-hohenzollern-sigmaringen",
    name: "Maximilian Alexander Konstantin von Hohenzollern-Sigmaringen the Third",
    type: "human",
  },
  {
    avatarFallback: "超",
    description:
      "这是一个没有任何标点和空格的超长中文描述用来确认在最坏情况下描述依然只在剩余空间里截断而不会把名字或者句柄挤出列表之外",
    handle: "chaoji-changde-zhongwen-nicheng-ceshi-yong-de-handle",
    name: "超级无敌长的中文昵称用来测试列表在最坏情况下是否依然能保持整洁不被撑破而且还要再长一点点",
    type: "agent",
  },
  {
    avatarFallback: "Z",
    description:
      "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    handle: "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
    name: "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    type: "agent",
  },
];

const longContentChannels: readonly ChannelSuggestion[] = [
  {
    description:
      "Developer experience: CI correctness, stability and speed. DRI rotates weekly; escalate red staging here first",
    name: "p",
  },
  {
    description:
      "Cross-team launch coordination for the desktop, web and mobile clients, including release notes and rollout",
    name: "proj-release-content",
  },
  {
    description: "跨团队的发布协调、灰度节奏、发版说明和上线后的问题回收都在这里讨论",
    name: "发布协调",
  },
  {
    description:
      "A channel whose name and description are both far longer than any row, to confirm the list still holds together",
    name: "cross-team-release-coordination-for-desktop-web-and-mobile-clients-2026-and-beyond",
  },
];

export type SuggestionDataset = "default" | "long-content";

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

export function getSuggestions(
  match: ComposerSuggestionTriggerMatch,
  dataset: SuggestionDataset = "default",
): readonly Suggestion[] {
  const source =
    dataset === "long-content"
      ? match.marker === "@"
        ? longContentPeople
        : longContentChannels
      : match.marker === "@"
        ? people
        : channels;
  return source.filter((suggestion) => matchesQuery(suggestion, match.query));
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
