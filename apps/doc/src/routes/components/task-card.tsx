import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import taskCardStateMatrixCompositionSource from "#/modules/task-card/compositions/task-card-state-matrix.composition.tsx?raw";
import taskStatusSelectCompositionSource from "#/modules/task-card/compositions/task-status-select.composition.tsx?raw";
import taskCardCompositionSource from "#/modules/task-card/compositions/task-card.composition.tsx?raw";
import { TaskCardStateGallery } from "#/modules/task-card/task-card-state-gallery.tsx";
import { TaskCardPlaygroundPreview } from "#/modules/task-card/task-card.preview.tsx";

const TASK_CARD_COMPOSITION_PATH =
  "apps/doc/src/modules/task-card/compositions/task-card.composition.tsx";
const TASK_STATUS_SELECT_COMPOSITION_PATH =
  "apps/doc/src/modules/task-card/compositions/task-status-select.composition.tsx";

const ANATOMY_SNIPPET = `import {
  TaskCard,
  TaskCardBody,
  TaskCardChannel,
  TaskCardDescription,
  TaskCardLegacy,
  TaskCardMeta,
  TaskCardNumber,
  TaskCardRow,
  TaskCardStatus,
  TaskCardTitle,
  TaskStatusIcon,
} from "raft-ui";

<TaskCard>
  <TaskCardRow>
    <TaskCardBody>
      <TaskCardMeta>
        <TaskCardChannel />
        <TaskCardStatus status="in-progress">
          <TaskStatusIcon status="in-progress" />
        </TaskCardStatus>
        <TaskCardNumber />
        <TaskCardLegacy />
      </TaskCardMeta>
      <TaskCardTitle />
      <TaskCardDescription />
    </TaskCardBody>
  </TaskCardRow>
</TaskCard>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "busy",
    type: "boolean",
    default: "false",
    description: "Marks the card as busy without owning task workflow policy.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Marks the card as disabled. Interaction policy stays consumer-owned.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"article">',
    description: "Card root. Consumers attach an optional open action with native article props.",
  },
];

const ROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Structural row around the flexible text body.",
  },
];

const BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Flexible column for meta, title, and description.",
  },
];

const META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Metadata row. Consumers render only the fields their context needs.",
  },
];

const CHANNEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional channel label in the metadata row.",
  },
];

const NUMBER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Task number or identifier in the metadata row.",
  },
];

const LEGACY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Optional legacy marker in the metadata row.",
  },
];

const TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"p">',
    description: "Task title supplied by the consumer.",
  },
];

const DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"p">',
    description: "Optional supporting description under the title.",
  },
];

const STATUS_PROPS: readonly PropRow[] = [
  {
    name: "status",
    type: '"todo" | "in-progress" | "in-review" | "done" | "closed"',
    description: "Task status that drives the trigger surface color and icon.",
  },
  {
    name: "busy",
    type: "boolean",
    default: "false",
    description: "Disables the status trigger while a change is pending.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Status trigger passed to TaskStatusSelect; its click does not open the card.",
  },
];

export const Route = createFileRoute("/components/task-card")({
  component: TaskCardDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SNIPPET,
        card: taskCardCompositionSource,
        statusSelect: taskStatusSelectCompositionSource,
        states: taskCardStateMatrixCompositionSource,
      },
    }),
});

function TaskCardDoc() {
  const code = Route.useLoaderData();
  const cardFiles = useMemo(
    () => [
      {
        path: TASK_CARD_COMPOSITION_PATH,
        source: taskCardCompositionSource,
        html: code.card,
        collapsedHtml: code.cardBody,
      },
      {
        path: TASK_STATUS_SELECT_COMPOSITION_PATH,
        source: taskStatusSelectCompositionSource,
        html: code.statusSelect,
        collapsedHtml: code.statusSelectBody,
      },
    ],
    [code],
  );

  return (
    <DocPage
      title="TaskCard"
      description="Business-agnostic task-card parts for composing metadata, content, and status actions."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <TaskCardPlaygroundPreview
          code={code.card}
          collapsedCode={code.cardBody}
          codeBlock={<DocsCodeBlock.Files collapsible={false} files={cardFiles} />}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="states" title="States">
          <Preview previewClassName="items-stretch">
            <Preview.Canvas>
              <TaskCardStateGallery />
            </Preview.Canvas>
            <Preview.Code html={code.states} collapsedHtml={code.statesBody} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="TaskCard">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-row" title="TaskCardRow">
            <PropsTable rows={ROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-body" title="TaskCardBody">
            <PropsTable rows={BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-meta" title="TaskCardMeta">
            <PropsTable rows={META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-channel" title="TaskCardChannel">
            <PropsTable rows={CHANNEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-number" title="TaskCardNumber">
            <PropsTable rows={NUMBER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-legacy" title="TaskCardLegacy">
            <PropsTable rows={LEGACY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-title" title="TaskCardTitle">
            <PropsTable rows={TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-description" title="TaskCardDescription">
            <PropsTable rows={DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-status" title="TaskCardStatus">
            <PropsTable rows={STATUS_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
