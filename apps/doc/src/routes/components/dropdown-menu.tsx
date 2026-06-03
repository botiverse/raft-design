import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  DropdownMenu,
  DropdownMenuActionItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@slock-ui/ui";
import { Check, Plus } from "lucide-react";

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
  "Add label, group, checkbox, radio, and submenu parts when a source callsite needs them",
] as const;

const SNIPPETS = {
  anatomy: `import {
  DropdownMenu,
  DropdownMenuActionItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@slock-ui/ui";

<DropdownMenu>
  <DropdownMenuTrigger>Switch server</DropdownMenuTrigger>
  <DropdownMenuContent className="w-64">
    <DropdownMenuItem>
      <Check />
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate">Slock</div>
        <div className="truncate font-mono text-xs text-black/40">/slock</div>
      </div>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuActionItem>
      <Plus />
      <span className="min-w-0 flex-1 text-left">Switch or Create Server</span>
    </DropdownMenuActionItem>
  </DropdownMenuContent>
</DropdownMenu>`,
  opened: `<DropdownMenu open modal={false} triggerId="opened-server-trigger">
  <DropdownMenuTrigger id="opened-server-trigger" render={<Button size="md" />}>
    Switch server
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DropdownMenuItem className="font-bold">
        <Check />
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate">Slock</div>
          <div className="truncate font-mono text-xs text-black/40">/slock</div>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Check className="opacity-0" />
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate">Design Guild</div>
          <div className="truncate font-mono text-xs text-black/40">/design</div>
        </div>
        <span className="ml-auto shrink-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">4</span>
      </DropdownMenuItem>
    </div>
    <DropdownMenuSeparator />
    <DropdownMenuActionItem>
      <Plus />
      <span className="min-w-0 flex-1 text-left">Join Community</span>
    </DropdownMenuActionItem>
  </DropdownMenuContent>
</DropdownMenu>`,
} as const;

const OPENED_ROW_PREVIEW = (
  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
    <DropdownMenuItem className="font-bold">
      <Check />
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate">Slock</div>
        <div className="truncate font-mono text-xs text-black/40">/slock</div>
      </div>
    </DropdownMenuItem>
    <DropdownMenuItem className="bg-brutal-yellow">
      <Check className="opacity-0" />
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate">Design Guild</div>
        <div className="truncate font-mono text-xs text-black/40">/design</div>
      </div>
      <span className="ml-auto shrink-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
        4
      </span>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Check className="opacity-0" />
      <div className="min-w-0 flex-1 text-left">
        <div className="truncate">Open Source</div>
        <div className="truncate font-mono text-xs text-black/40">/oss</div>
      </div>
      <span className="ml-auto shrink-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
        12
      </span>
    </DropdownMenuItem>
  </div>
);

const PROPS: readonly PropRow[] = [
  {
    name: "DropdownMenu",
    type: "Base UI Menu.Root.Props",
    description: "Owns open state, focus, Escape, outside press, and menu dismissal.",
  },
  {
    name: "DropdownMenuTrigger",
    type: "Base UI Menu.Trigger.Props",
    description: "Button-like trigger. Compose custom controls with Base UI's render prop.",
  },
  {
    name: "DropdownMenuContent",
    type: "Base UI Popup + Positioner props",
    description: "Portaled card shell. Defaults to side=bottom, align=start, sideOffset=4.",
  },
  {
    name: "DropdownMenuItem",
    type: "Base UI Menu.Item.Props",
    description:
      "Source server-switcher row styling with keyboard highlight. Compose special rows with className.",
  },
  {
    name: "DropdownMenuActionItem",
    type: "DropdownMenuItem props",
    description: "Source server-switcher action row styling: bold text and pink highlight.",
  },
  {
    name: "DropdownMenuSeparator",
    type: "Base UI Separator.Props",
    description: "Source server-switcher divider styling as the separator part.",
  },
];

export const Route = createFileRoute("/components/dropdown-menu")({
  component: DropdownMenuDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ServerRows() {
  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <DropdownMenuItem className="font-bold">
          <Check />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate">Slock</div>
            <div className="truncate font-mono text-xs text-black/40">/slock</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Check className="opacity-0" />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate">Design Guild</div>
            <div className="truncate font-mono text-xs text-black/40">/design</div>
          </div>
          <span className="ml-auto shrink-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            4
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Check className="opacity-0" />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate">Open Source</div>
            <div className="truncate font-mono text-xs text-black/40">/oss</div>
          </div>
          <span className="ml-auto shrink-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
            12
          </span>
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuActionItem>
        <Plus />
        <span className="min-w-0 flex-1 text-left">Join Community</span>
      </DropdownMenuActionItem>
      <DropdownMenuActionItem>
        <Plus />
        <span className="min-w-0 flex-1 text-left">Switch or Create Server</span>
      </DropdownMenuActionItem>
    </>
  );
}

function DropdownMenuDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="DropdownMenu"
      description="A trigger-driven menu family built on Base UI Menu and styled from the source server switcher."
      overview={
        <Differences from="ServerSwitcherMenu">
          <li>
            source option styling is preserved: px-3/py-2 rows, compact viewport density, yellow
            server highlight, pink action highlight, unread badge, and border-t-2 separator
          </li>
          <li>
            source open gate, outside click, and ESC handling move to Base UI Menu; callers compose
            rows as children instead of passing icon or trailing props
          </li>
          <li>
            difference from source: this component is the generic dropdown primitive; actual server
            switching, join, navigation, and unread data remain app-owned
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
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="md" />}>Switch server</DropdownMenuTrigger>
              <DropdownMenuContent className="flex w-64 flex-col">
                <ServerRows />
              </DropdownMenuContent>
            </DropdownMenu>
          </Example>
          <Callout>
            The demo does not model server-switching behavior. It is intentionally focused on
            preserving the source option visuals while moving menu mechanics to Base UI.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="opened" title="Opened">
        <Example html={code.opened}>
          <DropdownMenu open modal={false} triggerId="opened-server-trigger">
            <DropdownMenuTrigger id="opened-server-trigger" render={<Button size="md" />}>
              Switch server
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex w-64 flex-col">
              {OPENED_ROW_PREVIEW}
              <DropdownMenuSeparator />
              <DropdownMenuActionItem>
                <Plus />
                <span className="min-w-0 flex-1 text-left">Join Community</span>
              </DropdownMenuActionItem>
              <DropdownMenuActionItem className="bg-brutal-pink">
                <Plus />
                <span className="min-w-0 flex-1 text-left">Switch or Create Server</span>
              </DropdownMenuActionItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Example>
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white text-sm text-gray-700">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] border-b border-gray-200 bg-gray-50 font-medium text-gray-500">
            <div className="px-3 py-2">Old source entry</div>
            <div className="border-l border-gray-200 px-3 py-2">New composition</div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <div className="px-3 py-2 text-gray-400 line-through decoration-gray-400 decoration-2">
              ServerSwitcherMenu
            </div>
            <div className="border-l border-gray-200 px-3 py-2">
              <code>DropdownMenu</code> + <code>DropdownMenuContent</code> +{" "}
              <code>DropdownMenuItem</code> + <code>DropdownMenuActionItem</code> +{" "}
              <code>DropdownMenuSeparator</code>
            </div>
          </div>
          <div className="border-t border-gray-200 px-3 py-2 text-gray-500">
            Source difference: server data, navigation, join flow, unread counts, and open state are
            app-owned; this component only preserves the menu UI through composition.
          </div>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
