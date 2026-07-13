import { createFileRoute } from "@tanstack/react-router";
import { Status } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyStatusDot from "../../../../../packages/ui/src/legacy/StatusDot.tsx";

const TOC = [
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  migration: `// Source
<StatusDot tone="bg-brutal-lime" />
<StatusDot tone="bg-brutal-yellow" pulse />

// Current
<Status variant="success" />
<Status variant="primary" pulse />`,
  preview: `import { Status } from "raft-ui";

<Status variant="success" />`,
  anatomy: `<Status />`,
  sourceDefault: `<StatusDot tone="bg-brutal-lime" />`,
  currentDefault: `<Status variant="success" />`,
  sourcePulse: `<StatusDot tone="bg-brutal-yellow" pulse />`,
  currentPulse: `<Status variant="primary" pulse />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "StatusDot",
    type: "legacy component",
    description: "Migrated to Status.",
  },
  {
    name: "Status",
    type: "status indicator primitive",
    description: "Use variant and pulse.",
  },
];

export const Route = createFileRoute("/components/status-dot")({
  component: StatusDotMigrationDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function StatusDotMigrationDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="StatusDot"
      description="Migrated: use Status instead of the old StatusDot component."
      toc={TOC}
    >
      <DocSection id="anatomy" title="Anatomy" showThemeSwitcher>
        <div className="space-y-4">
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.anatomy} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
          <Example html={code.preview}>
            <Status variant="success" />
            <Status variant="primary" pulse />
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
              label: "Explicit color",
              status: "difference",
              note: 'tone="bg-brutal-lime" -> variant="success".',
              source: <LegacyStatusDot tone="bg-brutal-lime" />,
              current: <Status variant="success" />,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
              compositionCode: code.currentDefault,
              compositionPath:
                "apps/doc/src/compositions/status-dot/explicit-color-composition.tsx",
              compositionSource: SNIPPETS.currentDefault,
            },
            {
              label: "Pulse",
              status: "difference",
              note: 'tone="bg-brutal-yellow" pulse -> variant="primary" pulse.',
              source: <LegacyStatusDot tone="bg-brutal-yellow" pulse />,
              current: <Status variant="primary" pulse />,
              sourceCode: code.sourcePulse,
              currentCode: code.currentPulse,
              compositionCode: code.currentPulse,
              compositionPath: "apps/doc/src/compositions/status-dot/pulse-composition.tsx",
              compositionSource: SNIPPETS.currentPulse,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
