import { createFileRoute } from "@tanstack/react-router";
import { Status } from "cuvii-rui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyAttentionDot from "../../../../../packages/ui/src/legacy/AttentionDot.tsx";

const TOC = [
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  migration: `// Source
<AttentionDot />
<AttentionDot size="sm" />
<AttentionDot tone="bg-brutal-orange" />

// Current
<Status variant="accent" />
<Status variant="accent" size="xs" />
<Status variant="warning" />`,
  anatomy: `import { Status } from "cuvii-rui";

<Status variant="accent" />`,
  sourceDefault: `<AttentionDot />`,
  currentDefault: `<Status variant="accent" />`,
  sourceCompact: `<AttentionDot size="sm" />`,
  currentCompact: `<Status variant="accent" size="xs" />`,
  sourceTone: `<AttentionDot tone="bg-brutal-orange" />`,
  currentTone: `<Status variant="warning" />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "AttentionDot",
    type: "legacy component",
    description: "Migrated to Status.",
  },
  {
    name: "Status",
    type: "status indicator primitive",
    description: 'Use variant="accent".',
  },
];

export const Route = createFileRoute("/components/attention-dot")({
  component: AttentionDotMigrationDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function AttentionDotMigrationDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="AttentionDot"
      description="Migrated: use Status instead of the old AttentionDot component."
      toc={TOC}
    >
      <DocSection id="anatomy" title="Anatomy">
        <div className="space-y-4">
          <DocsCodeBlock.Panel
            path="AttentionDot.tsx"
            source={SNIPPETS.anatomy}
            html={code.anatomy}
            collapsedHtml={code.anatomyBody}
          />
          <Example html={code.anatomy}>
            <Status variant="accent" />
            <Status variant="accent" size="xs" />
            <Status variant="warning" />
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
              label: "Default",
              status: "difference",
              note: 'AttentionDot -> Status variant="accent".',
              source: <LegacyAttentionDot />,
              current: <Status variant="accent" />,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Compact",
              status: "difference",
              note: 'AttentionDot size="sm" -> Status size="xs".',
              source: <LegacyAttentionDot size="sm" />,
              current: <Status variant="accent" size="xs" />,
              sourceCode: code.sourceCompact,
              currentCode: code.currentCompact,
            },
            {
              label: "Explicit color",
              status: "difference",
              note: 'tone="bg-brutal-orange" -> variant="warning".',
              source: <LegacyAttentionDot tone="bg-brutal-orange" />,
              current: <Status variant="warning" />,
              sourceCode: code.sourceTone,
              currentCode: code.currentTone,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
