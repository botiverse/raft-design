import { createFileRoute } from "@tanstack/react-router";
import { Status } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import {
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import explicitColorCompositionSource from "#/modules/status-dot/compositions/explicit-color.composition.tsx?raw";
import { StatusDotExplicitColorComposition } from "#/modules/status-dot/compositions/explicit-color.composition.tsx";
import pulseCompositionSource from "#/modules/status-dot/compositions/pulse.composition.tsx?raw";
import { StatusDotPulseComposition } from "#/modules/status-dot/compositions/pulse.composition.tsx";
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
  anatomy: `import { Status } from "raft-ui";

<Status />`,
  sourceDefault: `<StatusDot tone="bg-brutal-lime" />`,
  sourcePulse: `<StatusDot tone="bg-brutal-yellow" pulse />`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  ExplicitColor: explicitColorCompositionSource,
  Pulse: pulseCompositionSource,
});

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(COMPOSITION_SOURCES, {
  ExplicitColor: "statusDotExplicitColorComposition",
  Pulse: "statusDotPulseComposition",
});

const COMPOSITION_PATHS = {
  ExplicitColor: "apps/doc/src/modules/status-dot/compositions/explicit-color.composition.tsx",
  Pulse: "apps/doc/src/modules/status-dot/compositions/pulse.composition.tsx",
} as const;

const STATUS_DOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "legacy component",
    description: "Removed. Migrate to Status.",
  },
];

const STATUS_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: "Status variant",
    description: "Map former StatusDot tone values to semantic Status variants.",
  },
  {
    name: "pulse",
    type: "boolean",
    default: "false",
    description: "Animated status marker. Replaces StatusDot pulse.",
  },
  {
    name: "...props",
    type: "Status props",
    description: "See the Status docs for size, attention, render, and span attributes.",
  },
];

export const Route = createFileRoute("/components/status-dot")({
  component: StatusDotMigrationDoc,
  loader: () => highlightSnippets({ data: { ...SNIPPETS, ...COMPOSITION_SNIPPETS } }),
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
          <Preview>
            <Preview.Canvas>
              <Status variant="success" />
              <Status variant="primary" pulse />
            </Preview.Canvas>
            <Preview.Code html={code.preview} />
          </Preview>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-status-dot" title="StatusDot">
            <PropsTable rows={STATUS_DOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-status" title="Status">
            <PropsTable rows={STATUS_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Explicit color",
              status: "difference",
              note: 'tone="bg-brutal-lime" -> variant="success".',
              source: <LegacyStatusDot tone="bg-brutal-lime" />,
              current: <StatusDotExplicitColorComposition />,
              sourceCode: code.sourceDefault,
              currentCode: code.statusDotExplicitColorComposition,
              compositionCode: code.statusDotExplicitColorComposition,
              compositionPath: COMPOSITION_PATHS.ExplicitColor,
              compositionSource: COMPOSITION_SOURCES.ExplicitColor,
            },
            {
              label: "Pulse",
              status: "difference",
              note: 'tone="bg-brutal-yellow" pulse -> variant="primary" pulse.',
              source: <LegacyStatusDot tone="bg-brutal-yellow" pulse />,
              current: <StatusDotPulseComposition />,
              sourceCode: code.sourcePulse,
              currentCode: code.statusDotPulseComposition,
              compositionCode: code.statusDotPulseComposition,
              compositionPath: COMPOSITION_PATHS.Pulse,
              compositionSource: COMPOSITION_SOURCES.Pulse,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
