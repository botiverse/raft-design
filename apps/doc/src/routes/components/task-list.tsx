import { createFileRoute, Link } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";
import {
  TaskListComposition,
  TaskListEmptySectionsComposition,
} from "#/modules/task-list/compositions/task-list.composition.tsx";
import taskListCompositionSource from "#/modules/task-list/compositions/task-list.composition.tsx?raw";

const ANATOMY_SNIPPET = `<TaskListRoot>
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
</TaskListRoot>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const LIST_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"div">',
    description: "List view root for TaskSection children.",
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
    name: "status",
    type: '"todo" | "in_progress" | "in_review" | "done" | "closed"',
    description: "Task status that drives the badge surface color.",
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

const SNIPPETS = {
  anatomy: ANATOMY_SNIPPET,
  list: stripSourceCodeBlocks(taskListCompositionSource),
} as const;

export const Route = createFileRoute("/components/task-list")({
  component: TaskListDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function TaskListDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="TaskList"
      description="Stacked status sections for the Tasks list view. Compose TaskCard (and optionally TaskDnd) as children."
      overview={
        <Differences from="Slock Tasks list">
          <li>
            peer of <code>TasksPanel</code>, <Link to="/components/task-board">TaskBoard</Link>,{" "}
            <Link to="/components/task-dnd">TaskDnd</Link>, and{" "}
            <Link to="/components/task-card">TaskCard</Link>
          </li>
          <li>owns section layout, collapse, and empty-section structure only</li>
          <li>does not own filters, create flows, or task workflow state</li>
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
            <TaskListComposition />
          </Preview.Canvas>
          <Preview.Code html={code.list} />
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
          <DocSubsection parentId="usage" id="status-sections" title="Status sections">
            <p className="mb-4 text-sm text-foreground/70">
              Group cards by status with collapsible sections. Collapse and counts are driven by the
              composition.
            </p>
            <Preview
              previewTheme="brutal"
              previewMode="light"
              previewClassName="h-[42rem] items-stretch p-0"
            >
              <Preview.Canvas>
                <TaskListComposition />
              </Preview.Canvas>
              <Preview.Code html={code.list} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="section-empty" title="Section empty states">
            <p className="mb-4 text-sm text-foreground/70">
              Sparse tasks leave In Review / Done / Closed empty so <code>TaskSectionEmpty</code>{" "}
              shows. List has a single empty host (no DnD idle/allowed/blocked triad).
            </p>
            <Preview
              previewTheme="brutal"
              previewMode="light"
              previewClassName="h-[42rem] items-stretch p-0"
            >
              <Preview.Canvas>
                <TaskListEmptySectionsComposition />
              </Preview.Canvas>
              <Preview.Code html={code.list} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-list-root" title="TaskListRoot">
            <PropsTable rows={LIST_ROOT_PROPS} />
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
        </div>
      </DocSection>
    </DocPage>
  );
}
