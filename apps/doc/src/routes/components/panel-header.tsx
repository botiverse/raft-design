import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Button, Status } from "raft-ui";
import {
  PanelHeader,
  PanelHeaderActions,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeaderSubtitle,
  PanelHeaderSuffix,
  PanelHeaderTitle,
  PanelHeaderTitleRow,
  PanelHeaderVisual,
} from "raft-ui/wip";
import {
  ArrowLeft,
  Bookmark,
  BookmarkMinus,
  CalendarRange,
  ChevronDown,
  Hash,
  MessageSquare,
  RotateCcw,
  Search,
  Settings,
  Square,
  UserCircle2,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyPanelHeader from "../../../../../packages/ui/src/legacy/PanelHeader.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "slots", title: "Slots" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import {
  PanelHeader,
  PanelHeaderContent,
  PanelHeaderTitle,
  PanelHeaderTitleRow,
} from "raft-ui";

<PanelHeader>
  <PanelHeaderContent>
    <PanelHeaderTitleRow>
      <PanelHeaderTitle>Settings</PanelHeaderTitle>
    </PanelHeaderTitleRow>
  </PanelHeaderContent>
</PanelHeader>`,
  slots: `<PanelHeader>
  <Button size="icon-sm" className="md:hidden" aria-label="Back" onClick={goBack}>
    <ArrowLeft />
  </Button>
  <PanelHeaderIcon className="flex bg-brutal-yellow">
    <Bookmark />
  </PanelHeaderIcon>
  <PanelHeaderContent>
    <PanelHeaderTitleRow>
      <PanelHeaderTitle>Saved</PanelHeaderTitle>
    </PanelHeaderTitleRow>
    <PanelHeaderSubtitle>{saved.length} saved</PanelHeaderSubtitle>
  </PanelHeaderContent>
  <PanelHeaderActions>
    <Button size="icon-sm" aria-label="Settings">
      <Settings />
    </Button>
  </PanelHeaderActions>
</PanelHeader>`,
  sourceSaved: `<div className="flex min-h-0 flex-1 flex-col">
  <PanelHeader
    title="Saved"
    subtitle={\`\${saved.length} saved\`}
    icon={<Bookmark size={18} />}
    iconBg="bg-brutal-yellow"
    onMobileBack={onMobileBack}
  />

  <div className="flex-1 overflow-y-auto bg-white p-4 safe-bottom">
    <div className="flex flex-col gap-2">
      <SavedItem />
    </div>
  </div>
</div>`,
  sourceSavedHeader: `<PanelHeader
  title="Saved"
  subtitle={\`\${saved.length} saved\`}
  icon={<Bookmark size={18} />}
  iconBg="bg-brutal-yellow"
  onMobileBack={onMobileBack}
/>`,
  currentSaved: `<PanelHeader>
  <Button size="icon-sm" className="md:hidden" aria-label="Back" onClick={onMobileBack}>
    <ArrowLeft />
  </Button>
  <PanelHeaderIcon className="bg-brutal-yellow">
    <Bookmark />
  </PanelHeaderIcon>
  <PanelHeaderContent>
    <PanelHeaderTitleRow>
      <PanelHeaderTitle>Saved</PanelHeaderTitle>
    </PanelHeaderTitleRow>
    <PanelHeaderSubtitle>{saved.length} saved</PanelHeaderSubtitle>
  </PanelHeaderContent>
</PanelHeader>`,
  sourceIdentity: `<div className="flex min-h-0 flex-1 flex-col">
  <PanelHeader
    iconSlot={<AvatarSlot context="panel-header" type="agent" />}
    iconAlwaysVisible
    title="Atlas"
    titleSuffix={<StatusDot tone="bg-brutal-lime" />}
    subtitle="claude-opus · online"
    actions={<AgentHeaderActions />}
  />

  <div className="flex-1 overflow-y-auto bg-white p-4">
    <AgentSummary />
  </div>
</div>`,
  currentIdentity: `<div className="flex min-h-0 flex-1 flex-col">
  <PanelHeader>
    <PanelHeaderVisual className="flex">
      <Avatar size="md" type="agent" />
    </PanelHeaderVisual>
    <PanelHeaderContent>
      <PanelHeaderTitleRow>
        <PanelHeaderTitle>Atlas</PanelHeaderTitle>
        <PanelHeaderSuffix>
          <Status variant="success" />
        </PanelHeaderSuffix>
      </PanelHeaderTitleRow>
      <PanelHeaderSubtitle>claude-opus · online</PanelHeaderSubtitle>
    </PanelHeaderContent>
    <PanelHeaderActions>
      <AgentHeaderActions />
    </PanelHeaderActions>
  </PanelHeader>

  <div className="flex-1 overflow-y-auto bg-white p-4">
    <AgentSummary />
  </div>
</div>`,
  sourceSearch: `<div className="flex min-h-0 flex-1 flex-col bg-white">
  <PanelHeader
    titleSlot={
      <div className="flex items-center gap-3">
        <div className="flex size-icon-header shrink-0 items-center justify-center border-2 border-black bg-brutal-yellow">
          <Search size={18} />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 border-2 border-black bg-white px-3 py-1.5 shadow-brutal-sm">
          <input value="design system" readOnly />
          <button className="btn-brutal-sm bg-white p-1" aria-label="Clear search">
            <X size={12} />
          </button>
          <span className="hidden border border-black px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-black/50 sm:inline">
            ESC
          </span>
        </div>
      </div>
    }
  />

  <SearchFilterToolbar />

  <SearchResultsContext />
</div>`,
  currentSearch: `<div className="flex min-h-0 flex-1 flex-col bg-white">
  <PanelHeader>
  <PanelHeaderContent>
    <div className="flex items-center gap-3">
      <PanelHeaderIcon className="flex bg-brutal-yellow">
        <Search />
      </PanelHeaderIcon>
      <div className="flex min-w-0 flex-1 items-center gap-2 border-2 border-black bg-white px-3 py-1.5 shadow-brutal-sm">
        <input value="design system" readOnly />
        <button className="btn-brutal-sm bg-white p-1" aria-label="Clear search">
          <X size={12} />
        </button>
        <span className="hidden border border-black px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-black/50 sm:inline">
          ESC
        </span>
      </div>
    </div>
  </PanelHeaderContent>
</PanelHeader>

  <SearchFilterToolbar />

  <SearchResultsContext />
</div>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "PanelHeader",
    type: 'useRender.ComponentProps<"div">',
    description: "Outer 62px panel header row.",
  },
  {
    name: "PanelHeaderIcon",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Framed 36px icon container. Pass the exact source background class via className.",
  },
  {
    name: "PanelHeaderVisual",
    type: 'useRender.ComponentProps<"div">',
    description: "Unframed visual slot for pre-wrapped avatars or identity marks.",
  },
  {
    name: "PanelHeaderContent",
    type: 'useRender.ComponentProps<"div">',
    description: "Flexible title/search content area.",
  },
  {
    name: "PanelHeaderTitleRow",
    type: 'useRender.ComponentProps<"div">',
    description: "Horizontal title line that keeps suffix content outside title truncation.",
  },
  {
    name: "PanelHeaderTitle",
    type: 'useRender.ComponentProps<"h2">',
    description: "Truncating panel title.",
  },
  {
    name: "PanelHeaderSuffix",
    type: 'useRender.ComponentProps<"div">',
    description: "Inline title suffix such as a status dot or badge.",
  },
  {
    name: "PanelHeaderSubtitle",
    type: 'useRender.ComponentProps<"p">',
    description: "Mono subtitle line. Truncates by default.",
  },
  {
    name: "PanelHeaderActions",
    type: 'useRender.ComponentProps<"div">',
    description: "Right-aligned action cluster.",
  },
];

export const Route = createFileRoute("/components/panel-header")({
  component: PanelHeaderDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function PanelHeaderDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="PanelHeader"
      description="The canonical panel column header, now composed from explicit visual, title, subtitle, and action slots."
      overview={
        <Differences from="PanelHeader">
          <li>
            source props (<code>title</code>, <code>icon</code>, <code>iconSlot</code>,{" "}
            <code>titleSlot</code>, <code>actions</code>) are now explicit composition slots
          </li>
          <li>
            source utilities (<code>h-panel-header</code>, <code>size-icon-header</code>) are
            preserved visually as literal slot styles
          </li>
          <li>
            brutal height, padding, icon sizing, mobile back behavior, and action spacing match
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Example html={code.slots}>
          <div className="w-full max-w-md border-2 border-black">
            <CurrentSavedPanelHeader showAction />
          </div>
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="PanelHeader.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="slots" title="Slots" showThemeSwitcher>
        <div className="grid gap-4 lg:grid-cols-2">
          <Example html={code.currentIdentity}>
            <div className="border-2 border-black">
              <CurrentIdentityPanelHeader />
            </div>
          </Example>
          <Example html={code.currentSearch}>
            <div className="border-2 border-black">
              <CurrentSearchPanelHeader />
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Saved panel header",
              status: "difference",
              note: "Source packed title, subtitle, icon, and back behavior into props. Current composes the same layout with explicit slots.",
              sourceScenes: [
                {
                  label: "Saved panel source",
                  scenes: [
                    {
                      label: "SavedPanel.tsx:96",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/saved/SavedPanel.tsx:96",
                    },
                    {
                      label: "SavedPanel.tsx:196",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/saved/SavedPanel.tsx:196",
                    },
                  ],
                },
              ],
              source: (
                <SavedPanelComparisonFrame>
                  <LegacyPanelHeader
                    title="Saved"
                    subtitle="3 saved"
                    icon={<Bookmark size={18} />}
                    iconBg="bg-brutal-yellow"
                    onMobileBack={() => {}}
                  />
                </SavedPanelComparisonFrame>
              ),
              current: (
                <SavedPanelComparisonFrame>
                  <CurrentSavedPanelHeader />
                </SavedPanelComparisonFrame>
              ),
              sourceCode: code.sourceSaved,
              currentCode: code.currentSaved,
              compositionCode: code.currentSaved,
              compositionPath: "apps/doc/src/compositions/panel-header/saved-panel-composition.tsx",
              compositionSource: SNIPPETS.currentSaved,
            },
            {
              label: "Identity panel",
              status: "difference",
              note: "Source used iconSlot and titleSuffix props for identity panels. Current exposes visual, suffix, and actions as normal children.",
              sourceScenes: [
                {
                  label: "Agent detail source",
                  scenes: [
                    {
                      label: "AgentDetailPanel.tsx:1293",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:1293",
                    },
                    {
                      label: "AgentDetailPanel.tsx:1334",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:1334",
                    },
                  ],
                },
              ],
              source: (
                <IdentityPanelComparisonFrame>
                  <LegacyPanelHeader
                    iconSlot={<Avatar size="md" type="agent" />}
                    iconAlwaysVisible
                    title="Atlas"
                    titleSuffix={<Status variant="success" />}
                    subtitle="claude-opus · online"
                    actions={<AgentHeaderActions />}
                  />
                </IdentityPanelComparisonFrame>
              ),
              current: (
                <IdentityPanelComparisonFrame>
                  <CurrentIdentityPanelHeader />
                </IdentityPanelComparisonFrame>
              ),
              sourceCode: code.sourceIdentity,
              currentCode: code.currentIdentity,
              compositionCode: code.currentIdentity,
              compositionPath:
                "apps/doc/src/compositions/panel-header/identity-panel-composition.tsx",
              compositionSource: SNIPPETS.currentIdentity,
            },
            {
              label: "Search title slot",
              status: "difference",
              note: "Source used titleSlot as a full replacement escape hatch. Current keeps the same freedom by composing arbitrary content inside PanelHeaderContent.",
              sourceScenes: [
                {
                  label: "Message search source",
                  scenes: [
                    {
                      label: "MessageSearchPage.tsx:686",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/search/MessageSearchPage.tsx:686",
                    },
                    {
                      label: "MessageSearchPage.tsx:722",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/search/MessageSearchPage.tsx:722",
                    },
                    {
                      label: "MessageSearchPage.tsx:917",
                      path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/search/MessageSearchPage.tsx:917",
                    },
                  ],
                },
              ],
              source: (
                <SearchPanelComparisonFrame>
                  <LegacySearchPanelHeader />
                </SearchPanelComparisonFrame>
              ),
              current: (
                <SearchPanelComparisonFrame>
                  <CurrentSearchPanelHeader />
                </SearchPanelComparisonFrame>
              ),
              sourceCode: code.sourceSearch,
              currentCode: code.currentSearch,
              compositionCode: code.currentSearch,
              compositionPath:
                "apps/doc/src/compositions/panel-header/search-title-slot-composition.tsx",
              compositionSource: SNIPPETS.currentSearch,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function SavedPanelComparisonFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-56 w-full max-w-sm min-h-0 flex-col overflow-hidden bg-white [[data-theme=elegant]_&]:bg-layer-panel">
      {children}
      <div className="flex-1 overflow-y-auto bg-white p-4">
        <div className="flex flex-col gap-2">
          <SourceSavedItem />
        </div>
      </div>
    </div>
  );
}

function SourceSavedItem() {
  return (
    <button
      type="button"
      className="relative flex w-full items-start gap-3 border-2 border-black/30 bg-white p-3 text-left transition-colors hover:border-black hover:shadow-brutal-sm active:border-black active:shadow-brutal-sm"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-bold text-black/50">#design-system</span>
          <span className="inline-flex items-center gap-1 font-bold text-black">
            <span>Cindy</span>
          </span>
          <span className="font-mono text-xs text-black/40">2h ago</span>
        </div>
        <p className="line-clamp-3 text-sm">
          Panel header should keep the original saved-message surface rhythm.
        </p>
      </div>
      <div
        className="btn-brutal-sm shrink-0 bg-white p-1.5"
        title="Remove from Saved"
        role="button"
      >
        <BookmarkMinus size={14} />
      </div>
    </button>
  );
}

function IdentityPanelComparisonFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-56 w-full max-w-sm min-h-0 flex-col overflow-hidden bg-white [[data-theme=elegant]_&]:bg-layer-panel">
      {children}
      <div className="flex-1 overflow-y-auto bg-white p-4">
        <AgentSummary />
      </div>
    </div>
  );
}

function AgentHeaderActions() {
  return (
    <>
      <button
        type="button"
        className="btn-brutal-sm flex h-7 items-center justify-center gap-1.5 bg-white px-2 text-xs font-bold sm:px-2.5"
        title="Message"
      >
        <MessageSquare size={14} />
        <span>Message</span>
      </button>
      <button
        type="button"
        className="btn-brutal-sm hidden size-7 items-center justify-center bg-white md:flex"
        title="Stop Agent"
      >
        <Square size={14} />
      </button>
      <button
        type="button"
        className="btn-brutal-sm hidden size-7 items-center justify-center bg-white md:flex"
        title="Restart / Reset"
      >
        <RotateCcw size={14} />
      </button>
    </>
  );
}

function AgentSummary() {
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="border-2 border-black/20 bg-white p-3">
          <div className="font-mono text-[10px] font-bold text-black/40 uppercase">Runtime</div>
          <div className="mt-1 text-sm font-bold text-black">codex</div>
        </div>
        <div className="border-2 border-black/20 bg-white p-3">
          <div className="font-mono text-[10px] font-bold text-black/40 uppercase">Model</div>
          <div className="mt-1 text-sm font-bold text-black">gpt-5</div>
        </div>
      </div>
      <div className="border-2 border-black/20 bg-white p-3 text-sm text-black">
        Handles design-system migration checks and component parity notes.
      </div>
    </div>
  );
}

function SearchPanelComparisonFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-56 w-full max-w-sm min-h-0 flex-col overflow-hidden bg-white [[data-theme=elegant]_&]:bg-layer-panel">
      {children}
      <SearchFilterToolbar />
      <SearchResultsContext />
    </div>
  );
}

function SearchFilterToolbar() {
  return (
    <div className="shrink-0 border-b-2 border-black bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchFilterChip icon={<UserCircle2 size={14} />} label="From" />
        <SearchFilterChip icon={<Hash size={14} />} label="Channel" />
        <SearchFilterChip icon={<CalendarRange size={14} />} label="Any time" />
        <div className="ml-auto flex border-2 border-black/30 bg-white text-xs font-bold uppercase tracking-wide text-black/70">
          <button type="button" className="bg-brutal-yellow px-3 py-1.5 text-black">
            Relevant
          </button>
          <button type="button" className="border-l-2 border-black/30 px-3 py-1.5">
            Recent
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchFilterChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 border-2 border-black/30 bg-white px-3 py-1.5 text-xs font-bold tracking-wide text-black/70 uppercase transition-colors hover:border-black"
    >
      {icon}
      <span>{label}</span>
      <ChevronDown size={12} />
    </button>
  );
}

function SearchResultsContext() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-white p-4">
      <div className="mb-3 px-1">
        <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-black/50 uppercase">
          3 results
        </div>
      </div>
      <div className="px-1 py-2 font-mono text-[10px] font-bold tracking-[0.2em] text-black/50 uppercase">
        Messages
      </div>
      <button
        type="button"
        className="w-full border-2 border-black/30 bg-white p-3 text-left transition-colors hover:border-black hover:shadow-brutal-sm active:border-black active:shadow-brutal-sm"
      >
        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-black/50">#design-system</span>
          <span className="inline-flex items-center gap-1 font-bold text-black">
            <span>Cindy</span>
          </span>
          <span className="font-mono text-black/40">2h ago</span>
        </div>
        <div className="line-clamp-2 text-sm leading-relaxed text-black/70">
          PanelHeader titleSlot keeps search input, clear action, and shortcut in one row.
        </div>
      </button>
    </div>
  );
}

function CurrentSavedPanelHeader({ showAction = false }: { showAction?: boolean }) {
  return (
    <PanelHeader>
      <Button size="icon-sm" className="md:hidden" aria-label="Back" onClick={() => {}}>
        <ArrowLeft />
      </Button>
      <PanelHeaderIcon className="bg-brutal-yellow">
        <Bookmark />
      </PanelHeaderIcon>
      <PanelHeaderContent>
        <PanelHeaderTitleRow>
          <PanelHeaderTitle>Saved</PanelHeaderTitle>
        </PanelHeaderTitleRow>
        <PanelHeaderSubtitle>3 saved</PanelHeaderSubtitle>
      </PanelHeaderContent>
      {showAction ? (
        <PanelHeaderActions>
          <Button size="icon-sm" aria-label="Settings">
            <Settings />
          </Button>
        </PanelHeaderActions>
      ) : null}
    </PanelHeader>
  );
}

function CurrentIdentityPanelHeader() {
  return (
    <PanelHeader>
      <PanelHeaderVisual className="flex">
        <Avatar size="md" type="agent" />
      </PanelHeaderVisual>
      <PanelHeaderContent>
        <PanelHeaderTitleRow>
          <PanelHeaderTitle>Atlas</PanelHeaderTitle>
          <PanelHeaderSuffix>
            <Status variant="success" />
          </PanelHeaderSuffix>
        </PanelHeaderTitleRow>
        <PanelHeaderSubtitle>claude-opus · online</PanelHeaderSubtitle>
      </PanelHeaderContent>
      <PanelHeaderActions>
        <AgentHeaderActions />
      </PanelHeaderActions>
    </PanelHeader>
  );
}

function LegacySearchPanelHeader() {
  return (
    <LegacyPanelHeader
      titleSlot={
        <div className="flex items-center gap-3">
          <div className="flex size-icon-header shrink-0 items-center justify-center border-2 border-black bg-brutal-yellow">
            <Search size={18} />
          </div>
          <SearchInputCluster />
        </div>
      }
    />
  );
}

function CurrentSearchPanelHeader() {
  return (
    <PanelHeader>
      <PanelHeaderContent>
        <div className="flex items-center gap-3">
          <PanelHeaderIcon className="flex bg-brutal-yellow">
            <Search />
          </PanelHeaderIcon>
          <SearchInputCluster />
        </div>
      </PanelHeaderContent>
    </PanelHeader>
  );
}

function SearchInputCluster() {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 border-2 border-black bg-white px-3 py-1.5 shadow-brutal-sm">
      <input
        aria-label="Search messages"
        className="min-w-0 flex-1 bg-transparent font-heading text-sm font-medium outline-none"
        value="design system"
        readOnly
      />
      <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Clear search">
        <X size={12} />
      </button>
      <span className="hidden border border-black px-1.5 py-0.5 font-mono text-[10px] font-bold text-black/50 uppercase sm:inline">
        ESC
      </span>
    </div>
  );
}
