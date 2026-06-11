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
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacyStatusDot from "../../../../../packages/ui/src/legacy/StatusDot.tsx";

const TOC = [
  { id: "migration", title: "Migration" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `import { Status } from "@slock/ui";

<Status fill="lime" />`,
  sourceDefault: `<StatusDot tone="bg-brutal-lime" />`,
  currentDefault: `<Status fill="lime" />`,
  sourcePulse: `<StatusDot tone="bg-brutal-yellow" pulse />`,
  currentPulse: `<Status fill="yellow" pulse />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "StatusDot",
    type: "legacy component",
    description: "Migrated to Status. Source backup remains in src/legacy/StatusDot.tsx.",
  },
  {
    name: "Status",
    type: "status indicator primitive",
    description: "Use for presence/activity dots. Map app activity to fill/pulse at the callsite.",
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
      overview={
        <Differences from="StatusDot">
          <li>
            renamed to <code>Status</code> so attention dots can live in the same component family
          </li>
          <li>
            source visuals are preserved; <code>tone=&quot;bg-*&quot;</code> maps to{" "}
            <code>fill</code>
          </li>
          <li>
            source <code>activity</code> was app-domain logic and should be mapped at the callsite
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="migration" title="Migration">
        <Callout>
          Replace <code>StatusDot</code> with <code>Status</code>. Use the main{" "}
          <Link to="/components/status">Status docs</Link> for the full API and source comparison.
        </Callout>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="space-y-4">
          <CodeBlock html={code.anatomy} />
          <Example html={code.anatomy}>
            <Status fill="lime" />
            <Status fill="yellow" pulse />
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
              note: 'Visual output matches. Source tone="bg-brutal-lime" maps to current fill="lime".',
              source: <LegacyStatusDot tone="bg-brutal-lime" />,
              current: <Status fill="lime" />,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Pulse",
              status: "difference",
              note: "Pulse behavior matches. Current uses fill instead of source tone strings.",
              source: <LegacyStatusDot tone="bg-brutal-yellow" pulse />,
              current: <Status fill="yellow" pulse />,
              sourceCode: code.sourcePulse,
              currentCode: code.currentPulse,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
