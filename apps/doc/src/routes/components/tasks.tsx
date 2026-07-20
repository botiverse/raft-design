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
    description: "Toolbar region for filters and panel actions.",
  },
];

const PANEL_TOOLBAR_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Grouped toolbar controls.",
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
    description: "Loading skeleton list container.",
  },
];

const LOADING_ROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Single loading skeleton row.",
  },
];

const LOADING_ROW_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Content wrapper inside a loading row.",
  },
];

const LOADING_LINES_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Alias of TaskLoadingRowContent for the placeholder lines block.",
  },
];

const FILTER_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "busy",
    type: "boolean",
    default: "false",
    description: "Busy state for the filter trigger.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Opens the filter combobox. Compose label and count as children.",
  },
];

const FILTER_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Selected-filter count badge on the trigger.",
  },
];

const FILTER_CLEAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Clears active filters from the toolbar.",
  },
];

const FILTER_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ComboboxContentProps",
    description: "Filter popover surface. Forwards Combobox content props.",
  },
];

const FILTER_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ComboboxHeaderProps",
    description: "Filter popover header region.",
  },
];

const FILTER_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ComboboxLabelProps",
    description: "Filter popover label.",
  },
];

const FILTER_POPOVER_CLEAR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ComboboxClearProps",
    description: "Clears the filter selection from inside the popover.",
  },
];

const FILTER_SEARCH_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Search field wrapper inside the filter popover.",
  },
];

const FILTER_INPUT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ComboboxInputProps",
    description: "Filter search input. Forwards Combobox input props.",
  },
];

const FILTER_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ComboboxListProps",
    description: "Scrollable filter option list.",
  },
];

const FILTER_OPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ComboboxItemProps",
    description: "Selectable filter option.",
  },
];

const FILTER_OPTION_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Option content row for leading icon, label, and indicator.",
  },
];

const FILTER_OPTION_LEADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Leading icon or mark inside a filter option.",
  },
];

const FILTER_OPTION_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "italic",
    type: "boolean",
    default: "false",
    description: "Applies the italic option-label style.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Visible option label text.",
  },
];

const FILTER_OPTION_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ComboboxItemIndicatorProps",
    description: "Selected-state indicator for a filter option.",
  },
];

const FILTER_EMPTY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "ComboboxEmptyProps",
    description: "Empty search result state inside the filter list.",
  },
];

const TOOLBAR_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Toolbar action button such as create task.",
  },
];

const SECTION_PROPS: readonly PropRow[] = [
  {
    name: "open / defaultOpen",
    type: "boolean",
    description: "Controlled or uncontrolled collapsed state for the section.",
  },
  {
    name: "...props",
    type: "Collapsible.Root.Props",
    description: "List section root. Defaults to a section host via render.",
  },
];

const SECTION_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Collapsible.Trigger.Props",
    description: "Expands or collapses the section.",
  },
];

const SECTION_HEADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Heading row for badge and count.",
  },
];

const SECTION_BADGE_PROPS: readonly PropRow[] = [
  {
    name: "tone",
    type: "TaskStatusTone",
    description: "Status tone for the section badge.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Section status badge.",
  },
];

const SECTION_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Task count in the section heading.",
  },
];

const SECTION_CHEVRON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Disclosure chevron for the section trigger.",
  },
];

const SECTION_PANEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Collapsible.Panel.Props",
    description: "Collapsible panel hosting empty state and items.",
  },
];

const SECTION_ITEMS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "List of task cards inside the section.",
  },
];

const SECTION_EMPTY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Empty-state host for a section with no tasks.",
  },
];

const BOARD_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Horizontal board layout root.",
  },
];

const BOARD_COLUMN_PROPS: readonly PropRow[] = [
  {
    name: "open / defaultOpen",
    type: "boolean",
    description: "Controlled or uncontrolled collapsed state for the column.",
  },
  {
    name: "...props",
    type: "Collapsible.Root.Props",
    description: "Fixed-width board column root.",
  },
];

const BOARD_COLUMN_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Collapsible.Trigger.Props",
    description: "Expands or collapses the board column.",
  },
];

const BOARD_COLUMN_HEADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Heading row for column badge and count.",
  },
];

const BOARD_COLUMN_BADGE_PROPS: readonly PropRow[] = [
  {
    name: "tone",
    type: "TaskStatusTone",
    description: "Status tone for the column badge.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Column status badge.",
  },
];

const BOARD_COLUMN_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Task count in the column heading.",
  },
];

const BOARD_COLUMN_CHEVRON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Disclosure chevron for the column trigger.",
  },
];

const BOARD_COLUMN_PANEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Collapsible.Panel.Props",
    description: "Collapsible panel hosting column items and empty states.",
  },
];

const BOARD_COLUMN_ITEMS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Droppable item list inside a board column.",
  },
];

const BOARD_COLUMN_EMPTY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Empty-column host for idle, allowed, and blocked drop copy.",
  },
];

const BOARD_COLUMN_EMPTY_IDLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Idle empty-column message.",
  },
];

const BOARD_COLUMN_EMPTY_ALLOWED_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Allowed drop-target empty-column message.",
  },
];

const BOARD_COLUMN_EMPTY_BLOCKED_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Blocked drop-target empty-column message.",
  },
];

const LIST_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "List view root for TaskSection children.",
  },
];

const CREATE_DIALOG_PROPS: readonly PropRow[] = [
  {
    name: "disablePointerDismissal",
    type: "boolean",
    default: "true",
    description: "Defaults to true so pointer dismissal stays off for create flows.",
  },
  {
    name: "...props",
    type: "DialogProps",
    description: "Create-task dialog root. Validation and submission stay consumer-owned.",
  },
];

const CREATE_DIALOG_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "overlay",
    type: "false | DialogOverlayProps",
    description: "Pass false for framed previews; otherwise renders the themed backdrop.",
  },
  {
    name: "...props",
    type: "DialogContentProps",
    description: "Create-task dialog surface.",
  },
];

const CREATE_DIALOG_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Create-dialog header region.",
  },
];

const CREATE_DIALOG_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "DialogTitleProps",
    description: "Accessible create-dialog title.",
  },
];

const CREATE_DIALOG_FORM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"form">',
    description: "Create-task form host.",
  },
];

const CREATE_DIALOG_ERROR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Inline create-dialog error message host.",
  },
];

const CREATE_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Create-dialog body region.",
  },
];

const CREATE_FIELDS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Field stack for single or batch create rows.",
  },
];

const CREATE_FIELD_ROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "One create-task field row.",
  },
];

const CREATE_CLOSE_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Dismiss action for the create dialog.",
  },
];

const CREATE_REMOVE_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Removes a batch create row.",
  },
];

const CREATE_ADD_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Adds another batch create row.",
  },
];

const CREATE_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "tone",
    type: '"accent" | "default"',
    default: '"default"',
    description: "Primary or default create action emphasis.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Submit or secondary create action button.",
  },
];

const CREATE_FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Create-dialog footer action row.",
  },
];

const DND_PROVIDER_PROPS: readonly PropRow[] = [
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables pointer, touch, and keyboard drag sensors.",
  },
  {
    name: "isDropAllowed",
    type: "(activeId, overId) => boolean",
    description: "Consumer policy for whether a drop target is allowed.",
  },
  {
    name: "onMove",
    type: "(details: TaskMoveDetails) => void | Promise<void>",
    description: "Called when a drag ends over an allowed target.",
  },
  {
    name: "onMoveError",
    type: "(error, details) => void",
    description: "Called when onMove rejects.",
  },
  {
    name: "onDragStart / onDragOver / onDragCancel / onDragEnd",
    type: "dnd-kit drag event handlers",
    description: "Optional low-level drag lifecycle hooks.",
  },
  {
    name: "children",
    type: "ReactNode",
    description: "Board or list content that participates in drag and drop.",
  },
];

const DRAGGABLE_PROPS: readonly PropRow[] = [
  {
    name: "id",
    type: "UniqueIdentifier",
    description: "Stable drag source id.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables dragging for this item.",
  },
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Draggable host. Usually wraps a TaskCard.",
  },
];

const DROP_ZONE_PROPS: readonly PropRow[] = [
  {
    name: "id",
    type: "UniqueIdentifier",
    description: "Stable drop target id.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables this drop target.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div", { dropState: TaskDropState }>',
    description: "Droppable host. Exposes dropState idle | allowed | blocked via render state.",
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
          <DocSubsection parentId="api" id="api-loading-row-content" title="TaskLoadingRowContent">
            <PropsTable rows={LOADING_ROW_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-loading-lines" title="TaskLoadingLines">
            <PropsTable rows={LOADING_LINES_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-trigger" title="TaskFilterTrigger">
            <PropsTable rows={FILTER_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-count" title="TaskFilterCount">
            <PropsTable rows={FILTER_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-clear" title="TaskFilterClear">
            <PropsTable rows={FILTER_CLEAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-content" title="TaskFilterContent">
            <PropsTable rows={FILTER_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-header" title="TaskFilterHeader">
            <PropsTable rows={FILTER_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-label" title="TaskFilterLabel">
            <PropsTable rows={FILTER_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-filter-popover-clear"
            title="TaskFilterPopoverClear"
          >
            <PropsTable rows={FILTER_POPOVER_CLEAR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-search" title="TaskFilterSearch">
            <PropsTable rows={FILTER_SEARCH_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-input" title="TaskFilterInput">
            <PropsTable rows={FILTER_INPUT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-list" title="TaskFilterList">
            <PropsTable rows={FILTER_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-option" title="TaskFilterOption">
            <PropsTable rows={FILTER_OPTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-filter-option-content"
            title="TaskFilterOptionContent"
          >
            <PropsTable rows={FILTER_OPTION_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-filter-option-leading"
            title="TaskFilterOptionLeading"
          >
            <PropsTable rows={FILTER_OPTION_LEADING_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-option-label" title="TaskFilterOptionLabel">
            <PropsTable rows={FILTER_OPTION_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-filter-option-indicator"
            title="TaskFilterOptionIndicator"
          >
            <PropsTable rows={FILTER_OPTION_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-filter-empty" title="TaskFilterEmpty">
            <PropsTable rows={FILTER_EMPTY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-toolbar-action" title="TaskToolbarAction">
            <PropsTable rows={TOOLBAR_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-section" title="TaskSection">
            <PropsTable rows={SECTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-section-trigger" title="TaskSectionTrigger">
            <PropsTable rows={SECTION_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-section-heading" title="TaskSectionHeading">
            <PropsTable rows={SECTION_HEADING_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-section-badge" title="TaskSectionBadge">
            <PropsTable rows={SECTION_BADGE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-section-count" title="TaskSectionCount">
            <PropsTable rows={SECTION_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-section-chevron" title="TaskSectionChevron">
            <PropsTable rows={SECTION_CHEVRON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-section-panel" title="TaskSectionPanel">
            <PropsTable rows={SECTION_PANEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-section-items" title="TaskSectionItems">
            <PropsTable rows={SECTION_ITEMS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-section-empty" title="TaskSectionEmpty">
            <PropsTable rows={SECTION_EMPTY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-board-root" title="TaskBoardRoot">
            <PropsTable rows={BOARD_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-board-column" title="TaskBoardColumn">
            <PropsTable rows={BOARD_COLUMN_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-board-column-trigger"
            title="TaskBoardColumnTrigger"
          >
            <PropsTable rows={BOARD_COLUMN_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-board-column-heading"
            title="TaskBoardColumnHeading"
          >
            <PropsTable rows={BOARD_COLUMN_HEADING_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-board-column-badge" title="TaskBoardColumnBadge">
            <PropsTable rows={BOARD_COLUMN_BADGE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-board-column-count" title="TaskBoardColumnCount">
            <PropsTable rows={BOARD_COLUMN_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-board-column-chevron"
            title="TaskBoardColumnChevron"
          >
            <PropsTable rows={BOARD_COLUMN_CHEVRON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-board-column-panel" title="TaskBoardColumnPanel">
            <PropsTable rows={BOARD_COLUMN_PANEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-board-column-items" title="TaskBoardColumnItems">
            <PropsTable rows={BOARD_COLUMN_ITEMS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-board-column-empty" title="TaskBoardColumnEmpty">
            <PropsTable rows={BOARD_COLUMN_EMPTY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-board-column-empty-idle"
            title="TaskBoardColumnEmptyIdle"
          >
            <PropsTable rows={BOARD_COLUMN_EMPTY_IDLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-board-column-empty-allowed"
            title="TaskBoardColumnEmptyAllowed"
          >
            <PropsTable rows={BOARD_COLUMN_EMPTY_ALLOWED_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-board-column-empty-blocked"
            title="TaskBoardColumnEmptyBlocked"
          >
            <PropsTable rows={BOARD_COLUMN_EMPTY_BLOCKED_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-list-root" title="TaskListRoot">
            <PropsTable rows={LIST_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-dialog" title="TaskCreateDialog">
            <PropsTable rows={CREATE_DIALOG_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-create-dialog-content"
            title="TaskCreateDialogContent"
          >
            <PropsTable rows={CREATE_DIALOG_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-create-dialog-header"
            title="TaskCreateDialogHeader"
          >
            <PropsTable rows={CREATE_DIALOG_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-dialog-title" title="TaskCreateDialogTitle">
            <PropsTable rows={CREATE_DIALOG_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-dialog-form" title="TaskCreateDialogForm">
            <PropsTable rows={CREATE_DIALOG_FORM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-dialog-error" title="TaskCreateDialogError">
            <PropsTable rows={CREATE_DIALOG_ERROR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-body" title="TaskCreateBody">
            <PropsTable rows={CREATE_BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-fields" title="TaskCreateFields">
            <PropsTable rows={CREATE_FIELDS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-field-row" title="TaskCreateFieldRow">
            <PropsTable rows={CREATE_FIELD_ROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-close-action" title="TaskCreateCloseAction">
            <PropsTable rows={CREATE_CLOSE_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-create-remove-action"
            title="TaskCreateRemoveAction"
          >
            <PropsTable rows={CREATE_REMOVE_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-add-action" title="TaskCreateAddAction">
            <PropsTable rows={CREATE_ADD_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-action" title="TaskCreateAction">
            <PropsTable rows={CREATE_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-create-footer" title="TaskCreateFooter">
            <PropsTable rows={CREATE_FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-dnd-provider" title="TaskDndProvider">
            <PropsTable rows={DND_PROVIDER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-draggable" title="TaskDraggable">
            <PropsTable rows={DRAGGABLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-drop-zone" title="TaskDropZone">
            <PropsTable rows={DROP_ZONE_PROPS} />
          </DocSubsection>
        </div>
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
