import { createFileRoute } from "@tanstack/react-router";
import { ContextMenuDivider, MenuItem } from "@slock-ui/ui";
import { Archive, Pin, Trash2 } from "lucide-react";

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
  { id: "icons", title: "Icons" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { MenuItem } from "@slock-ui/ui";

<MenuItem onClick={...}>Mark as read</MenuItem>`,
  icons: `import { Pin, Archive, Trash2 } from "lucide-react";

<MenuItem icon={<Pin size={14} />}>Pin</MenuItem>
<MenuItem icon={<Archive size={14} />}>Archive</MenuItem>
<MenuItem icon={<Trash2 size={14} />} trailing="⌫">Delete</MenuItem>`,
  states: `<MenuItem>Default</MenuItem>
<MenuItem disabled>Disabled</MenuItem>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "icon",
    type: "ReactNode",
    description: "Optional leading icon. Conventionally a lucide icon at size={14}.",
  },
  {
    name: "trailing",
    type: "ReactNode",
    description: "Optional right-aligned slot (e.g. a shortcut hint).",
  },
  {
    name: "...props",
    type: "ButtonHTMLAttributes",
    description: 'Native button attributes. role defaults to "menuitem", type to "button".',
  },
];

export const Route = createFileRoute("/components/menu-item")({
  component: MenuItemDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function MenuItemDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="MenuItem"
      description="A pure-action menu row — click to run an action, no selected state."
      overview={
        <Differences from="MenuItem">
          <li>brutal styling reproduced 1:1 (yellow/30 hover, compact-viewport density)</li>
          <li>
            built on Base UI&rsquo;s <code>Button</code> but intentionally not Base UI{" "}
            <code>Menu.Item</code>, so it works standalone without a <code>Menu.Root</code> ancestor
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

      <DocSection id="icons" title="Icons">
        <Example html={code.icons}>
          <div className="w-56 border-2 border-black bg-white">
            <MenuItem icon={<Pin size={14} />}>Pin</MenuItem>
            <MenuItem icon={<Archive size={14} />}>Archive</MenuItem>
            <ContextMenuDivider />
            <MenuItem icon={<Trash2 size={14} />} trailing="⌫">
              Delete
            </MenuItem>
          </div>
        </Example>
      </DocSection>

      <DocSection id="states" title="States">
        <div className="space-y-4">
          <Example html={code.states}>
            <div className="w-56 border-2 border-black bg-white">
              <MenuItem>Default</MenuItem>
              <MenuItem disabled>Disabled</MenuItem>
            </div>
          </Example>
          <Callout>
            Right-click menus intentionally don&rsquo;t differentiate destructive vs non-destructive
            at the row level — every irreversible action is gated by a confirm dialog, so the menu
            stays visually uniform.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
