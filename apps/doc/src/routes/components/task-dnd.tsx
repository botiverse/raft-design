import { createFileRoute, Link } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";
import { TaskDndComposition } from "#/modules/task-dnd/compositions/task-dnd.composition.tsx";
import taskDndCompositionSource from "#/modules/task-dnd/compositions/task-dnd.composition.tsx?raw";
import taskBoardCompositionSource from "#/modules/task-board/compositions/task-board.composition.tsx?raw";

const ANATOMY_SNIPPET = `<TaskDndProvider isDropAllowed={…} onMove={…}>
  <TaskBoardColumn render={<TaskDropZone id={status} />}>
    <TaskDraggable id={taskId}>
      <TaskCard />
    </TaskDraggable>
  </TaskBoardColumn>
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

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  dnd: stripSourceCodeBlocks(taskDndCompositionSource),
  board: stripSourceCodeBlocks(taskBoardCompositionSource),
} as const;

export const Route = createFileRoute("/components/task-dnd")({
  component: TaskDndDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function TaskDndDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TaskDnd"
      description="dnd-kit wiring for task drag sources and drop targets. Drop policy and move effects stay consumer-owned."
      overview={
        <Differences from="Slock Tasks drag">
          <li>
            peer of <Link to="/components/task-board">TaskBoard</Link> and{" "}
            <Link to="/components/task-list">TaskList</Link> — not nested inside the panel package
          </li>
          <li>
            <code>TaskDropZone</code> exposes <code>dropState</code> (<code>idle</code> /{" "}
            <code>allowed</code> / <code>blocked</code>) for empty-column copy
          </li>
          <li>
            <code>isDropAllowed</code> and <code>onMove</code> own permissions and persistence — the
            package only runs sensors and hit-testing
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="h-[42rem] items-stretch p-0">
          <Preview.Canvas>
            <TaskDndComposition />
          </Preview.Canvas>
          <Preview.Code html={code.dnd} />
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
          <p className="mb-4 text-sm text-foreground/70">
            Closed is blocked in this demo. Drag a card onto Closed to see blocked empty-state copy;
            other columns accept the drop and call <code>onMove</code>.
          </p>
          <Preview previewClassName="h-[42rem] items-stretch p-0">
            <Preview.Canvas>
              <TaskDndComposition />
            </Preview.Canvas>
            <Preview.Code html={code.board} />
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
        </div>
      </DocSection>
    </DocPage>
  );
}
