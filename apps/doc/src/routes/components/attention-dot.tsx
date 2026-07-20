import { createFileRoute } from "@tanstack/react-router";
import { Status } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import {
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import compactCompositionSource from "#/modules/attention-dot/compositions/compact.composition.tsx?raw";
import { AttentionDotCompactComposition } from "#/modules/attention-dot/compositions/compact.composition.tsx";
import defaultCompositionSource from "#/modules/attention-dot/compositions/default.composition.tsx?raw";
import { AttentionDotDefaultComposition } from "#/modules/attention-dot/compositions/default.composition.tsx";
import explicitColorCompositionSource from "#/modules/attention-dot/compositions/explicit-color.composition.tsx?raw";
import { AttentionDotExplicitColorComposition } from "#/modules/attention-dot/compositions/explicit-color.composition.tsx";
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
  preview: `import { Status } from "raft-ui";

<Status variant="accent" />`,
  anatomy: `<Status />`,
  sourceDefault: `<AttentionDot />`,
  sourceCompact: `<AttentionDot size="sm" />`,
  sourceTone: `<AttentionDot tone="bg-brutal-orange" />`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Compact: compactCompositionSource,
  Default: defaultCompositionSource,
  ExplicitColor: explicitColorCompositionSource,
});

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(COMPOSITION_SOURCES, {
  Compact: "attentionDotCompactComposition",
  Default: "attentionDotDefaultComposition",
  ExplicitColor: "attentionDotExplicitColorComposition",
});

const COMPOSITION_PATHS = {
  Compact: "apps/doc/src/modules/attention-dot/compositions/compact.composition.tsx",
  Default: "apps/doc/src/modules/attention-dot/compositions/default.composition.tsx",
  ExplicitColor: "apps/doc/src/modules/attention-dot/compositions/explicit-color.composition.tsx",
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
  loader: () => highlightSnippets({ data: { ...SNIPPETS, ...COMPOSITION_SNIPPETS } }),
});

function AttentionDotMigrationDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="AttentionDot"
      description="Migrated: use Status instead of the old AttentionDot component."
      toc={TOC}
    >
      <DocSection id="anatomy" title="Anatomy" showThemeSwitcher>
        <div className="space-y-4">
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content html={code.anatomy} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
          <Preview>
            <Preview.Canvas>
              <Status variant="accent" />
              <Status variant="accent" size="xs" />
              <Status variant="warning" />
            </Preview.Canvas>
            <Preview.Code html={code.preview} />
          </Preview>
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
              current: <AttentionDotDefaultComposition />,
              sourceCode: code.sourceDefault,
              currentCode: code.attentionDotDefaultComposition,
              compositionCode: code.attentionDotDefaultComposition,
              compositionPath: COMPOSITION_PATHS.Default,
              compositionSource: COMPOSITION_SOURCES.Default,
            },
            {
              label: "Compact",
              status: "difference",
              note: 'AttentionDot size="sm" -> Status size="xs".',
              source: <LegacyAttentionDot size="sm" />,
              current: <AttentionDotCompactComposition />,
              sourceCode: code.sourceCompact,
              currentCode: code.attentionDotCompactComposition,
              compositionCode: code.attentionDotCompactComposition,
              compositionPath: COMPOSITION_PATHS.Compact,
              compositionSource: COMPOSITION_SOURCES.Compact,
            },
            {
              label: "Explicit color",
              status: "difference",
              note: 'tone="bg-brutal-orange" -> variant="warning".',
              source: <LegacyAttentionDot tone="bg-brutal-orange" />,
              current: <AttentionDotExplicitColorComposition />,
              sourceCode: code.sourceTone,
              currentCode: code.attentionDotExplicitColorComposition,
              compositionCode: code.attentionDotExplicitColorComposition,
              compositionPath: COMPOSITION_PATHS.ExplicitColor,
              compositionSource: COMPOSITION_SOURCES.ExplicitColor,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
