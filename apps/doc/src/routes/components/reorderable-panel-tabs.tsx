import { createFileRoute } from "@tanstack/react-router";
import { ReorderablePanelTabs, type PanelTabItem } from "@slock-ui/ui";
import { Bell, Files, MessageSquare, Users } from "lucide-react";
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

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { ReorderablePanelTabs, useOrderedPanelTabs } from "@slock-ui/ui";

const ordered = useOrderedPanelTabs(TABS, storedOrder);

<ReorderablePanelTabs
  tabs={ordered}
  activeTab={active}
  onSelectTab={setActive}
  onReorderTabs={persistOrder}
/>`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "tabs", type: "PanelTabItem<T>[]", description: "Each: { id, label, icon }." },
  { name: "activeTab", type: "T", description: "Currently active tab id." },
  {
    name: "activeTabRef",
    type: "RefObject<HTMLButtonElement>",
    description: "Ref forwarded to the active tab.",
  },
  { name: "onSelectTab", type: "(tab: T) => void", description: "Tab click handler." },
  {
    name: "onReorderTabs",
    type: "(tabs: T[]) => void",
    description: "Called with the new id order after a drop.",
  },
];

export const Route = createFileRoute("/components/reorderable-panel-tabs")({
  component: ReorderablePanelTabsDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

type TabId = "chat" | "files" | "members" | "alerts";

const TABS: PanelTabItem<TabId>[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "files", label: "Files", icon: Files },
  { id: "members", label: "Members", icon: Users },
  { id: "alerts", label: "Alerts", icon: Bell },
];

function ReorderablePanelTabsDoc() {
  const code = Route.useLoaderData();
  const [order, setOrder] = useState<TabId[]>(["chat", "files", "members", "alerts"]);
  const [active, setActive] = useState<TabId>("chat");

  const tabs = order.map((id) => TABS.find((tab) => tab.id === id)!);

  return (
    <DocPage
      title="ReorderablePanelTabs"
      description="A horizontal tab strip with drag-to-reorder."
      overview={
        <Differences from="ReorderablePanelTabs">
          <li>
            brutal styling reproduced 1:1 (yellow active tab, border-r-2 dividers, hidden scrollbar)
          </li>
          <li>
            tab buttons are built on Base UI&rsquo;s <code>Button</code> (the source used native
            buttons inside the dnd layer)
          </li>
          <li>
            source <code>@dnd-kit</code> sensors and sortable transforms preserved; styling moved
            into <code>tv()</code> slots
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
            <div className="w-full max-w-md">
              <ReorderablePanelTabs
                tabs={tabs}
                activeTab={active}
                onSelectTab={setActive}
                onReorderTabs={setOrder}
              />
            </div>
          </Example>
          <Callout>
            Drag a tab to reorder; <code>onReorderTabs</code> receives the new id order. Pair it
            with <code>useOrderedPanelTabs</code> to reconcile a stored order with the declared
            tabs.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
