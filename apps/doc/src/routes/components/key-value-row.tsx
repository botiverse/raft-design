import { createFileRoute } from "@tanstack/react-router";
import { KeyValueRow } from "@slock/ui";

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
  { id: "variants", title: "Variants" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { KeyValueRow } from "@slock/ui";

<KeyValueRow label="Display name" value="Ada Lovelace" />`,
  variants: `<KeyValueRow label="Display name" value="Ada Lovelace" />
<KeyValueRow label="Email" value="ada@example.com" mono breakAll />`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "label", type: "ReactNode", description: "Muted label rendered above the value." },
  { name: "value", type: "ReactNode", description: "The value content." },
  {
    name: "mono",
    type: "boolean",
    default: "false",
    description: "Render the value in font-mono.",
  },
  {
    name: "breakAll",
    type: "boolean",
    default: "false",
    description: "Render the value with break-all (long emails, hostnames).",
  },
  {
    name: "action",
    type: "ReactNode",
    description: "Optional inline trailing element by the label.",
  },
  { name: "valueClassName", type: "string", description: "Additional classes on the value cell." },
  {
    name: "...props",
    type: "HTMLAttributes<HTMLDivElement>",
    description: "Native div attributes on the outer wrapper.",
  },
];

export const Route = createFileRoute("/components/key-value-row")({
  component: KeyValueRowDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function KeyValueRowDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="KeyValueRow"
      description="A small muted label above a value cell — the detail-panel key/value convention."
      overview={
        <Differences from="KeyValueRow">
          <li>brutal styling reproduced 1:1 (text-xs text-black/50 label, text-sm value)</li>
          <li>
            the <code>default</code> export is now a named <code>KeyValueRow</code> export
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

      <DocSection id="variants" title="Variants">
        <Example html={code.variants}>
          <div className="flex w-72 flex-col gap-4">
            <KeyValueRow label="Display name" value="Ada Lovelace" />
            <KeyValueRow label="Email" value="ada@example.com" mono breakAll />
          </div>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
