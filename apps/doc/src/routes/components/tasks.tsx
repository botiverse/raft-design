import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { TasksEmptyStatesComposition } from "#/modules/tasks/compositions/tasks-empty-states.composition.tsx";
import tasksEmptyStatesCompositionSource from "#/modules/tasks/compositions/tasks-empty-states.composition.tsx?raw";
import { TasksErrorComposition } from "#/modules/tasks/compositions/tasks-error.composition.tsx";
import tasksErrorCompositionSource from "#/modules/tasks/compositions/tasks-error.composition.tsx?raw";
import { TasksAssigneeFilterComposition } from "#/modules/tasks/compositions/tasks-assignee-filter.composition.tsx";
import tasksAssigneeFilterCompositionSource from "#/modules/tasks/compositions/tasks-assignee-filter.composition.tsx?raw";
import { TasksCreatorFilterComposition } from "#/modules/tasks/compositions/tasks-creator-filter.composition.tsx";
import tasksCreatorFilterCompositionSource from "#/modules/tasks/compositions/tasks-creator-filter.composition.tsx?raw";
import { TasksLegacyTaskPanelComposition } from "#/modules/tasks/compositions/tasks-legacy-task-panel.composition.tsx";
import tasksLegacyTaskPanelCompositionSource from "#/modules/tasks/compositions/tasks-legacy-task-panel.composition.tsx?raw";
import { TasksLoadingComposition } from "#/modules/tasks/compositions/tasks-loading.composition.tsx";
import tasksLoadingCompositionSource from "#/modules/tasks/compositions/tasks-loading.composition.tsx?raw";
import { TasksPanelComposition } from "#/modules/tasks/compositions/tasks-panel.composition.tsx";
import tasksPanelCompositionSource from "#/modules/tasks/compositions/tasks-panel.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const ANATOMY_SNIPPET = `import {
  Button,
  Skeleton,
  TaskLoadingList,
  TaskLoadingRow,
  TasksPanelEmpty,
  TasksPanelRoot,
  TasksPanelToolbar,
  TasksPanelToolbarFilters,
  TasksPanelToolbarLabel,
  TasksPanelToolbarNewTask,
  TasksPanelToolbarView,
  TasksPanelViewport,
} from "raft-ui";

<TasksPanelRoot>
  <TasksPanelToolbar>
    <TasksPanelToolbarNewTask>
      <Button variant="accent" size="sm">New Task</Button>
    </TasksPanelToolbarNewTask>
    <TasksPanelToolbarFilters>
      {/* Creator / Assignee filters; ghost Clear when any filter is active */}
      <TasksPanelToolbarLabel>{/* non-interactive filter chrome */}</TasksPanelToolbarLabel>
      <Button variant="ghost" size="sm">Clear</Button>
    </TasksPanelToolbarFilters>
    <TasksPanelToolbarView>
      {/* Board / List view switcher */}
    </TasksPanelToolbarView>
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
      "Toolbar shell. Desktop keeps New Task + Filters on the left and View on the right; mobile stacks View beside New Task, then Filters on a second row.",
  },
];

const PANEL_TOOLBAR_NEW_TASK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Primary create-task action slot. Sits left on both breakpoints.",
  },
];

const PANEL_TOOLBAR_FILTERS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Filter controls cluster (and ghost Clear when active). Full-width second row on mobile; follows New Task on desktop.",
  },
];

const PANEL_TOOLBAR_VIEW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Board/List view switcher slot. Trails on desktop; top-right on mobile.",
  },
];

const PANEL_TOOLBAR_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description:
      "Generic toolbar cluster. Prefer NewTask / Filters / View for the responsive layout; Group remains for custom groupings.",
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
        panel: tasksPanelCompositionSource,
        assigneeFilter: tasksAssigneeFilterCompositionSource,
        creatorFilter: tasksCreatorFilterCompositionSource,
        loading: tasksLoadingCompositionSource,
        empty: tasksEmptyStatesCompositionSource,
        error: tasksErrorCompositionSource,
        legacyTaskPanel: tasksLegacyTaskPanelCompositionSource,
      },
    }),
});

function TasksDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TasksPanel"
      description="Shell for the Tasks tab with toolbar slots, viewport, empty, and loading states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="h-[42rem] items-stretch p-0">
          <Preview.Canvas>
            <TasksPanelComposition />
          </Preview.Canvas>
          <Preview.Code html={code.panel} collapsedHtml={code.panelBody} />
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
          <DocSubsection parentId="usage" id="creator-filter" title="Creator filter">
            <p className="mb-4 text-sm text-foreground-strong/70">
              The current-user shortcut uses the current user&apos;s identity value and replaces
              their duplicate avatar row.
            </p>
            <Preview previewClassName="h-80 items-stretch p-0">
              <Preview.Canvas>
                <div className="flex h-full items-start justify-center pt-8">
                  <TasksCreatorFilterComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.creatorFilter} collapsedHtml={code.creatorFilterBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="assignee-filter" title="Assignee filter">
            <p className="mb-4 text-sm text-foreground-strong/70">
              Assignee uses the same external identity data and adds explicit Assigned to me and
              Unassigned options.
            </p>
            <Preview previewClassName="h-80 items-stretch p-0">
              <Preview.Canvas>
                <div className="flex h-full items-start justify-center pt-8">
                  <TasksAssigneeFilterComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.assigneeFilter} collapsedHtml={code.assigneeFilterBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="loading" title="Loading">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksLoadingComposition />
              </Preview.Canvas>
              <Preview.Code html={code.loading} collapsedHtml={code.loadingBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="panel-empty" title="Panel empty states">
            <p className="mb-4 text-sm text-foreground-strong/70">
              <InlineCode>TasksPanelEmpty</InlineCode> hosts consumer{" "}
              <InlineCode>EmptyState</InlineCode> for unfiltered and filtered-empty. Column/section
              empties live on{" "}
              <Link to="/components/task-board">
                <InlineCode>TaskBoard</InlineCode>
              </Link>{" "}
              and{" "}
              <Link to="/components/task-list">
                <InlineCode>TaskList</InlineCode>
              </Link>
              .
            </p>
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksEmptyStatesComposition />
              </Preview.Canvas>
              <Preview.Code html={code.empty} collapsedHtml={code.emptyBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="error" title="Error">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <TasksErrorComposition />
              </Preview.Canvas>
              <Preview.Code html={code.error} collapsedHtml={code.errorBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="legacy-task-panel" title="Legacy task panel">
            <p className="mb-4 text-sm text-foreground-strong/70">
              Legacy tasks do not map to a message thread. Open them in the same right-hand slot as{" "}
              <Link to="/components/thread-panel">
                <InlineCode>ThreadPanel</InlineCode>
              </Link>
              , composing <InlineCode>LegacyTaskPanel</InlineCode> (<InlineCode>Root</InlineCode> /{" "}
              <InlineCode>Header</InlineCode> / <InlineCode>Title</InlineCode> /{" "}
              <InlineCode>Actions</InlineCode> / <InlineCode>Body</InlineCode>) with a consumer
              metadata body — no <InlineCode>OriginalMessage</InlineCode>, replies, search, or
              composer. Mutually exclusive with a real thread: if{" "}
              <InlineCode>task.isLegacy</InlineCode>, close the thread and show this panel instead.
            </p>
            <Preview previewClassName="h-[36rem] items-stretch justify-center bg-brutal-cream p-6">
              <Preview.Canvas>
                <TasksLegacyTaskPanelComposition
                  framed
                  channelName="raft-ui-migration"
                  taskNumber={1}
                  title="Migrate legacy task records into the Raft UI board"
                  description="Imported from the pre-migration store. Metadata is read-only here; open a message task when you need thread replies."
                  createdBy="@Legacy Bot"
                  createdAt="Jul 12, 2026, 9:18 AM"
                  assignee="@Legacy Bot"
                  completed="Not done"
                />
              </Preview.Canvas>
              <Preview.Code html={code.legacyTaskPanel} collapsedHtml={code.legacyTaskPanelBody} />
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
          <DocSubsection
            parentId="api"
            id="api-panel-toolbar-new-task"
            title="TasksPanelToolbarNewTask"
          >
            <PropsTable rows={PANEL_TOOLBAR_NEW_TASK_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-panel-toolbar-filters"
            title="TasksPanelToolbarFilters"
          >
            <PropsTable rows={PANEL_TOOLBAR_FILTERS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-toolbar-view" title="TasksPanelToolbarView">
            <PropsTable rows={PANEL_TOOLBAR_VIEW_PROPS} />
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
