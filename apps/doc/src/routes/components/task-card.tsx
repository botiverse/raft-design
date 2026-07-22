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
import { TaskCardPanelComparisonComposition } from "#/modules/task-card/compositions/task-card-panel-comparison.composition.tsx";
import taskCardPanelComparisonSource from "#/modules/task-card/compositions/task-card-panel-comparison.composition.tsx?raw";
import { TaskCardStateMatrixComposition } from "#/modules/task-card/compositions/task-card-state-matrix.composition.tsx";
import taskCardStateMatrixCompositionSource from "#/modules/task-card/compositions/task-card-state-matrix.composition.tsx?raw";
import { TaskCardPanelSourceComparisonComposition } from "#/modules/task-card/task-card.source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

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
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/task/TaskCard.tsx",
      },
    ],
  },
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
    description: "Card root. Compose open, body, and footer parts as children.",
  },
];

const OPEN_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Primary card action. The consumer decides what opening a task does.",
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

const FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"footer">',
    description: "Footer boundary for status controls.",
  },
];

const STATUS_PROPS: readonly PropRow[] = [
  {
    name: "busy",
    type: "boolean",
    default: "false",
    description: "Marks the status control region as busy.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Status-control container. Compose TaskCardStatusTrigger and a menu as children.",
  },
];

const STATUS_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "tone",
    type: "TaskStatusTone",
    description: "Status tone used for trigger styling.",
  },
  {
    name: "busy",
    type: "boolean",
    default: "false",
    description: "Busy state for the status trigger.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Status trigger button. Compose it with the menu primitive that owns selection behavior.",
  },
];

const STATUS_MENU_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "DropdownMenuContentProps",
    description: "Status menu surface styled for task status selection.",
  },
];

const STATUS_MENU_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "DropdownMenuRadioItemProps",
    description: "Selectable status option inside TaskStatusMenuContent.",
  },
];

export const Route = createFileRoute("/components/task-card")({
  component: TaskCardDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SNIPPET,
        comparison: taskCardComparisonCompositionSource,
        panelComparison: taskCardPanelComparisonSource,
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
          <DocSubsection parentId="api" id="api-root" title="TaskCard">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-open" title="TaskCardOpen">
            <PropsTable rows={OPEN_PROPS} />
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
          <DocSubsection parentId="api" id="api-footer" title="TaskCardFooter">
            <PropsTable rows={FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-status" title="TaskCardStatus">
            <PropsTable rows={STATUS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-status-trigger" title="TaskCardStatusTrigger">
            <PropsTable rows={STATUS_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-status-menu-content" title="TaskStatusMenuContent">
            <PropsTable rows={STATUS_MENU_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-status-menu-item" title="TaskStatusMenuItem">
            <PropsTable rows={STATUS_MENU_ITEM_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Channel task card",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real channel-scoped TaskCard DOM; the three Current panes execute the canonical TaskCard panel composition with consumer-owned actions.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <TaskCardPanelSourceComparisonComposition />
                </SourceThemeScope>
              ),
              brutal: <TaskCardPanelComparisonComposition />,
              elegant: <TaskCardPanelComparisonComposition />,
              elegantDark: <TaskCardPanelComparisonComposition />,
              compositionCode: code.panelComparison,
              compositionPath:
                "apps/doc/src/modules/task-card/compositions/task-card-panel-comparison.composition.tsx",
              compositionSource: taskCardPanelComparisonSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
