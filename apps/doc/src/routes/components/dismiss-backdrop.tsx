import { createFileRoute } from "@tanstack/react-router";
import { Button, DismissBackdrop, MenuItem } from "@slock-ui/ui";
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

const TODOS = ["No visual styling — behavior primitive only"] as const;

const SNIPPETS = {
  anatomy: `import { DismissBackdrop } from "@slock-ui/ui";

{open && <DismissBackdrop onDismiss={() => setOpen(false)} />}`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "onDismiss",
    type: "() => void",
    description: "Called on outside click (and ESC, via base-ui).",
  },
  { name: "zIndex", type: "number", default: "50", description: "Stacking order of the catcher." },
  {
    name: "trapContextMenu",
    type: "boolean",
    default: "false",
    description: "Intercept right-click too.",
  },
  {
    name: "stopPropagation",
    type: "boolean",
    default: "false",
    description: "Shield clicks instead of dismissing (iOS).",
  },
];

export const Route = createFileRoute("/components/dismiss-backdrop")({
  component: DismissBackdropDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function DismissBackdropDoc() {
  const code = Route.useLoaderData();
  const [open, setOpen] = useState(false);

  return (
    <DocPage
      title="DismissBackdrop"
      description="An invisible click-outside catcher for hand-rolled menus and drawers."
      overview={
        <Differences from="DismissBackdrop">
          <li>rebuilt on base-ui Dialog (non-modal) — the portal replaces createPortal</li>
          <li>no scroll lock or focus trap — it stays a pure dismiss surface</li>
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
            <div className="relative">
              <Button onClick={() => setOpen((value) => !value)}>Toggle menu</Button>
              {open && (
                <>
                  <DismissBackdrop onDismiss={() => setOpen(false)} />
                  <div className="absolute left-0 top-[calc(100%+8px)] z-[51] w-48 border-2 border-black bg-white shadow-[var(--shadow-hover)]">
                    <MenuItem onClick={() => setOpen(false)}>Rename</MenuItem>
                    <MenuItem onClick={() => setOpen(false)}>Duplicate</MenuItem>
                  </div>
                </>
              )}
            </div>
          </Example>
          <Callout>
            Click anywhere outside the menu (or press Esc) to dismiss. The menu sits above the
            backdrop via a higher z-index.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
