import { createFileRoute } from "@tanstack/react-router";
import { NotificationCenter, type NotificationCenterEntry } from "@slock/ui";

import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "anatomy", title: "Anatomy" },
  { id: "populated", title: "Populated" },
  { id: "empty", title: "Empty" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { NotificationCenter } from "@slock/ui";

<NotificationCenter viewport="desktop" entries={entries} />`,
} as const;

const ENTRIES: NotificationCenterEntry[] = [
  {
    id: "1",
    kind: "success",
    title: "Deploy succeeded",
    body: "slock-ui shipped to production.",
    actions: [{ label: "View", variant: "primary" }, { label: "Dismiss" }],
  },
  {
    id: "2",
    kind: "warning",
    title: "Storage almost full",
    body: "92% of your quota is used.",
    read: true,
  },
  { id: "3", kind: "info", title: "New comment on #design" },
];

const PROPS: readonly PropRow[] = [
  {
    name: "entries",
    type: "NotificationCenterEntry[]",
    description: "Each: { id, kind, title, body?, icon?, actions?, read? }.",
  },
  {
    name: "viewport",
    type: '"desktop" | "mobile"',
    description: "desktop = fixed height; mobile = grow-then-cap.",
  },
  {
    name: "size",
    type: '"compact" | "regular" | "large"',
    default: '"regular"',
    description: "Frame height token.",
  },
  { name: "title", type: "ReactNode", default: '"Notifications"', description: "Header eyebrow." },
  { name: "countLabel", type: "ReactNode", description: "Overrides the default count text." },
  { name: "emptyState", type: "ReactNode", description: "Overrides the default empty state." },
  {
    name: "closeOnEscape",
    type: "boolean",
    default: "true",
    description: "Matches source ESC close.",
  },
  { name: "onClose", type: "() => void", description: "Called when ESC closes the center." },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes.",
  },
];

export const Route = createFileRoute("/components/notification-center")({
  component: NotificationCenterDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function NotificationCenterDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="NotificationCenter"
      description="A notification-center card with kind-coded entries and action buttons."
      overview={
        <Differences from="NotificationCenter">
          <li>brutal styling reproduced 1:1 (cream header, kind dots, divided list)</li>
          <li>
            source optional ESC close hook preserved via <code>closeOnEscape</code> +{" "}
            <code>onClose</code>
          </li>
          <li>
            <code>card-brutal</code> → <code>--shadow-hover</code>; action buttons reproduce the{" "}
            <code>btn-brutal</code> tier (4px/6px/2px) 1:1
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="populated" title="Populated">
        <Example html={code.anatomy}>
          <NotificationCenter viewport="desktop" entries={ENTRIES} />
        </Example>
      </DocSection>

      <DocSection id="empty" title="Empty">
        <Example html={code.anatomy}>
          <NotificationCenter viewport="desktop" size="compact" entries={[]} />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
