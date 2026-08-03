import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import taskBoardCompositionSource from "#/modules/task-board/compositions/task-board.composition.tsx?raw";
import { TaskDndComposition } from "#/modules/task-dnd/compositions/task-dnd.composition.tsx";
import taskDndCompositionSource from "#/modules/task-dnd/compositions/task-dnd.composition.tsx?raw";

const TASK_BOARD_COMPOSITION_PATH =
  "apps/doc/src/modules/task-board/compositions/task-board.composition.tsx";
const TASK_DND_COMPOSITION_PATH =
  "apps/doc/src/modules/task-dnd/compositions/task-dnd.composition.tsx";

const ANATOMY_SNIPPET = `<TaskDndProvider isDropAllowed={…} onMove={…}>
  <TaskBoardColumn render={<TaskDropZone id={columnDropId} data={{ status }} />}>
    <TaskDropPlaceholder id={cardDropId} placement="before" />
    <TaskDraggable id={taskId} dropId={cardDropId} dropData={{ status, taskId }}>
      <TaskCard />
    </TaskDraggable>
    <TaskDropPlaceholder id={cardDropId} placement="after" />
  </TaskBoardColumn>
  <TaskDragOverlay>{activeTask && <TaskCard />}</TaskDragOverlay>
</TaskDndProvider>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const DND_PROVIDER_PROPS: readonly PropRow[] = [
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables pointer, touch, and keyboard drag sensors.",
  },
  {
    name: "isDropAllowed",
    type: "(activeId, overId, overData) => boolean",
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
    name: "dropId",
    type: "UniqueIdentifier",
    description: "Optional card-level drop target id for before/after insertion.",
  },
  {
    name: "dropData",
    type: "TaskDropData",
    description: "Consumer metadata returned from onMove for the card-level target.",
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
    name: "data",
    type: "TaskDropData",
    description: "Consumer metadata returned from onMove for this target.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div", { dropState: TaskDropState }>',
    description: "Droppable host. Exposes dropState idle | allowed | blocked via render state.",
  },
];

const DROP_PLACEHOLDER_PROPS: readonly PropRow[] = [
  {
    name: "id",
    type: "UniqueIdentifier",
    description:
      "The matching drop target id. Renders an allowed landing placeholder at the active card height.",
  },
  {
    name: "placement",
    type: '"before" | "after"',
    description: "Optional insertion edge for a card-level target.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div", { dropState: TaskDropState }>',
    description:
      "A presentational landing slot; it is hidden unless the matching target allows the active task.",
  },
];

const DRAG_OVERLAY_PROPS: readonly PropRow[] = [
  {
    name: "children",
    type: "ReactNode",
    description: "Consumer-rendered drag preview. Render null when no item is active.",
  },
];

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  dnd: taskBoardCompositionSource,
  dndDemo: taskDndCompositionSource,
} as const;

export const Route = createFileRoute("/components/task-dnd")({
  component: TaskDndDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

/** Board wiring plus the demo composition that sets the blocked-drop policy and fixtures. */
function TaskDndSourceFiles({ code }: { code: Record<string, string> }) {
  return (
    <DocsCodeBlock.Files
      collapsible={false}
      files={[
        {
          path: TASK_BOARD_COMPOSITION_PATH,
          source: taskBoardCompositionSource,
          html: code.dnd,
          collapsedHtml: code.dndBody,
        },
        {
          path: TASK_DND_COMPOSITION_PATH,
          source: taskDndCompositionSource,
          html: code.dndDemo,
          collapsedHtml: code.dndDemoBody,
        },
      ]}
    />
  );
}

function TaskDndDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TaskDnd"
      description="dnd-kit wiring for task drag sources and drop targets. Drop policy and move effects stay consumer-owned."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="h-[42rem] items-stretch p-0">
          <Preview.Canvas>
            <TaskDndComposition />
          </Preview.Canvas>
          <Preview.Code codeBlock={<TaskDndSourceFiles code={code} />} />
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
        <DocSubsection parentId="usage" id="allowed-blocked" title="Allowed and blocked drops">
          <p className="mb-4 text-sm text-foreground-strong/70">
            The demo composition passes <code>blockedDropStatus=&quot;closed&quot;</code>, which the
            board turns into an <code>isDropAllowed</code> policy. Drag a card onto Closed to see
            blocked empty-state copy; other columns accept the drop and call <code>onMove</code>.
          </p>
          <Preview previewClassName="h-[42rem] items-stretch p-0">
            <Preview.Canvas>
              <TaskDndComposition />
            </Preview.Canvas>
            <Preview.Code codeBlock={<TaskDndSourceFiles code={code} />} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-dnd-provider" title="TaskDndProvider">
            <PropsTable rows={DND_PROVIDER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-draggable" title="TaskDraggable">
            <PropsTable rows={DRAGGABLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-drop-zone" title="TaskDropZone">
            <PropsTable rows={DROP_ZONE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-drop-placeholder" title="TaskDropPlaceholder">
            <PropsTable rows={DROP_PLACEHOLDER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-drag-overlay" title="TaskDragOverlay">
            <PropsTable rows={DRAG_OVERLAY_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
