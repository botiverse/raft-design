import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "raft-ui";
import { Inbox, Plus, Search, Upload } from "lucide-react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  preview: `<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon>
      <Inbox />
    </EmptyStateIcon>
    <EmptyStateTitle>No messages yet</EmptyStateTitle>
    <EmptyStateDescription>
      Conversations you start will show up here.
    </EmptyStateDescription>
  </EmptyStateContent>
</EmptyState>`,
  anatomy: `import {
  EmptyState,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "raft-ui";

<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon />
    <EmptyStateTitle />
  </EmptyStateContent>
</EmptyState>`,
  copy: `<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon>
      <Search />
    </EmptyStateIcon>
    <EmptyStateTitle>No results for "linear sync"</EmptyStateTitle>
    <EmptyStateDescription>
      Try a different keyword or check the selected filters.
    </EmptyStateDescription>
  </EmptyStateContent>
</EmptyState>

<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon>
      <Inbox />
    </EmptyStateIcon>
    <EmptyStateTitle>No messages yet</EmptyStateTitle>
    <EmptyStateDescription>
      Conversations you start will show up here.
    </EmptyStateDescription>
  </EmptyStateContent>
</EmptyState>`,
  actions: `<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon>
      <Inbox />
    </EmptyStateIcon>
    <EmptyStateTitle>No channels yet</EmptyStateTitle>
    <EmptyStateDescription>
      Create your first channel to start organizing work.
    </EmptyStateDescription>
  </EmptyStateContent>
  <EmptyStateActions className="flex flex-wrap justify-center gap-2">
    <Button variant="primary" size="sm">
      <Plus data-icon="inline-start" />
      New channel
    </Button>
    <Button variant="outline" size="sm">Import</Button>
  </EmptyStateActions>
</EmptyState>`,
  customize: `import { Button, EmptyState, EmptyStateContent, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from "raft-ui";
import { Upload } from "lucide-react";

<EmptyState className="min-h-72">
  <EmptyStateContent>
    <EmptyStateIcon>
      <Upload />
    </EmptyStateIcon>
    <EmptyStateTitle>Drop files to import customers</EmptyStateTitle>
    <EmptyStateDescription>
      CSV and TSV files can be mapped before anything is saved.
    </EmptyStateDescription>
  </EmptyStateContent>
  <div className="mt-5 flex flex-col items-center gap-2">
    <Button variant="primary" size="sm">Choose file</Button>
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
      <Button variant="link" size="sm">Download template</Button>
      <span aria-hidden>·</span>
      <Button variant="link" size="sm">View import guide</Button>
    </div>
  </div>
</EmptyState>`,
  composition: `<EmptyState render={<section aria-labelledby="empty-state-title" />}>
  <EmptyStateContent>
    <EmptyStateIcon aria-hidden>
      <Inbox />
    </EmptyStateIcon>
    <EmptyStateTitle render={<h2 id="empty-state-title" />}>
      No notifications right now
    </EmptyStateTitle>
    <EmptyStateDescription>
      New mentions, assignments, and approvals will appear here.
    </EmptyStateDescription>
  </EmptyStateContent>
</EmptyState>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Change the root element, for example to section with an aria-labelledby hook.",
  },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes plus className.",
  },
];

const EMPTY_STATE_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description:
      "Recommended wrapper for icon, title, and description. Keeps copy centered, bounded, and balanced.",
  },
];

const EMPTY_STATE_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description:
      "Muted icon slot. The slot owns default SVG sizing per theme; override with className for custom media.",
  },
];

const EMPTY_STATE_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Muted sentence-case title. Use render to promote it to a real heading.",
  },
];

const EMPTY_STATE_DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Optional supporting copy with a readable measure.",
  },
];

const EMPTY_STATE_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description:
      "Optional action row. Add flex and gap classes when rendering more than one action.",
  },
];

export const Route = createFileRoute("/components/empty-state")({
  component: EmptyStateDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
      },
    }),
});

function EmptyStateDoc() {
  const code = Route.useLoaderData();
  return (
    <DocPage
      title="EmptyState"
      description="A quiet feedback surface for empty collections, filtered results, and first-run states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <EmptyState>
              <EmptyStateContent>
                <EmptyStateIcon>
                  <Inbox />
                </EmptyStateIcon>
                <EmptyStateTitle>No messages yet</EmptyStateTitle>
                <EmptyStateDescription>
                  Conversations you start will show up here.
                </EmptyStateDescription>
              </EmptyStateContent>
            </EmptyState>
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="copy" title="Copy">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <div className="grid w-full gap-4 md:grid-cols-2">
                  <EmptyState className="min-h-56">
                    <EmptyStateContent>
                      <EmptyStateIcon>
                        <Search />
                      </EmptyStateIcon>
                      <EmptyStateTitle>No results for "linear sync"</EmptyStateTitle>
                      <EmptyStateDescription>
                        Try a different keyword or check the selected filters.
                      </EmptyStateDescription>
                    </EmptyStateContent>
                  </EmptyState>
                  <EmptyState className="min-h-56">
                    <EmptyStateContent>
                      <EmptyStateIcon>
                        <Inbox />
                      </EmptyStateIcon>
                      <EmptyStateTitle>No messages yet</EmptyStateTitle>
                      <EmptyStateDescription>
                        Conversations you start will show up here.
                      </EmptyStateDescription>
                    </EmptyStateContent>
                  </EmptyState>
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.copy} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="actions" title="Actions">
            <Preview>
              <Preview.Canvas>
                <EmptyState>
                  <EmptyStateContent>
                    <EmptyStateIcon>
                      <Inbox />
                    </EmptyStateIcon>
                    <EmptyStateTitle>No channels yet</EmptyStateTitle>
                    <EmptyStateDescription>
                      Create your first channel to start organizing work.
                    </EmptyStateDescription>
                  </EmptyStateContent>
                  <EmptyStateActions className="flex flex-wrap justify-center gap-2">
                    <Button variant="primary" size="sm">
                      <Plus data-icon="inline-start" />
                      New channel
                    </Button>
                    <Button variant="outline" size="sm">
                      Import
                    </Button>
                  </EmptyStateActions>
                </EmptyState>
              </Preview.Canvas>
              <Preview.Code html={code.actions} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="customize" title="Customize">
            <Preview>
              <Preview.Canvas>
                <EmptyState className="min-h-72">
                  <EmptyStateContent>
                    <EmptyStateIcon>
                      <Upload />
                    </EmptyStateIcon>
                    <EmptyStateTitle>Drop files to import customers</EmptyStateTitle>
                    <EmptyStateDescription>
                      CSV and TSV files can be mapped before anything is saved.
                    </EmptyStateDescription>
                  </EmptyStateContent>
                  <div className="mt-5 flex flex-col items-center gap-2">
                    <Button variant="primary" size="sm">
                      Choose file
                    </Button>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
                      <Button variant="link" size="sm">
                        Download template
                      </Button>
                      <span aria-hidden>·</span>
                      <Button variant="link" size="sm">
                        View import guide
                      </Button>
                    </div>
                  </div>
                </EmptyState>
              </Preview.Canvas>
              <Preview.Code html={code.customize} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="composition" title="Composition">
            <Preview>
              <Preview.Canvas>
                <EmptyState render={<section aria-labelledby="empty-state-title" />}>
                  <EmptyStateContent>
                    <EmptyStateIcon aria-hidden>
                      <Inbox />
                    </EmptyStateIcon>
                    <EmptyStateTitle render={<h2 id="empty-state-title" />}>
                      No notifications right now
                    </EmptyStateTitle>
                    <EmptyStateDescription>
                      New mentions, assignments, and approvals will appear here.
                    </EmptyStateDescription>
                  </EmptyStateContent>
                </EmptyState>
              </Preview.Canvas>
              <Preview.Code html={code.composition} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-empty-state" title="EmptyState">
            <PropsTable rows={PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-empty-state-content" title="EmptyStateContent">
            <PropsTable rows={EMPTY_STATE_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-empty-state-icon" title="EmptyStateIcon">
            <PropsTable rows={EMPTY_STATE_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-empty-state-title" title="EmptyStateTitle">
            <PropsTable rows={EMPTY_STATE_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-empty-state-description"
            title="EmptyStateDescription"
          >
            <PropsTable rows={EMPTY_STATE_DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-empty-state-actions" title="EmptyStateActions">
            <PropsTable rows={EMPTY_STATE_ACTIONS_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
