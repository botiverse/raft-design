import { createFileRoute } from "@tanstack/react-router";
import { CheckIndicator } from "@slock-ui/ui";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import LegacyCheckMarker from "../../../../../packages/ui/src/legacy/CheckMarker.tsx";

const TOC = [
  { id: "migration", title: "Migration" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `import { CheckIndicator } from "@slock-ui/ui";

<CheckIndicator checked />`,
  sourceDefault: `<CheckMarker checked />`,
  currentDefault: `<CheckIndicator checked />`,
  sourceSelection: `<CheckMarker checked shape="circle" size="lg" tone="yellow-fill" />`,
  currentSelection: `<CheckIndicator checked shape="circle" size="lg" fill="yellow" />`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "CheckMarker",
    type: "legacy component",
    description: "Migrated to CheckIndicator. Source backup remains in src/legacy/CheckMarker.tsx.",
  },
  {
    name: "CheckIndicator",
    type: "decorative indicator primitive",
    description: "Use for Checkbox internals and selection-row visuals.",
  },
];

export const Route = createFileRoute("/components/check-marker")({
  component: CheckMarkerMigrationDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function CheckMarkerMigrationDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="CheckMarker"
      description="Migrated: use CheckIndicator instead of the old CheckMarker component."
      overview={
        <Differences from="CheckMarker">
          <li>
            renamed to <code>CheckIndicator</code> to align with Base UI / shadcn indicator anatomy
          </li>
          <li>
            source visuals are preserved; only the public component name and Checkbox composition
            changed
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="migration" title="Migration">
        <Callout>
          Replace <code>CheckMarker</code> with <code>CheckIndicator</code>. It is still decorative
          and <code>aria-hidden</code>; place interaction on <code>Checkbox</code> or the containing
          row button.
        </Callout>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <div className="space-y-4">
          <CodeBlock html={code.anatomy} />
          <Example html={code.anatomy}>
            <CheckIndicator checked />
            <CheckIndicator checked shape="circle" size="lg" fill="yellow" />
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
              note: "Visual output matches source. Current renames the component to CheckIndicator.",
              source: <LegacyCheckMarker checked />,
              current: <CheckIndicator checked />,
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Selection marker",
              status: "difference",
              note: 'The row-selection circle remains the same visual primitive under the new name. Source tone="yellow-fill" maps to current fill="yellow".',
              source: <LegacyCheckMarker checked shape="circle" size="lg" tone="yellow-fill" />,
              current: <CheckIndicator checked shape="circle" size="lg" fill="yellow" />,
              sourceCode: code.sourceSelection,
              currentCode: code.currentSelection,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
