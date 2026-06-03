import { createFileRoute } from "@tanstack/react-router";
import { PreviewShell } from "@slock-ui/ui";

import { Callout } from "#/components/callout.tsx";
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
  anatomy: `import { PreviewShell } from "@slock-ui/ui";

<PreviewShell className="p-3">Quoted message preview</PreviewShell>`,
  variants: `<PreviewShell className="p-3">Default surface</PreviewShell>
<PreviewShell variant="muted" className="p-3">Unavailable</PreviewShell>
<PreviewShell onClick={() => {}} className="p-3">Clickable (button)</PreviewShell>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"default" | "muted"',
    default: '"default"',
    description: "default is the subtle preview skin; muted is the unavailable look.",
  },
  {
    name: "onClick",
    type: "() => void",
    description: "When set, the root renders as a <button>; otherwise a <div>.",
  },
  {
    name: "className",
    type: "string",
    description: "Caller-owned layout, appended after the skin (use ! to override tokens).",
  },
  { name: "children", type: "ReactNode", description: "Surface content." },
];

export const Route = createFileRoute("/components/preview-shell")({
  component: PreviewShellDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function PreviewShellDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="PreviewShell"
      description="The canonical subtle preview surface skin — border, white bg, hover deepen."
      overview={
        <Differences from="PreviewShell">
          <li>brutal styling reproduced 1:1 (black/15 border, white bg, hover bg + border)</li>
          <li>
            clickable previews are built on Base UI&rsquo;s <code>Button</code> (the source used a
            native <code>button</code>)
          </li>
          <li>
            <code>shadow-brutal-sm</code> (muted hover) maps to the brutal <code>--shadow</code>{" "}
            token
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
        <div className="space-y-4">
          <Example html={code.variants}>
            <div className="flex w-72 flex-col gap-3">
              <PreviewShell className="p-3">Default surface</PreviewShell>
              <PreviewShell variant="muted" className="p-3">
                Unavailable
              </PreviewShell>
              <PreviewShell onClick={() => {}} className="w-full p-3 text-left">
                Clickable (button)
              </PreviewShell>
            </div>
          </Example>
          <Callout>
            PreviewShell owns only the skin — layout is caller-supplied via <code>className</code>.
            There&rsquo;s no active token; the press state inherits hover.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
