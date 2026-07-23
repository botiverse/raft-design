import { createFileRoute, Link } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TasksPanelComposition } from "#/modules/tasks/compositions/tasks-panel.composition.tsx";
import tasksPanelCompositionSource from "#/modules/tasks/compositions/tasks-panel.composition.tsx?raw";
import {
  TasksEmptyStatesComposition,
  TasksErrorComposition,
  TasksLoadingComposition,
} from "#/modules/tasks/compositions/tasks-states.composition.tsx";
import tasksStatesCompositionSource from "#/modules/tasks/compositions/tasks-states.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";

const ANATOMY_SNIPPET = `<TasksPanelRoot>
  <TasksPanelToolbar>
    <TasksPanelToolbarGroup>
      <TasksPanelToolbarLabel>{/* non-interactive toolbar label */}</TasksPanelToolbarLabel>
      {/* leading: filters / actions */}
    </TasksPanelToolbarGroup>
    <TasksPanelToolbarGroup>
      {/* trailing: view switcher */}
    </TasksPanelToolbarGroup>
  </TasksPanelToolbar>
  <TasksPanelViewport>
    <TasksPanelEmpty />
    <TaskLoadingList>
      <TaskLoadingRow>
        <Skeleton />
      </TaskLoadingRow>
    </TaskLoadingList>
    {/* Compose TaskBoard / TaskList / TaskDnd / TaskCard here */}
  </TasksPanelViewport>
</TasksPanelRoot>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const PANEL_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"section">',
    description: "Tasks tab panel root. Product data and routing remain outside.",
  },
];

const PANEL_TOOLBAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Toolbar row with justify-between. Place leading and trailing ToolbarGroups as children.",
  },
];

const PANEL_TOOLBAR_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Cluster of toolbar controls. First group leads; second group trails (e.g. view switcher).",
  },
];

const PANEL_TOOLBAR_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Non-interactive visual label for toolbar context or static filter summaries. Consumers provide visible content.",
  },
];

const PANEL_VIEWPORT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Scroll boundary for board, list, loading, and empty states.",
  },
];

const PANEL_EMPTY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Panel-level empty-state host.",
  },
];

const LOADING_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Loading skeleton list. Sets aria-busy. Own recipe under tasks/task-loading.",
  },
];

const LOADING_ROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Single loading skeleton row. Compose Skeleton line children directly.",
  },
];

export const Route = createFileRoute("/components/tasks")({
  component: TasksDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SNIPPET,
        panel: stripSourceCodeBlocks(tasksPanelCompositionSource),
        states: tasksStatesCompositionSource,
      },
    }),
});

function TasksDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TasksPanel"
      description="Shell for the Tasks tab: toolbar groups, viewport, empty, and loading. Board, list, dnd, and card are separate peers."
      overview={
        <Differences from="Slock TasksPanel">
          <li>
            package split: shell here; see <Link to="/components/task-board">TaskBoard</Link>,{" "}
            <Link to="/components/task-list">TaskList</Link>,{" "}
            <Link to="/components/task-dnd">TaskDnd</Link>, and{" "}
            <Link to="/components/task-card">TaskCard</Link>
          </li>
          <li>preserves the channel Tasks tab structure across Brutal and Elegant themes</li>
          <li>
            toolbar only provides containers — filters, dropdowns, and actions compose{" "}
            <code>Combobox</code>, <code>Button</code>, and related primitives
          </li>
          <li>keeps task workflow, permissions, stores, realtime, and routing in the consumer</li>
          <li>
            does not ship a create-task dialog — consumers compose <code>Dialog</code>,{" "}
            <code>Button</code>, and form fields
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="h-[42rem] items-stretch p-0">
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
          <DocSubsection parentId="usage" id="loading" title="Loading">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksLoadingComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="panel-empty" title="Panel empty states">
            <p className="mb-4 text-sm text-foreground/70">
              <code>TasksPanelEmpty</code> hosts consumer <code>EmptyState</code> for unfiltered and
              filtered-empty. Column/section empties live on{" "}
              <Link to="/components/task-board">TaskBoard</Link> and{" "}
              <Link to="/components/task-list">TaskList</Link>.
            </p>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksEmptyStatesComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="error" title="Error">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksErrorComposition />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-panel-root" title="TasksPanelRoot">
            <PropsTable rows={PANEL_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-toolbar" title="TasksPanelToolbar">
            <PropsTable rows={PANEL_TOOLBAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-toolbar-group" title="TasksPanelToolbarGroup">
            <PropsTable rows={PANEL_TOOLBAR_GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-toolbar-label" title="TasksPanelToolbarLabel">
            <PropsTable rows={PANEL_TOOLBAR_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-viewport" title="TasksPanelViewport">
            <PropsTable rows={PANEL_VIEWPORT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-empty" title="TasksPanelEmpty">
            <PropsTable rows={PANEL_EMPTY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-loading-list" title="TaskLoadingList">
            <PropsTable rows={LOADING_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-loading-row" title="TaskLoadingRow">
            <PropsTable rows={LOADING_ROW_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
