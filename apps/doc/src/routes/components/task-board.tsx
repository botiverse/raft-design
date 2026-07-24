import { createFileRoute, Link } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";
import { TaskBoardEmptyColumnsComposition } from "#/modules/task-board/compositions/task-board-empty-columns.composition.tsx";
import taskBoardEmptyColumnsCompositionSource from "#/modules/task-board/compositions/task-board-empty-columns.composition.tsx?raw";
import { TaskBoardComposition } from "#/modules/task-board/compositions/task-board.composition.tsx";
import taskBoardCompositionSource from "#/modules/task-board/compositions/task-board.composition.tsx?raw";

const ANATOMY_SNIPPET = `<TaskDndProvider>
  <TaskBoardRoot>
    <TaskBoardColumn render={<TaskDropZone id={status} />}>
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
</TaskDndProvider>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "source-virtualization", title: "Source virtualization" },
  { id: "api", title: "API" },
] as const;

const SOURCE_VIRTUALIZATION_SNIPPET = `const scrollContainerRef = useRef<HTMLDivElement>(null);

<div ref={scrollContainerRef} data-task-virtual-scroll className="flex-1 overflow-auto">
  <TaskVirtualLayout
    scrollElementRef={scrollContainerRef}
    className="flex min-w-max items-start gap-4 pr-4"
  >
    {groupedTasks.map(({ status, tasks }) => (
      <DroppableColumn
        key={status}
        status={status}
        statusTasks={tasks}
        scrollElementRef={scrollContainerRef}
      />
    ))}
  </TaskVirtualLayout>
</div>

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => scrollContainerRef.current,
  getItemKey: (index) => items[index]!.id,
  estimateSize: () => 116,
  gap: 10,
  overscan: 6,
  scrollMargin,
});

<div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
  {virtualizer.getVirtualItems().map((row) => (
    <div
      key={row.key}
      ref={virtualizer.measureElement}
      style={{ position: "absolute", transform: \`translateY(\${row.start - scrollMargin}px)\` }}
    >
      {renderItem(items[row.index]!)}
    </div>
  ))}
</div>`;

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
    type: '"todo" | "in_progress" | "in_review" | "done" | "closed"',
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
  board: stripSourceCodeBlocks(taskBoardCompositionSource),
  empty: taskBoardEmptyColumnsCompositionSource,
  sourceVirtualization: SOURCE_VIRTUALIZATION_SNIPPET,
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
      overview={
        <Differences from="Slock Tasks board">
          <li>
            peer of <code>TasksPanel</code>, <Link to="/components/task-list">TaskList</Link>,{" "}
            <Link to="/components/task-dnd">TaskDnd</Link>, and{" "}
            <Link to="/components/task-card">TaskCard</Link>
          </li>
          <li>owns column layout, collapse, and empty-column structure only</li>
          <li>
            drag policy lives on <Link to="/components/task-dnd">TaskDnd</Link> — compose{" "}
            <code>TaskDropZone</code> onto columns via <code>render</code>
          </li>
          <li>status labels, counts, and workflow remain consumer-owned</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="h-[42rem] items-stretch p-0">
          <Preview.Canvas>
            <TaskBoardComposition />
          </Preview.Canvas>
          <Preview.Code html={code.board} />
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
            <p className="mb-4 text-sm text-foreground/70">
              The preview wraps columns in <code>TaskDndProvider</code> and mounts each column as a{" "}
              <code>TaskDropZone</code>. Drop policy and move handlers stay in the composition.
            </p>
            <Preview previewClassName="h-[42rem] items-stretch p-0">
              <Preview.Canvas>
                <TaskBoardComposition />
              </Preview.Canvas>
              <Preview.Code html={code.board} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="scroll-area" title="Scroll area">
            <p className="mb-4 text-sm text-foreground/70">
              Keep one <code>ScrollAreaViewport</code> around the whole board. The viewport owns
              vertical and horizontal scrolling; <code>TaskBoardRoot</code> keeps its natural
              minimum width, so columns never become independent scroll regions.
            </p>
            <Preview previewClassName="h-[42rem] items-stretch p-0">
              <Preview.Canvas>
                <TaskBoardComposition />
              </Preview.Canvas>
              <Preview.Code html={code.board} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="column-empty" title="Column empty states">
            <p className="mb-4 text-sm text-foreground/70">
              Sparse tasks leave In Review / Done / Closed empty so{" "}
              <code>TaskBoardColumnEmptyIdle</code> shows. Drag onto an empty column for Allowed /
              Blocked copy (Closed is not blocked in this demo — see{" "}
              <Link to="/components/task-dnd">TaskDnd</Link>).
            </p>
            <Preview previewClassName="h-[42rem] items-stretch p-0">
              <Preview.Canvas>
                <TaskBoardEmptyColumnsComposition />
              </Preview.Canvas>
              <Preview.Code html={code.empty} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-virtualization" title="Source-repo virtualization">
        <p className="mb-4 text-sm text-foreground/70">
          Slock currently uses a native shared <code>overflow-auto</code> container, not{" "}
          <code>ScrollArea</code>. Each board column mounts a variable-height virtual stack against
          that same ref. In a Raft UI consumer, use the <code>ScrollAreaViewport</code> ref in the
          same place; virtualization remains product code, outside <code>TaskBoard</code>.
        </p>
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.sourceVirtualization} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
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
