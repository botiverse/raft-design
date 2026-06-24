import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Badge, Button, Status } from "@raft/ui";
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
} from "@raft/ui/wip";
import { ArrowLeft, Bookmark, Search, Settings, X } from "lucide-react";

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
} from "@raft/ui";

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
  sourceSaved: `<PanelHeader
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
  sourceIdentity: `<PanelHeader
  iconSlot={<AvatarSlot context="panel-header" type="agent" />}
  iconAlwaysVisible
  title="Atlas"
  titleSuffix={<StatusDot tone="bg-brutal-lime" />}
  subtitle="claude-opus · online"
  actions={<ExperimentalBadge />}
/>`,
  currentIdentity: `<PanelHeader>
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
    <Badge.Experimental />
  </PanelHeaderActions>
</PanelHeader>`,
  sourceSearch: `<PanelHeader
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
      </div>
    </div>
  }
/>`,
  currentSearch: `<PanelHeader>
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
      </div>
    </div>
  </PanelHeaderContent>
</PanelHeader>`,
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
    description: "Framed 36px icon container. Pass the background token via className.",
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

      <DocSection id="preview" title="Preview">
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

      <DocSection id="slots" title="Slots">
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
              label: "Saved panel",
              status: "difference",
              note: "Source packed title, subtitle, icon, and back behavior into props. Current composes the same layout with explicit slots.",
              source: (
                <LegacyPanelHeader
                  title="Saved"
                  subtitle="3 saved"
                  icon={<Bookmark size={18} />}
                  iconBg="bg-brutal-yellow"
                  onMobileBack={() => {}}
                />
              ),
              current: <CurrentSavedPanelHeader />,
              sourceCode: code.sourceSaved,
              currentCode: code.currentSaved,
            },
            {
              label: "Identity panel",
              status: "difference",
              note: "Source used iconSlot and titleSuffix props for identity panels. Current exposes visual, suffix, and actions as normal children.",
              source: (
                <LegacyPanelHeader
                  iconSlot={<Avatar size="md" type="agent" />}
                  iconAlwaysVisible
                  title="Atlas"
                  titleSuffix={<Status variant="success" />}
                  subtitle="claude-opus · online"
                  actions={<Badge.Experimental />}
                />
              ),
              current: <CurrentIdentityPanelHeader />,
              sourceCode: code.sourceIdentity,
              currentCode: code.currentIdentity,
            },
            {
              label: "Search title slot",
              status: "difference",
              note: "Source used titleSlot as a full replacement escape hatch. Current keeps the same freedom by composing arbitrary content inside PanelHeaderContent.",
              source: <LegacySearchPanelHeader />,
              current: <CurrentSearchPanelHeader />,
              sourceCode: code.sourceSearch,
              currentCode: code.currentSearch,
            },
          ]}
        />
      </DocSection>
    </DocPage>
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
        <Badge.Experimental />
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
    </div>
  );
}
