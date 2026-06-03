import { createFileRoute } from "@tanstack/react-router";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@slock-ui/ui";
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
  { id: "demo", title: "Demo" },
  { id: "opened", title: "Opened" },
  { id: "migration", title: "Migration" },
  { id: "api", title: "API" },
] as const;

const TODOS = [
  "Add elegant family styling",
  "Add checkbox, radio, label, shortcut, and submenu parts when a source callsite needs them",
] as const;

const SNIPPETS = {
  anatomy: `import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@slock-ui/ui";

<ContextMenu>
  <ContextMenuTrigger>Right click me</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>
      <Pin size={14} />
      <span className="min-w-0 flex-1 truncate">Pin</span>
    </ContextMenuItem>
    <ContextMenuItem>
      <Archive size={14} />
      <span className="min-w-0 flex-1 truncate">Archive</span>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>
      <Trash2 size={14} />
      <span className="min-w-0 flex-1 truncate">Delete</span>
      <ContextMenuShortcut>⌫</ContextMenuShortcut>
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
  opened: `<div data-slot="context-menu-content" className="min-w-48 overflow-hidden border-2 border-black bg-white shadow-[var(--shadow-hover)]">
  <div data-slot="context-menu-item" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black">
    <Pin size={14} />
    <span className="min-w-0 flex-1 truncate">Pin</span>
  </div>
  <div data-slot="context-menu-item" className="flex w-full items-center gap-2 bg-brutal-yellow/30 px-3 py-2 text-left text-sm font-medium text-black">
    <Archive size={14} />
    <span className="min-w-0 flex-1 truncate">Archive</span>
  </div>
  <div data-slot="context-menu-separator" className="border-t-2 border-black" />
  <div data-slot="context-menu-item" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black">
    <Trash2 size={14} />
    <span className="min-w-0 flex-1 truncate">Delete</span>
    <span className="ml-auto shrink-0">⌫</span>
  </div>
</div>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ContextMenu",
    type: "Base UI ContextMenu.Root.Props",
    description: "Owns right-click open state and menu dismissal.",
  },
  {
    name: "ContextMenuTrigger",
    type: "Base UI ContextMenu.Trigger.Props",
    description: "Right-click target. Adds source-compatible select-none behavior.",
  },
  {
    name: "ContextMenuContent",
    type: "Base UI Popup + Positioner props",
    description: "Portaled card shell. Defaults to side=right, align=start, alignOffset=4.",
  },
  {
    name: "ContextMenuItem",
    type: "Base UI ContextMenu.Item.Props",
    description:
      "Source MenuItem row styling plus Base UI keyboard highlight and dismiss behavior.",
  },
  {
    name: "ContextMenuShortcut",
    type: "HTML span attributes",
    description: "Right-aligned shortcut slot composed inside ContextMenuItem.",
  },
  {
    name: "ContextMenuSeparator",
    type: "Base UI ContextMenu.Separator.Props",
    description: "Source ContextMenuDivider styling as the separator part.",
  },
];

export const Route = createFileRoute("/components/context-menu")({
  component: ContextMenuDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ContextMenuDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ContextMenu"
      description="A right-click menu family built on Base UI and styled like the source action menus."
      overview={
        <Differences from="MenuItem + ContextMenuDivider">
          <li>
            source row and divider styling preserved: yellow/30 item hover, compact viewport
            density, and border-t-2 separators
          </li>
          <li>
            source standalone primitives are now composition parts:
            <code> MenuItem</code> → <code>ContextMenuItem</code>, <code>ContextMenuDivider</code> →{" "}
            <code>ContextMenuSeparator</code>
          </li>
          <li>
            item content follows shadcn-style composition: icons, labels, and shortcuts are authored
            as children, with <code>ContextMenuShortcut</code> for the right-aligned slot
          </li>
          <li>
            Base UI now owns right-click opening, focus roving, keyboard highlight, Escape, outside
            press dismissal, portal, and positioning
          </li>
          <li>
            difference from source: item and separator parts are meant to live inside a{" "}
            <code>ContextMenu</code> tree; legacy standalone exports remain for compatibility
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
            <ContextMenu>
              <ContextMenuTrigger className="block w-full border-2 border-dashed border-black bg-brutal-cream px-4 py-8 text-center font-display text-sm font-bold text-black">
                Right click this surface
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <Pin size={14} />
                  <span className="min-w-0 flex-1 truncate">Pin</span>
                </ContextMenuItem>
                <ContextMenuItem>
                  <Archive size={14} />
                  <span className="min-w-0 flex-1 truncate">Archive</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>
                  <Trash2 size={14} />
                  <span className="min-w-0 flex-1 truncate">Delete</span>
                  <ContextMenuShortcut>⌫</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Example>
          <Callout>
            Keyboard navigation now uses Base UI&rsquo;s highlighted state, mapped to the same
            yellow/30 fill as pointer hover.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="opened" title="Opened">
        <Example html={code.opened}>
          <div className="min-w-48 overflow-hidden border-2 border-black bg-white shadow-[var(--shadow-hover)]">
            <div className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black">
              <Pin size={14} />
              <span className="min-w-0 flex-1 truncate">Pin</span>
            </div>
            <div className="flex w-full items-center gap-2 bg-brutal-yellow/30 px-3 py-2 text-left text-sm font-medium text-black">
              <Archive size={14} />
              <span className="min-w-0 flex-1 truncate">Archive</span>
            </div>
            <div className="border-t-2 border-black" />
            <div className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-black">
              <Trash2 size={14} />
              <span className="min-w-0 flex-1 truncate">Delete</span>
              <span className="ml-auto shrink-0">⌫</span>
            </div>
          </div>
        </Example>
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white text-sm text-gray-700">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b border-gray-200 bg-gray-50 font-medium text-gray-500">
            <div className="px-3 py-2">Old source entry</div>
            <div className="border-l border-gray-200 px-3 py-2">New composition part</div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-b border-gray-200">
            <div className="px-3 py-2 text-gray-400 line-through decoration-gray-400 decoration-2">
              MenuItem
            </div>
            <div className="border-l border-gray-200 px-3 py-2">
              <code>ContextMenuItem</code>
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="px-3 py-2 text-gray-400 line-through decoration-gray-400 decoration-2">
              ContextMenuDivider
            </div>
            <div className="border-l border-gray-200 px-3 py-2">
              <code>ContextMenuSeparator</code>
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
