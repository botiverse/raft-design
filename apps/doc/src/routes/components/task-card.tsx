import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { TaskCardComparisonComposition } from "#/modules/task-card/compositions/task-card-comparison.composition.tsx";
import taskCardComparisonCompositionSource from "#/modules/task-card/compositions/task-card-comparison.composition.tsx?raw";
import { TaskCardStateMatrixComposition } from "#/modules/task-card/compositions/task-card-state-matrix.composition.tsx";
import taskCardStateMatrixCompositionSource from "#/modules/task-card/compositions/task-card-state-matrix.composition.tsx?raw";
import { TaskCardSourceComparisonComposition } from "#/modules/task-card/task-card.source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import sourceTaskCard from "../../../../../packages/ui/source/tasks/TaskCard.tsx?raw";

const ANATOMY_SNIPPET = `<TaskCard>
  <TaskCardOpen>
    <TaskCardRow>
      <TaskCardBody>
        <TaskCardMeta>
          <TaskCardChannel />
          <TaskCardNumber />
          <TaskCardLegacy />
        </TaskCardMeta>
        <TaskCardTitle />
        <TaskCardDescription />
      </TaskCardBody>
    </TaskCardRow>
  </TaskCardOpen>
  <TaskCardFooter>
    <TaskCardStatus>
      <TaskCardStatusTrigger />
    </TaskCardStatus>
  </TaskCardFooter>
</TaskCard>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Task card source",
    scenes: [
      {
        label: "TaskCard.tsx",
        path: "packages/ui/source/tasks/TaskCard.tsx",
      },
    ],
  },
] as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "TaskCard",
    type: 'SlotProps<"article"> & { busy?: boolean; disabled?: boolean }',
    description:
      "Card root. Exposes busy and disabled state without owning task data or workflow policy.",
  },
];

const OPEN_ROW_PROPS: readonly PropRow[] = [
  {
    name: "TaskCardOpen",
    type: 'SlotProps<"button">',
    description: "Primary card action. The consumer decides what opening a task does.",
  },
  {
    name: "TaskCardRow / Body",
    type: 'SlotProps<"div">',
    description: "Structural parts for the card content row and its flexible text body.",
  },
];

const META_PROPS: readonly PropRow[] = [
  {
    name: "TaskCardMeta / Channel / Number / Legacy",
    type: "div and span slot props",
    description: "Explicit metadata parts; consumers render only the fields their context needs.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "TaskCardTitle / Description",
    type: 'SlotProps<"p">',
    description: "Task-owned visible content supplied by the consumer.",
  },
];

const FOOTER_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "TaskCardFooter / Status",
    type: "footer and div slot props",
    description: "Footer boundary and status-control container. Status accepts a busy state.",
  },
  {
    name: "TaskCardStatusTrigger",
    type: 'SlotProps<"button"> & { tone: TaskStatusTone; busy?: boolean }',
    description:
      "Status trigger styling and state. Compose it with the menu primitive that owns selection behavior.",
  },
];

export const Route = createFileRoute("/components/task-card")({
  component: TaskCardDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SNIPPET,
        comparison: taskCardComparisonCompositionSource,
        sourceCard: sourceTaskCard,
        states: taskCardStateMatrixCompositionSource,
      },
    }),
});

function TaskCardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TaskCard"
      description="Business-agnostic task-card parts for composing metadata, content, and status actions."
      overview={
        <Differences from="Slock TaskCard">
          <li>keeps stores, permissions, routing, and status-transition policy in the consumer</li>
          <li>
            exposes metadata and content as explicit compound parts instead of task-shaped props
          </li>
          <li>composes status selection with the existing DropdownMenu behavior</li>
          <li>covers long content, legacy, disabled, busy, and open-menu states</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Preview previewTheme="brutal" previewMode="light">
          <Preview.Canvas>
            <TaskCardComparisonComposition />
          </Preview.Canvas>
          <Preview.Code html={code.comparison} />
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
        <DocSubsection parentId="usage" id="states" title="States">
          <Preview previewTheme="brutal" previewMode="light" previewClassName="items-stretch">
            <Preview.Canvas>
              <TaskCardStateMatrixComposition />
            </Preview.Canvas>
            <Preview.Code html={code.states} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="TaskCard root">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-open-row" title="Open and structure">
            <PropsTable rows={OPEN_ROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-meta" title="Metadata">
            <PropsTable rows={META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="Content">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-footer-status" title="Footer and status">
            <PropsTable rows={FOOTER_STATUS_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Channel task card",
              status: "match",
              note: "The Source pane preserves the channel-scoped Slock card fixture. The Brutal pane executes the canonical TaskCard composition with consumer-owned actions.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <TaskCardSourceComparisonComposition />
                </SourceThemeScope>
              ),
              brutal: <TaskCardComparisonComposition />,
              sourceCode: code.sourceCard,
              brutalCode: code.comparison,
              compositionCode: code.comparison,
              compositionPath:
                "apps/doc/src/modules/task-card/compositions/task-card-comparison.composition.tsx",
              compositionSource: taskCardComparisonCompositionSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
