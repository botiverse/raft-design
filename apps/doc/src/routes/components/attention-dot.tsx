import { createFileRoute } from "@tanstack/react-router";
import { Status } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  preview: `import { Status } from "raft-ui";

<Status variant="accent" />`,
  anatomy: `import { Status } from "raft-ui";

<Status />`,
} as const;

const ATTENTION_DOT_PROPS: readonly PropRow[] = [
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
    default: '"accent" for AttentionDot replacements',
    description: 'Use variant="accent" for the former AttentionDot default.',
  },
  {
    name: "size",
    type: '"xs" | "sm" | "md"',
    description: 'Use size="xs" for the former AttentionDot size="sm".',
  },
  {
    name: "...props",
    type: "Status props",
    description: "See the Status docs for pulse, attention, render, and span attributes.",
  },
];

export const Route = createFileRoute("/components/attention-dot")({
  component: AttentionDotMigrationDoc,
  loader: () => highlightSnippets({ data: { ...SNIPPETS } }),
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
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-attention-dot" title="AttentionDot">
            <PropsTable rows={ATTENTION_DOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-status" title="Status">
            <PropsTable rows={STATUS_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
