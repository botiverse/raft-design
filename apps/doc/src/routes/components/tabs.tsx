import { createFileRoute } from "@tanstack/react-router";
import {
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsLabel,
  TabsList,
  TabsPanel,
  TabsTab,
  useOrderedTabs,
  type OrderedTabItem,
} from "@slock/ui";
import { Bell, Files, MessageSquare, Users, type LucideIcon } from "lucide-react";
import { useState } from "react";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";
import LegacyReorderablePanelTabs, {
  type PanelTabItem,
} from "../../../../../packages/ui/src/legacy/ReorderablePanelTabs.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "anatomy", title: "Anatomy" },
  { id: "basic", title: "Basic" },
  { id: "reorderable", title: "Reorderable" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling", "Optimize border rendering"] as const;

const SNIPPETS = {
  anatomy: `import { Tabs, TabsLabel, TabsList, TabsPanel, TabsTab } from "@slock/ui";

<Tabs value={value} onValueChange={setValue}>
  <TabsList>
    <TabsTab value="chat">
      <MessageSquare />
      <TabsLabel>Chat</TabsLabel>
    </TabsTab>
    <TabsTab value="files">
      <Files />
      <TabsLabel>Files</TabsLabel>
    </TabsTab>
  </TabsList>
  <TabsPanel value="chat">Chat content</TabsPanel>
  <TabsPanel value="files">Files content</TabsPanel>
</Tabs>`,
  reorderable: `import { SortableTabsList, SortableTabsTab, Tabs, TabsLabel, useOrderedTabs } from "@slock/ui";

const orderedTabs = useOrderedTabs(TABS, order);

<Tabs value={active} onValueChange={setActive}>
  <SortableTabsList value={order} onReorder={setOrder}>
    {orderedTabs.map((tab) => (
      <SortableTabsTab key={tab.id} value={tab.id}>
        <tab.icon />
        <TabsLabel>{tab.label}</TabsLabel>
      </SortableTabsTab>
    ))}
  </SortableTabsList>
</Tabs>`,
  sourceReorderable: `const ordered = useOrderedPanelTabs(TABS, storedOrder);

<ReorderablePanelTabs
  tabs={ordered}
  activeTab={active}
  onSelectTab={setActive}
  onReorderTabs={persistOrder}
/>`,
  currentReorderable: `<Tabs value={active} onValueChange={setActive}>
  <SortableTabsList value={order} onReorder={setOrder}>
    {orderedTabs.map((tab) => (
      <SortableTabsTab key={tab.id} value={tab.id} data-testid={\`panel-tab-\${tab.id}\`}>
        <tab.icon />
        <TabsLabel>{tab.label}</TabsLabel>
      </SortableTabsTab>
    ))}
  </SortableTabsList>
</Tabs>`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "Tabs.value", type: "T", description: "Controlled active tab value." },
  {
    name: "Tabs.onValueChange",
    type: "(value: T) => void",
    description: "Called when Base UI changes the active tab.",
  },
  {
    name: "SortableTabsList.value",
    type: "T[]",
    description: "Current tab order.",
  },
  {
    name: "SortableTabsList.onReorder",
    type: "(value: T[]) => void",
    description: "Receives the new order after drag end.",
  },
  {
    name: "SortableTabsTab.value",
    type: "T",
    description: "A sortable tab value passed to Base UI and dnd-kit.",
  },
  { name: "TabsTab.value", type: "T", description: "The tab value passed to Base UI." },
];

export const Route = createFileRoute("/components/tabs")({
  component: TabsDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

type TabId = "chat" | "files" | "members" | "alerts";

type TabItem = OrderedTabItem<TabId> & {
  label: string;
  icon: LucideIcon;
};

const TABS: readonly TabItem[] = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "files", label: "Files", icon: Files },
  { id: "members", label: "Members", icon: Users },
  { id: "alerts", label: "Alerts", icon: Bell },
];

const SOURCE_TABS: PanelTabItem<TabId>[] = TABS.map((tab) => ({
  id: tab.id,
  label: tab.label,
  icon: tab.icon,
}));

function TabsDoc() {
  const code = Route.useLoaderData();
  const [basicValue, setBasicValue] = useState<TabId>("chat");
  const [order, setOrder] = useState<TabId[]>(["chat", "files", "members", "alerts"]);
  const [active, setActive] = useState<TabId>("chat");
  const [sourceOrder, setSourceOrder] = useState<TabId[]>(["chat", "files", "members", "alerts"]);
  const [sourceActive, setSourceActive] = useState<TabId>("chat");
  const [currentOrder, setCurrentOrder] = useState<TabId[]>(["chat", "files", "members", "alerts"]);
  const [currentActive, setCurrentActive] = useState<TabId>("chat");
  const orderedTabs = useOrderedTabs(TABS, order);
  const sourceTabs = useOrderedTabs(SOURCE_TABS, sourceOrder);
  const currentTabs = useOrderedTabs(TABS, currentOrder);

  return (
    <DocPage
      title="Tabs"
      description="A Base UI Tabs family with an optional dnd-kit reorder mode."
      overview={
        <Differences from="ReorderablePanelTabs">
          <li>
            renamed to Base UI terminology: <code>Tabs</code>, <code>TabsList</code>,{" "}
            <code>TabsTab</code>, <code>TabsPanel</code>
          </li>
          <li>
            source reorder behavior is now isolated in <code>SortableTabsList</code>; draggable tabs
            use <code>SortableTabsTab</code>
          </li>
          <li>
            brutal source styling is reproduced on the list/tab slots; svg size is controlled by CSS
            on <code>TabsTab</code>
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

      <DocSection id="basic" title="Basic">
        <Example html={code.anatomy}>
          <Tabs value={basicValue} onValueChange={setBasicValue}>
            <TabsList className="max-w-md">
              {TABS.slice(0, 3).map((tab) => (
                <TabsTab key={tab.id} value={tab.id}>
                  <tab.icon />
                  <TabsLabel>{tab.label}</TabsLabel>
                </TabsTab>
              ))}
            </TabsList>
            <TabsPanel value="chat" className="max-w-md p-3 text-sm text-black/60">
              Chat content
            </TabsPanel>
            <TabsPanel value="files" className="max-w-md p-3 text-sm text-black/60">
              Files content
            </TabsPanel>
            <TabsPanel value="members" className="max-w-md p-3 text-sm text-black/60">
              Members content
            </TabsPanel>
          </Tabs>
        </Example>
      </DocSection>

      <DocSection id="reorderable" title="Reorderable">
        <div className="space-y-4">
          <Example html={code.reorderable}>
            <Tabs value={active} onValueChange={setActive}>
              <SortableTabsList value={order} onReorder={setOrder} className="max-w-md">
                {orderedTabs.map((tab) => (
                  <SortableTabsTab key={tab.id} value={tab.id}>
                    <tab.icon />
                    <TabsLabel>{tab.label}</TabsLabel>
                  </SortableTabsTab>
                ))}
              </SortableTabsList>
            </Tabs>
          </Example>
          <Callout>
            Dragging is opt-in. Pair <code>SortableTabsList</code> with <code>SortableTabsTab</code>{" "}
            and <code>useOrderedTabs</code> to reconcile a stored order with declared tabs.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Reorderable",
              status: "match",
              note: "Source always mounted dnd-kit inside ReorderablePanelTabs. Current keeps the same yellow active tab, border dividers, hidden scrollbar, sensors, and horizontal transforms, but exposes the behavior through SortableTabsList and SortableTabsTab.",
              source: (
                <LegacyReorderablePanelTabs
                  tabs={sourceTabs}
                  activeTab={sourceActive}
                  onSelectTab={setSourceActive}
                  onReorderTabs={setSourceOrder}
                />
              ),
              current: (
                <Tabs value={currentActive} onValueChange={setCurrentActive}>
                  <SortableTabsList
                    value={currentOrder}
                    onReorder={setCurrentOrder}
                    className="max-w-md"
                  >
                    {currentTabs.map((tab) => (
                      <SortableTabsTab
                        key={tab.id}
                        value={tab.id}
                        data-testid={`panel-tab-${tab.id}`}
                      >
                        <tab.icon />
                        <TabsLabel>{tab.label}</TabsLabel>
                      </SortableTabsTab>
                    ))}
                  </SortableTabsList>
                </Tabs>
              ),
              sourceCode: code.sourceReorderable,
              currentCode: code.currentReorderable,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
