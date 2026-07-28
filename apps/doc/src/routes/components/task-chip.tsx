import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { TaskChipInFooterComposition } from "#/modules/task-chip/compositions/task-chip-in-footer.composition.tsx";
import taskChipInFooterSource from "#/modules/task-chip/compositions/task-chip-in-footer.composition.tsx?raw";
import { TaskChipInMarkdownComposition } from "#/modules/task-chip/compositions/task-chip-in-markdown.composition.tsx";
import taskChipInMarkdownSource from "#/modules/task-chip/compositions/task-chip-in-markdown.composition.tsx?raw";
import { TaskChipStatusesComposition } from "#/modules/task-chip/compositions/task-chip-statuses.composition.tsx";
import taskChipStatusesSource from "#/modules/task-chip/compositions/task-chip-statuses.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `<TaskChip status="in_progress" render={<a href="…" />}>
  #205
</TaskChip>`;

const PROPS: readonly PropRow[] = [
  {
    name: "status",
    type: '"todo" | "in_progress" | "in_review" | "done" | "closed"',
    description: "Resolved task status. Selects the status icon and the chip surface.",
  },
  {
    name: "loading",
    type: "boolean",
    description: "Dims the chip and drops pointer events while the consumer resolves the task.",
  },
  {
    name: "render",
    type: "useRender.RenderProp",
    description:
      "Element substitution. Pass an anchor when the consumer owns navigation; the chip renders a span otherwise.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Native span attributes, plus ref and className.",
  },
];

const TASK_CHIP_IN_MARKDOWN_PATH =
  "apps/doc/src/modules/task-chip/compositions/task-chip-in-markdown.composition.tsx";
const TASK_CHIP_IN_FOOTER_PATH =
  "apps/doc/src/modules/task-chip/compositions/task-chip-in-footer.composition.tsx";

/** The chip inside message markdown, and the same chip as a footer badge. */
function TaskChipPreviewFiles({ code }: { code: Record<string, string> }) {
  return (
    <DocsCodeBlock.Files
      collapsible={false}
      showLineNumbers={false}
      files={[
        {
          path: TASK_CHIP_IN_MARKDOWN_PATH,
          source: taskChipInMarkdownSource,
          html: code.taskChipInMarkdown,
          collapsedHtml: code.taskChipInMarkdownBody,
        },
        {
          path: TASK_CHIP_IN_FOOTER_PATH,
          source: taskChipInFooterSource,
          html: code.taskChipInFooter,
          collapsedHtml: code.taskChipInFooterBody,
        },
      ]}
    />
  );
}

export const Route = createFileRoute("/components/task-chip")({
  component: TaskChipDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SOURCE,
        taskChipInMarkdown: taskChipInMarkdownSource,
        taskChipInFooter: taskChipInFooterSource,
        taskChipStatuses: taskChipStatusesSource,
      },
    }),
});

function TaskChipDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TaskChip"
      description="An inline chip for a resolved task, carrying its status icon and status surface."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch">
          <Preview.Canvas>
            <div className="flex w-full max-w-3xl flex-col gap-3">
              <TaskChipInMarkdownComposition />
              <TaskChipInFooterComposition />
            </div>
          </Preview.Canvas>
          <Preview.Code codeBlock={<TaskChipPreviewFiles code={code} />} />
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
        <p className="mb-3 text-sm text-foreground-muted">
          <InlineCode>status</InlineCode> controls the status icon and the chip surface. Task state
          stays consumer-owned: the chip renders what it is given and never resolves a task itself.
        </p>
        <Preview>
          <Preview.Canvas>
            <TaskChipStatusesComposition />
          </Preview.Canvas>
          <Preview.Code html={code.taskChipStatuses} collapsedHtml={code.taskChipStatusesBody} />
        </Preview>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
