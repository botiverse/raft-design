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

<Status variant="success" />`,
  anatomy: `import { Status } from "raft-ui";

<Status />`,
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
    </DocPage>
  );
}
