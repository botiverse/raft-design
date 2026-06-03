import { createFileRoute } from "@tanstack/react-router";
import { ContextMenuDivider, MenuItem } from "@slock-ui/ui";

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
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { ContextMenuDivider } from "@slock-ui/ui";

<ContextMenuDivider />`,
  usage: `<MenuItem>Mark as read</MenuItem>
<MenuItem>Pin</MenuItem>
<ContextMenuDivider />
<MenuItem>Delete</MenuItem>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "orientation",
    type: '"horizontal" | "vertical"',
    default: '"horizontal"',
    description:
      "Base UI Separator orientation. The slock-ui recipe styles the horizontal menu rule.",
  },
  {
    name: "...props",
    type: "Base UI Separator.Props",
    description: "All Base UI separator props plus native div attributes.",
  },
];

export const Route = createFileRoute("/components/context-menu-divider")({
  component: ContextMenuDividerDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ContextMenuDividerDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ContextMenuDivider"
      description="A 2px black rule separating groups of context-menu items."
      overview={
        <Differences from="ContextMenuDivider">
          <li>brutal styling reproduced 1:1 (border-t-2 border-black, no margin)</li>
          <li>
            built on Base UI&rsquo;s <code>Separator</code> (the source was a bare <code>div</code>)
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

      <DocSection id="usage" title="Usage">
        <Example html={code.usage}>
          <div className="w-56 border-2 border-black bg-white">
            <MenuItem>Mark as read</MenuItem>
            <MenuItem>Pin</MenuItem>
            <ContextMenuDivider />
            <MenuItem>Delete</MenuItem>
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
