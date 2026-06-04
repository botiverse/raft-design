import { createFileRoute } from "@tanstack/react-router";
import { Button, Lightbox } from "@slock/ui";
import { useState } from "react";

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
  { id: "demo", title: "Demo" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling (if any beyond the dim backdrop)"] as const;

const SNIPPETS = {
  anatomy: `import { Lightbox } from "@slock/ui";

{open && (
  <Lightbox onClose={() => setOpen(false)} className="flex items-center justify-center">
    <img src={url} className="max-h-[90vh] max-w-[90vw]" />
  </Lightbox>
)}`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "onClose", type: "() => void", description: "Called on backdrop click or ESC." },
  {
    name: "children",
    type: "ReactNode",
    description: "Overlay content (you control layout via className).",
  },
  { name: "zIndex", type: "number", default: "70", description: "Stacking order." },
  { name: "backdropClass", type: "string", default: '"bg-black/75"', description: "Dim color." },
  {
    name: "dismissOnBackdrop",
    type: "boolean",
    default: "true",
    description: "Click on the dim area closes.",
  },
  {
    name: "className",
    type: "string",
    description: 'Layout classes on the overlay (e.g. "flex flex-col").',
  },
  {
    name: "positionClass",
    type: "string",
    default: '"fixed inset-0"',
    description: "Overlay positioning.",
  },
  {
    name: "lockBodyScroll",
    type: "boolean",
    default: "true",
    description: "Manual body scroll lock matching the source.",
  },
  {
    name: "scrollIntoViewOnMount",
    type: "boolean",
    default: "false",
    description: "Scrolls the overlay root into view after mount.",
  },
];

export const Route = createFileRoute("/components/lightbox")({
  component: LightboxDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function LightboxDoc() {
  const code = Route.useLoaderData();
  const [open, setOpen] = useState(false);

  return (
    <DocPage
      title="Lightbox"
      description="A full-screen dark-backdrop overlay for lightboxes and sheets."
      overview={
        <Differences from="Lightbox">
          <li>source portal, body scroll lock, Escape, and Cmd/Ctrl+W close behavior preserved</li>
          <li>
            styling moved into a <code>tv()</code> slot with brutal/elegant theme hooks
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

      <DocSection id="demo" title="Demo">
        <div className="space-y-4">
          <Example html={code.anatomy}>
            <Button tone="cyan" onClick={() => setOpen(true)}>
              Open lightbox
            </Button>
            {open && (
              <Lightbox onClose={() => setOpen(false)} className="flex items-center justify-center">
                <div className="border-2 border-black bg-white p-8 text-center shadow-[var(--shadow-lg)]">
                  <p className="font-bold">Click the dim area or press Esc to close.</p>
                </div>
              </Lightbox>
            )}
          </Example>
          <Callout>
            Content is layout-agnostic — the overlay only owns the dim and dismiss. Clicking the dim
            area (not the content) calls <code>onClose</code>.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
