import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { TaskBoardEmptyColumnsComposition } from "#/modules/task-board/compositions/task-board-empty-columns.composition.tsx";
import { TaskBoardComposition } from "#/modules/task-board/compositions/task-board.composition.tsx";
import taskBoardCompositionSource from "#/modules/task-board/compositions/task-board.composition.tsx?raw";
import { TaskBoardVirtualizationComposition } from "#/modules/task-board/compositions/task-board-virtualization.composition.tsx";

const ANATOMY_SNIPPET = `import {
  TaskBoardColumn,
  TaskBoardColumnBadge,
  TaskBoardColumnChevron,
  TaskBoardColumnCount,
  TaskBoardColumnEmpty,
  TaskBoardColumnEmptyAllowed,
  TaskBoardColumnEmptyBlocked,
  TaskBoardColumnEmptyIdle,
  TaskBoardColumnHeading,
  TaskBoardColumnItems,
  TaskBoardColumnPanel,
  TaskBoardColumnTrigger,
  TaskBoardRoot,
  TaskCard,
  TaskDndProvider,
  TaskDragOverlay,
  TaskDraggable,
  TaskDropPlaceholder,
  TaskDropZone,
} from "raft-ui";

<TaskDndProvider isDropAllowed={() => true} onMove={() => {}}>
  <TaskBoardRoot>
    <TaskBoardColumn
      render={<TaskDropZone id="task-status:todo" data={{ status: "todo" }} />}
    >
      <TaskBoardColumnTrigger>
        <TaskBoardColumnHeading>
          <TaskBoardColumnBadge status="todo" />
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
          <TaskDropPlaceholder id="task-1" placement="before" />
          <TaskDraggable
            id="task-1"
            dropId="task-1"
            dropData={{ status: "todo", taskId: "task-1" }}
          >
            <TaskCard />
          </TaskDraggable>
          <TaskDropPlaceholder id="task-1" placement="after" />
        </TaskBoardColumnItems>
      </TaskBoardColumnPanel>
    </TaskBoardColumn>
  </TaskBoardRoot>
  <TaskDragOverlay>
    <TaskCard />
  </TaskDragOverlay>
</TaskDndProvider>`;

const DND_SNIPPET = `<TaskDndProvider isDropAllowed={…} onMove={…}>
  <TaskBoardRoot>
    {statuses.map((status) => (
      <TaskBoardColumn
        key={status}
        render={<TaskDropZone id={columnDropId} data={{ status }} />}
      >
        <TaskBoardColumnItems>
          {tasks.map((task) => (
            <TaskDraggable
              key={task.id}
              id={task.id}
              dropId={cardDropId}
              dropData={{ status, taskId: task.id }}
            >
              <TaskCard />
            </TaskDraggable>
          ))}
        </TaskBoardColumnItems>
      </TaskBoardColumn>
    ))}
  </TaskBoardRoot>
  <TaskDragOverlay>{activeTask ? <TaskCard /> : null}</TaskDragOverlay>
</TaskDndProvider>`;

const SCROLL_AREA_SNIPPET = `<ScrollArea className="relative h-full min-h-0 w-full min-w-0">
  <ScrollAreaViewport className="p-4">
    <ScrollAreaContent className="min-w-max">
      <TaskBoardRoot>{/* columns */}</TaskBoardRoot>
    </ScrollAreaContent>
  </ScrollAreaViewport>
  <ScrollAreaScrollbar>
    <ScrollAreaThumb />
  </ScrollAreaScrollbar>
  <ScrollAreaScrollbar orientation="horizontal">
    <ScrollAreaThumb />
  </ScrollAreaScrollbar>
  <ScrollAreaCorner />
</ScrollArea>`;

const EMPTY_COLUMN_SNIPPET = `<TaskBoardColumnItems>
  {tasks.length === 0 ? (
    <>
      <TaskBoardColumnEmpty>
        <TaskBoardColumnEmptyIdle>No {label} tasks.</TaskBoardColumnEmptyIdle>
        <TaskBoardColumnEmptyAllowed>Drop to set {label}</TaskBoardColumnEmptyAllowed>
        <TaskBoardColumnEmptyBlocked>Cannot move to {label}</TaskBoardColumnEmptyBlocked>
      </TaskBoardColumnEmpty>
      <TaskDropPlaceholder id={columnDropId} />
    </>
  ) : (
    tasks.map((task) => (
      <TaskDraggable key={task.id} id={task.id} dropId={cardDropId}>
        <TaskCard />
      </TaskDraggable>
    ))
  )}
</TaskBoardColumnItems>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const VIRTUALIZATION_SNIPPET = `const viewportRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => viewportRef.current,
  getItemKey: (index) => items[index]!.id,
  estimateSize: () => 116,
  gap: 10,
  overscan: 6,
});

<ScrollArea>
  <ScrollAreaViewport ref={viewportRef}>
    <TaskBoardColumnItems>
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={row.key}
            ref={virtualizer.measureElement}
            style={{ position: "absolute", transform: \`translateY(\${row.start}px)\` }}
          >
            {renderItem(items[row.index]!)}
          </div>
        ))}
      </div>
    </TaskBoardColumnItems>
  </ScrollAreaViewport>
</ScrollArea>`;

const BOARD_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "Horizontal board layout root.",
  },
];

const BOARD_COLUMN_PROPS: readonly PropRow[] = [
  {
    name: "open",
    type: "boolean",
    description: "Controlled collapsed state for the column.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Initial collapsed state for the column.",
  },
  {
    name: "...props",
    type: "Collapsible.Root.Props",
    description: "Fixed-width board column root. Compose TaskDropZone via render for DnD.",
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
    name: "status",
    type: '"todo" | "in-progress" | "in-review" | "done" | "closed"',
    description: "Task status that drives the badge surface color.",
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
    description: "Item list inside a board column.",
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

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  board: taskBoardCompositionSource,
  dnd: DND_SNIPPET,
  scrollArea: SCROLL_AREA_SNIPPET,
  empty: EMPTY_COLUMN_SNIPPET,
  virtualization: VIRTUALIZATION_SNIPPET,
} as const;

export const Route = createFileRoute("/components/task-board")({
  component: TaskBoardDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function TaskBoardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TaskBoard"
      description="Horizontal status columns for the Tasks board view. Pair with TaskDnd for drag targets and TaskCard for items."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="h-[42rem] items-stretch p-0">
          <Preview.Canvas>
            <TaskBoardComposition />
          </Preview.Canvas>
          <Preview.Code html={code.board} collapsedHtml={code.boardBody} />
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
          <DocSubsection parentId="usage" id="board-with-dnd" title="Board with drag and drop">
            <p className="mb-4 text-sm text-foreground-strong/70">
              Wrap columns in <InlineCode>TaskDndProvider</InlineCode> and mount each column as a{" "}
              <InlineCode>TaskDropZone</InlineCode>. Drop policy and move handlers stay in the
              composition.
            </p>
            <Preview previewClassName="h-[42rem] items-stretch p-0">
              <Preview.Canvas>
                <TaskBoardComposition />
              </Preview.Canvas>
              <Preview.Code html={code.dnd} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="scroll-area" title="Scroll area">
            <p className="mb-4 text-sm text-foreground-strong/70">
              Keep one <InlineCode>ScrollAreaViewport</InlineCode> around the whole board. The
              viewport owns vertical and horizontal scrolling;{" "}
              <InlineCode>TaskBoardRoot</InlineCode> keeps its natural minimum width, so columns
              never become independent scroll regions.
            </p>
            <Preview previewClassName="h-[28rem] items-stretch p-0">
              <Preview.Canvas>
                <TaskBoardComposition />
              </Preview.Canvas>
              <Preview.Code html={code.scrollArea} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="column-empty" title="Column empty states">
            <p className="mb-4 text-sm text-foreground-strong/70">
              Sparse tasks leave In Review / Done / Closed empty so{" "}
              <InlineCode>TaskBoardColumnEmptyIdle</InlineCode> shows. Drag onto an empty column for
              Allowed / Blocked copy (Closed is not blocked in this demo — see{" "}
              <Link to="/components/task-dnd">
                <InlineCode>TaskDnd</InlineCode>
              </Link>
              ).
            </p>
            <Preview previewClassName="h-[42rem] items-stretch p-0">
              <Preview.Canvas>
                <TaskBoardEmptyColumnsComposition />
              </Preview.Canvas>
              <Preview.Code html={code.empty} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="virtualization" title="Virtualization">
            <p className="mb-4 text-sm text-foreground-strong/70">
              Keep one shared <InlineCode>ScrollAreaViewport</InlineCode>, and mount a{" "}
              <InlineCode>useVirtualizer</InlineCode> stack inside each tall column. Only viewport
              rows plus overscan stay mounted — watch the counter while scrolling. Virtualization
              stays consumer-owned; <InlineCode>TaskBoard</InlineCode> does not provide it.
            </p>
            <Preview previewClassName="h-[28rem] items-stretch p-0">
              <Preview.Canvas>
                <TaskBoardVirtualizationComposition />
              </Preview.Canvas>
              <Preview.Code html={code.virtualization} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
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
        </div>
      </DocSection>
    </DocPage>
  );
}
