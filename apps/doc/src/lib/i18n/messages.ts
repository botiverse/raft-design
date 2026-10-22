import type { SectionId } from "../content/pages.ts";
import { DEFAULT_LOCALE } from "./locales.ts";
import type { Locale } from "./locales.ts";

// The site's own words: the shell, page chrome and notices. The pages
// themselves are Markdown (i18n/README.md). English is the source; every other
// language must give every entry, which the type checks.

const en = {
  siteName: "Raft Design System",
  documentation: "Documentation",
  openNavigation: "Open navigation",
  search: "Search",
  searchTrigger: "Search components, tokens, patterns",
  colorMode: "Color mode",
  light: "Light",
  dark: "Dark",
  system: "System",
  language: (name: string) => `Language: ${name}`,
  overview: "Overview",
  forAgents: "For Agents",
  changelog: "Changelog",
  changelogSummary: "What changed in each release of raft-ui, newest first.",
  contributing: "Contributing",
  contributingSummary: "How to propose a change to the system, in code and docs together.",
  decisions: "Decisions",
  noPagesYet: "No pages yet.",
  decision: (number: string) => `Decision ${number}`,

  searchTheDocs: "Search the docs",
  searchPlaceholder: "Try “sheet”, “snackbar” or “color”",
  searchNoMatch: (query: string) => `No pages match “${query}”`,
  searchNoMatchHelp: "Search matches page titles, former names and summaries.",
  searchEmpty: "Pages, components and their other names. Use ↑ ↓ and Enter.",
  alsoCalled: (names: string) => `Also called ${names}`,

  onThisPage: "On this page",
  copyPage: "Copy Page",
  copied: "Copied",
  morePageActions: "More page actions",
  viewAsMarkdown: "View as Markdown",
  copyMarkdownLink: "Copy Markdown Link",
  viewSource: "View Source",

  notTranslatedTitle: "Not translated yet",
  notTranslated: "This page is in English until its translation is written.",
  staleTitle: "The English page has changed",
  stale: "The English page has changed since this translation was written.",
  readInEnglish: "Read it in English",

  browseComponents: "Browse Components",
  readPrinciples: "Read the Principles",
  readFoundations: "Read the Foundations",
  copyInstall: "Copy install command",
  forAgentsHeading: "For agents",
  llmsText: "Every page with a one-line summary, by section.",
  llmsFullText: "Every page in one file, in the same order.",
  markdownTwinText: "Any page as Markdown: its path plus .md.",
  componentsJsonText:
    "Every component with its status, other names, category, import and doc URLs.",
  latestRelease: "Latest release",
  fullChangelog: "Full changelog",

  experimental: "Experimental",
  stable: "Stable",
  deprecated: "Deprecated",
  copyImport: "Copy import",
  api: "API",
  related: "Related",
  changes: "Changes",
  useInstead: "Use",
  insteadRemoved: (title: string) =>
    ` instead. ${title} will be removed in the next major version.`,
  willBeRemoved: (title: string) => `${title} will be removed in the next major version.`,
  notDocumentedTitle: "Not documented yet",
  notDocumented: "The API below is generated from raft-ui. The guidelines will be in",
  notDocumentedEnd: ".",
  takesAttributes: "Takes the attributes of its element.",
  noProps: "No props.",
  prop: "Prop",
  type: "Type",
  default: "Default",
  deprecatedProp: "Deprecated. ",

  exampleTheme: "Example theme",
  page: "Page",
  both: "Both",
  phoneWidth: "Phone width",
  showCode: "Show code",
  atPhoneWidth: (path: string) => `${path} at phone width`,
  token: "Token",
  desktop: "Desktop",

  sections: {
    principles: {
      title: "Principles",
      summary:
        "Why Raft looks and behaves the way it does, and how to decide what a new feature needs.",
    },
    "people-and-agents": {
      title: "People and Agents",
      summary:
        "How people and agents share one server: who is who, who does what, and how it shows.",
    },
    foundations: {
      title: "Foundations",
      summary:
        "Color, type, spacing, shape, motion and states: the values and the rules for using them.",
    },
    content: { title: "Content", summary: "How Raft writes: voice, words, labels and messages." },
    patterns: {
      title: "Patterns",
      summary: "How components combine into screens in any Raft product.",
    },
    components: {
      title: "Components",
      summary:
        "Every raft-ui component: when to use it, live examples in light and dark, and its API.",
    },
    products: {
      title: "Products",
      summary:
        "Structure that belongs to one product: its destinations and what each screen shows.",
    },
    about: {
      title: "About",
      summary: "Where the system comes from, how it changes, and how to contribute.",
    },
    decisions: {
      title: "Decisions",
      summary: "Why the system chose one option over another, and the questions still open.",
    },
  } satisfies Record<SectionId, { title: string; summary: string }>,

  layers: { core: "Core", collaboration: "Collaboration" } as Record<string, string>,
  categories: {
    actions: "Actions",
    inputs: "Inputs",
    navigation: "Navigation",
    overlays: "Overlays",
    feedback: "Feedback",
    layout: "Layout",
    "data-display": "Data Display",
    identity: "Identity",
    messages: "Messages",
    tasks: "Tasks",
    agents: "Agents",
    inbox: "Inbox",
    search: "Search",
    files: "Files",
  } as Record<string, string>,
  otherCategory: "Other",
};

export type Messages = typeof en;

const zh: Messages = {
  siteName: "Raft 设计系统",
  documentation: "文档",
  openNavigation: "打开导航",
  search: "搜索",
  searchTrigger: "搜索组件、token、模式",
  colorMode: "颜色模式",
  light: "浅色",
  dark: "深色",
  system: "跟随系统",
  language: (name) => `语言：${name}`,
  overview: "概览",
  forAgents: "给 Agent 读",
  changelog: "更新日志",
  changelogSummary: "raft-ui 每个版本的改动，最新的在前。",
  contributing: "参与贡献",
  contributingSummary: "怎样提议修改设计系统：代码和文档一起改。",
  decisions: "决策记录",
  noPagesYet: "还没有页面。",
  decision: (number) => `决策 ${number}`,

  searchTheDocs: "搜索文档",
  searchPlaceholder: "试试「颜色」「sheet」或「snackbar」",
  searchNoMatch: (query) => `没有与「${query}」匹配的页面`,
  searchNoMatchHelp: "搜索会匹配页面标题、英文标题、曾用名和摘要。",
  searchEmpty: "页面、组件和它们的其他名称。用 ↑ ↓ 和 Enter 选择。",
  alsoCalled: (names) => `也叫 ${names}`,

  onThisPage: "本页内容",
  copyPage: "复制页面",
  copied: "已复制",
  morePageActions: "更多页面操作",
  viewAsMarkdown: "查看 Markdown",
  copyMarkdownLink: "复制 Markdown 链接",
  viewSource: "查看源文件",

  notTranslatedTitle: "本页尚未翻译",
  notTranslated: "译文完成之前，这里显示英文原文。",
  staleTitle: "英文版有更新",
  stale: "这份译文写成之后，英文原文改过，部分内容可能已经过时。",
  readInEnglish: "阅读英文版",

  browseComponents: "浏览组件",
  readPrinciples: "阅读设计原则",
  readFoundations: "阅读基础",
  copyInstall: "复制安装命令",
  forAgentsHeading: "给 Agent 读",
  llmsText: "所有页面及一句话摘要，按章节排列（英文）。",
  llmsFullText: "所有页面合成一个文件，顺序相同（英文）。",
  markdownTwinText: "任何页面的 Markdown 版本：在路径后加 .md。",
  componentsJsonText: "所有组件的状态、其他名称、分类、导入方式和文档地址。",
  latestRelease: "最新版本",
  fullChangelog: "完整更新日志",

  experimental: "实验性",
  stable: "稳定",
  deprecated: "已弃用",
  copyImport: "复制导入语句",
  api: "API",
  related: "相关组件",
  changes: "改动",
  useInstead: "请改用",
  insteadRemoved: (title) => `。${title} 会在下一个主版本中移除。`,
  willBeRemoved: (title) => `${title} 会在下一个主版本中移除。`,
  notDocumentedTitle: "还没有文档",
  notDocumented: "下面的 API 由 raft-ui 代码生成。使用规范会写在",
  notDocumentedEnd: "。",
  takesAttributes: "接受其元素的全部属性。",
  noProps: "没有 props。",
  prop: "Prop",
  type: "类型",
  default: "默认值",
  deprecatedProp: "已弃用。",

  exampleTheme: "示例主题",
  page: "跟随页面",
  both: "并排",
  phoneWidth: "手机宽度",
  showCode: "显示代码",
  atPhoneWidth: (path) => `${path}（手机宽度）`,
  token: "Token",
  desktop: "桌面端",

  sections: {
    principles: {
      title: "原则",
      summary: "Raft 为什么长这样、为什么这样运作，以及怎样判断一个新功能需要什么。",
    },
    "people-and-agents": {
      title: "人和 Agent",
      summary: "人和 agent 怎样共用一个服务器：谁是谁、谁做什么、界面上怎么体现。",
    },
    foundations: {
      title: "基础",
      summary: "颜色、文字、间距、形状、动效和状态：取值，以及使用它们的规则。",
    },
    content: { title: "内容", summary: "Raft 怎样写字：语气、用词、标签和提示信息。" },
    patterns: { title: "模式", summary: "组件怎样组合成任何 Raft 产品里的界面。" },
    components: {
      title: "组件",
      summary: "raft-ui 的每个组件：什么时候用、浅色和深色下的实时示例，以及它的 API。",
    },
    products: {
      title: "产品",
      summary: "只属于某一个产品的结构：它有哪些去处，每个界面显示什么。",
    },
    about: { title: "关于", summary: "设计系统从哪里来、怎样演进，以及怎样参与贡献。" },
    decisions: {
      title: "决策记录",
      summary: "设计系统为什么选了一个方案而不是另一个，以及仍未解决的问题。",
    },
  },

  layers: { core: "核心", collaboration: "协作" },
  categories: {
    actions: "操作",
    inputs: "输入",
    navigation: "导航",
    overlays: "浮层",
    feedback: "反馈",
    layout: "布局",
    "data-display": "数据展示",
    identity: "身份",
    messages: "消息",
    tasks: "任务",
    agents: "Agent",
    inbox: "收件箱",
    search: "搜索",
    files: "文件",
  },
  otherCategory: "其他",
};

const MESSAGES: Record<Locale, Messages> = { en, zh };

export function messagesFor(locale: Locale = DEFAULT_LOCALE): Messages {
  return MESSAGES[locale];
}
