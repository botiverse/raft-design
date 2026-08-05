import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
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
import { TaskChipVariantsComposition } from "#/modules/task-chip/compositions/task-chip-variants.composition.tsx";
import taskChipVariantsSource from "#/modules/task-chip/compositions/task-chip-variants.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ANATOMY_SOURCE = `import { TaskChip, TaskInProgressIcon, TaskInReviewIcon } from "raft-ui";

<TaskChip status="in-progress" render={<a href="…" />}>
  <TaskInProgressIcon />
  #205
</TaskChip>

<TaskChip variant="inline" status="in-review" render={<a href="…" />}>
  <TaskInReviewIcon />
  #340
</TaskChip>

<TaskChip variant="inline" status="in-review" loading>
  <TaskInReviewIcon />
  #340
</TaskChip>`;

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"default" | "inline"',
    default: '"default"',
    description:
      "Inline uses a neutral, borderless inline surface with a 2px leading icon inset; task status continues to color only the icon.",
  },
  {
    name: "status",
    type: '"todo" | "in-progress" | "in-review" | "done" | "closed"',
    description:
      "Resolved task status. Selects the chip surface; the caller renders the matching icon.",
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
        taskChipVariants: taskChipVariantsSource,
      },
    }),
});

function TaskChipDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TaskChip"
      description="An inline chip whose caller supplies the task-status icon as content."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch">
          <Preview.Canvas>
            <div className="flex w-full max-w-3xl self-stretch flex-col justify-center gap-3">
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
        <DocSubsection parentId="usage" id="variants" title="Variants">
          <p className="mb-3 text-sm text-foreground-muted">
            <InlineCode>default</InlineCode> shows the full task-status surface. Use{" "}
            <InlineCode>inline</InlineCode> inside dense message copy when the task icon should
            carry the status and the reference stays visually quiet.
          </p>
          <Preview>
            <Preview.Canvas>
              <TaskChipVariantsComposition />
            </Preview.Canvas>
            <Preview.Code html={code.taskChipVariants} collapsedHtml={code.taskChipVariantsBody} />
          </Preview>
        </DocSubsection>
        <DocSubsection parentId="usage" id="states" title="Statuses and loading">
          <p className="mb-3 text-sm text-foreground-muted">
            <InlineCode>status</InlineCode> controls the chip surface. Pass a named task-status icon
            for a known status, or <InlineCode>TaskStatusIcon</InlineCode> when status comes from
            consumer-owned data. <InlineCode>loading</InlineCode> dims the chip and drops pointer
            events while the consumer resolves the task.
          </p>
          <Preview>
            <Preview.Canvas>
              <TaskChipStatusesComposition />
            </Preview.Canvas>
            <Preview.Code html={code.taskChipStatuses} collapsedHtml={code.taskChipStatusesBody} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
