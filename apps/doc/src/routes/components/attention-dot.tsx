import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Status } from "@slock/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import LegacyAttentionDot from "../../../../../packages/ui/src/legacy/AttentionDot.tsx";

const TOC = [
  { id: "migration", title: "Migration" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `import { Status } from "@slock/ui";

<Status.Attention />`,
  sourceDefault: `<AttentionDot />`,
  currentDefault: `<Status.Attention />`,
  sourceCompact: `<AttentionDot size="sm" />`,
  currentCompact: `<Status.Attention size="sm" />`,
  sourceTone: `<AttentionDot tone="bg-brutal-orange" />`,
  currentTone: `<Status.Attention fill="orange" />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "AttentionDot",
    type: "legacy component",
    description:
      "Migrated to Status.Attention. Source backup remains in src/legacy/AttentionDot.tsx.",
  },
  {
    name: "Status.Attention",
    type: "attention indicator primitive",
    description: "Use for unread, pending, or needs-attention dots.",
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
      description="Migrated: use Status.Attention instead of the old AttentionDot component."
      overview={
        <Differences from="AttentionDot">
          <li>
            moved under <code>Status.Attention</code> so attention dots live in the Status family
          </li>
          <li>
            source visuals are preserved; <code>tone=&quot;bg-*&quot;</code> maps to{" "}
            <code>fill</code>
          </li>
          <li>
            kept separate from <code>Status</code> as a namespaced component instead of a variant
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="migration" title="Migration">
        <Callout>
          Replace <code>AttentionDot</code> with <code>Status.Attention</code>. Use the main{" "}
          <Link to="/components/status" hash="attention">
            Status docs
          </Link>{" "}
          for the full API and source comparison.
        </Callout>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="space-y-4">
          <CodeBlock html={code.anatomy} />
          <Example html={code.anatomy}>
            <Status.Attention />
            <Status.Attention size="sm" />
            <Status.Attention fill="orange" />
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
              note: "Visual output matches source. Current nests AttentionDot under Status.Attention.",
              source: <LegacyAttentionDot />,
              current: <Status.Attention />,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Compact",
              status: "difference",
              note: 'The 4px compact dot is preserved under Status.Attention size="sm".',
              source: <LegacyAttentionDot size="sm" />,
              current: <Status.Attention size="sm" />,
              sourceCode: code.sourceCompact,
              currentCode: code.currentCompact,
            },
            {
              label: "Explicit color",
              status: "difference",
              note: 'Visual output matches. Source tone="bg-brutal-orange" maps to current fill="orange".',
              source: <LegacyAttentionDot tone="bg-brutal-orange" />,
              current: <Status.Attention fill="orange" />,
              sourceCode: code.sourceTone,
              currentCode: code.currentTone,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
