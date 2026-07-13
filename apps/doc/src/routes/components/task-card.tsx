import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
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
  { id: "states", title: "States" },
  { id: "anatomy", title: "Anatomy" },
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

const PROPS: readonly PropRow[] = [
  {
    name: "TaskCard",
    type: 'SlotProps<"article"> & { busy?: boolean; disabled?: boolean }',
    description:
      "Card root. Exposes busy and disabled state without owning task data or workflow policy.",
  },
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
  {
    name: "TaskCardMeta / Channel / Number / Legacy",
    type: "div and span slot props",
    description: "Explicit metadata parts; consumers render only the fields their context needs.",
  },
  {
    name: "TaskCardTitle / Description",
    type: 'SlotProps<"p">',
    description: "Task-owned visible content supplied by the consumer.",
  },
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
      <DocSection id="states" title="States">
        <Example
          html={code.states}
          previewTheme="brutal"
          previewMode="light"
          previewClassName="items-stretch"
        >
          <TaskCardStateMatrixComposition />
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
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
