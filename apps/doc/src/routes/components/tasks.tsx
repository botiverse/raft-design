import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { TasksPanelComposition } from "#/modules/tasks/compositions/tasks-panel.composition.tsx";
import tasksPanelCompositionSource from "#/modules/tasks/compositions/tasks-panel.composition.tsx?raw";
import {
  CreateTaskDialogStatesComposition,
  TasksDragStatesComposition,
  TasksEmptyStatesComposition,
  TasksErrorComposition,
  TasksFilterStatesComposition,
  TasksLoadingComposition,
} from "#/modules/tasks/compositions/tasks-states.composition.tsx";
import tasksStatesCompositionSource from "#/modules/tasks/compositions/tasks-states.composition.tsx?raw";
import { TasksSourcePreview } from "#/modules/tasks/compositions/tasks-source-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import sourceTasksPanel from "../../../../../packages/ui/source/tasks/TasksPanel.tsx?raw";

const ANATOMY_SNIPPET = `<TasksPanelRoot>
  <TasksPanelToolbar>
    <TasksPanelToolbarGroup>
      <TaskFilterTrigger />
      <TaskFilterClear />
      <TaskToolbarAction />
    </TasksPanelToolbarGroup>
  </TasksPanelToolbar>
  <TasksPanelViewport>
    <TaskEmptyState />
    <TaskDndProvider>
      <TaskBoardRoot>
        <TaskBoardColumn>
          <TaskBoardColumnTrigger>
            <TaskBoardColumnHeading>
              <TaskBoardColumnBadge />
              <TaskBoardColumnCount />
            </TaskBoardColumnHeading>
            <TaskBoardColumnChevron />
          </TaskBoardColumnTrigger>
          <TaskBoardColumnPanel>
            <TaskBoardColumnItems>
              <TaskBoardColumnEmpty>
                <TaskBoardColumnEmptyIdle />
                <TaskBoardColumnEmptyAllowed />
                <TaskBoardColumnEmptyBlocked />
              </TaskBoardColumnEmpty>
              <TaskDraggable>
                <TaskCard />
              </TaskDraggable>
            </TaskBoardColumnItems>
          </TaskBoardColumnPanel>
        </TaskBoardColumn>
      </TaskBoardRoot>
    </TaskDndProvider>
    <TaskListRoot>
      <TaskSection>
        <TaskSectionTrigger>
          <TaskSectionHeading>
            <TaskSectionBadge />
            <TaskSectionCount />
          </TaskSectionHeading>
          <TaskSectionChevron />
        </TaskSectionTrigger>
        <TaskSectionPanel>
          <TaskSectionEmpty />
          <TaskSectionItems>
            <TaskCard />
          </TaskSectionItems>
        </TaskSectionPanel>
      </TaskSection>
    </TaskListRoot>
  </TasksPanelViewport>
</TasksPanelRoot>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Tasks tab source",
    scenes: [
      {
        label: "TasksPanel.tsx",
        path: "packages/ui/source/tasks/TasksPanel.tsx",
      },
      {
        label: "CreateTaskDialog.tsx",
        path: "packages/ui/source/tasks/CreateTaskDialog.tsx",
      },
      {
        label: "taskStatusUi.ts",
        path: "packages/ui/source/tasks/taskStatusUi.ts",
      },
    ],
  },
] as const;

const PROPS: readonly PropRow[] = [
  {
    name: "TasksPanelRoot / Toolbar / ToolbarGroup / Viewport",
    type: "section / div props",
    description:
      "Source panel chrome and scroll boundary. Product data and routing remain outside.",
  },
  {
    name: "TaskSection* / TaskListRoot",
    type: "Base UI Collapsible parts",
    description: "Explicit list grouping with controlled or uncontrolled collapsed state.",
  },
  {
    name: "TaskBoard*",
    type: "Base UI Collapsible parts",
    description: "Fixed-width source board columns with empty and drop-target states.",
  },
  {
    name: "TaskDndProvider / TaskDraggable / TaskDropZone",
    type: "generic DnD behavior",
    description:
      "Pointer, touch, and keyboard drag behavior. Consumers provide allowed targets and move callbacks.",
  },
  {
    name: "TaskCreate*",
    type: "dialog compound parts",
    description:
      "Source-faithful single/batch task creation structure; validation and submission remain consumer state.",
  },
  {
    name: "TasksPanelComposition",
    type: "canonical docs composition",
    description:
      "Injectable task records and callbacks with local view, filter, collapse, menu, DnD, and create interactions.",
  },
];

export const Route = createFileRoute("/components/tasks")({
  component: TasksDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SNIPPET,
        panel: tasksPanelCompositionSource,
        states: tasksStatesCompositionSource,
        sourcePanel: sourceTasksPanel,
      },
    }),
});

function TasksDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TasksPanel"
      description="Source-faithful Tasks tab UI with board, list, filters, status editing, drag-and-drop, and create states."
      overview={
        <Differences from="Slock TasksPanel">
          <li>preserves the channel Tasks tab structure and Brutal styling</li>
          <li>keeps task workflow, permissions, stores, realtime, and routing in the consumer</li>
          <li>exposes generic collapse, selection, and drag behavior through UI parts</li>
          <li>documents only Source and Brutal while the migration is being matched</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview
          previewTheme="brutal"
          previewMode="light"
          previewClassName="h-[42rem] items-stretch p-0"
        >
          <Preview.Canvas>
            <TasksPanelComposition />
          </Preview.Canvas>
          <Preview.Code html={code.panel} />
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
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="panel-states" title="Panel states">
            <Preview previewTheme="brutal" previewMode="light" previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksLoadingComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
            <Preview previewTheme="brutal" previewMode="light" previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksEmptyStatesComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
            <Preview previewTheme="brutal" previewMode="light" previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksErrorComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="filters" title="Filter states">
            <Preview previewTheme="brutal" previewMode="light" previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksFilterStatesComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="drag" title="Allowed and blocked drag states">
            <Preview previewTheme="brutal" previewMode="light" previewClassName="items-stretch p-0">
              <Preview.Canvas>
                <TasksDragStatesComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="create-task" title="Create Task dialog states">
            <Preview previewTheme="brutal" previewMode="light" previewClassName="items-stretch">
              <Preview.Canvas>
                <CreateTaskDialogStatesComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="auto"
          previewSize="tall"
          items={[
            {
              label: "Channel Tasks tab",
              status: "match",
              note: "The Source pane is a bounded read-only fixture of the mounted Slock DOM and classes. The Brutal pane executes the canonical raft-ui composition.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="flex h-[42rem] w-full min-w-0">
                  <TasksSourcePreview />
                </SourceThemeScope>
              ),
              brutal: (
                <div className="flex h-[42rem] w-full min-w-0">
                  <TasksPanelComposition />
                </div>
              ),
              sourceCode: code.sourcePanel,
              brutalCode: code.panel,
              compositionCode: code.panel,
              compositionPath:
                "apps/doc/src/modules/tasks/compositions/tasks-panel.composition.tsx",
              compositionSource: tasksPanelCompositionSource,
              previewClassName: "items-stretch p-0",
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
