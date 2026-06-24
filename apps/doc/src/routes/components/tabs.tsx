import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsBackground,
  TabsLabel,
  TabsList,
  TabsPanel,
  TabsTab,
  useOrderedTabs,
  type OrderedTabItem,
} from "cuvii-rui";
import { Bell, CreditCard, Files, Settings, Grid2X2, MessageSquare, Users } from "lucide-react";
import { useState, type ComponentType } from "react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import tabsReorderableDefaultCompositionSource from "#/compositions/tabs/reorderable-default-composition.tsx?raw";
import tabsReorderableDefaultBackgroundCompositionSource from "#/compositions/tabs/reorderable-default-background-composition.tsx?raw";
import tabsReorderableUnderlineCompositionSource from "#/compositions/tabs/reorderable-underline-composition.tsx?raw";
import tabsReorderableUnderlineBackgroundCompositionSource from "#/compositions/tabs/reorderable-underline-background-composition.tsx?raw";
import {
  TABS_SOURCE_COMPARISON_COMPOSITION,
  TABS_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/compositions/tabs-source-comparison.tsx";
import LegacyReorderablePanelTabs, {
  type PanelTabItem,
} from "../../../../../packages/ui/src/legacy/ReorderablePanelTabs.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "variants", title: "Variants" },
  { id: "icon-only", title: "Icons" },
  { id: "reorderable", title: "Reorderable" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const VARIANTS = ["default", "underline"] as const;

const SNIPPETS = {
  anatomy: `import { Tabs, TabsBackground, TabsList, TabsPanel, TabsTab } from "cuvii-rui";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsBackground />
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="activity">Activity</TabsTab>
    <TabsTab value="settings">Settings</TabsTab>
  </TabsList>
  <TabsPanel value="overview">Overview content</TabsPanel>
  <TabsPanel value="activity">Activity content</TabsPanel>
  <TabsPanel value="settings">Settings content</TabsPanel>
</Tabs>`,
  variants: `import {
  CreditCard,
  Settings,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsBackground, TabsLabel, TabsList, TabsPanel, TabsTab } from "cuvii-rui";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsBackground />
    <TabsTab value="overview">
      <MessageSquare />
      <TabsLabel>Overview</TabsLabel>
    </TabsTab>
    <TabsTab value="billing">
      <CreditCard />
      <TabsLabel>Billing</TabsLabel>
    </TabsTab>
  </TabsList>
  <TabsPanel value="overview" />
  <TabsPanel value="billing" />
</Tabs>

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTab value="overview">
      <MessageSquare />
      <TabsLabel>Overview</TabsLabel>
    </TabsTab>
    <TabsTab value="billing">
      <CreditCard />
      <TabsLabel>Billing</TabsLabel>
    </TabsTab>
  </TabsList>
  <TabsPanel value="overview" />
  <TabsPanel value="billing" />
</Tabs>

<Tabs defaultValue="overview">
  <TabsList variant="underline">
    <TabsBackground />
    <TabsTab value="overview">
      <MessageSquare />
      <TabsLabel>Overview</TabsLabel>
    </TabsTab>
    <TabsTab value="settings">
      <Settings />
      <TabsLabel>Settings</TabsLabel>
    </TabsTab>
  </TabsList>
  <TabsPanel value="overview" />
  <TabsPanel value="settings" />
</Tabs>

<Tabs defaultValue="overview">
  <TabsList variant="underline">
    <TabsTab value="overview">
      <MessageSquare />
      <TabsLabel>Overview</TabsLabel>
    </TabsTab>
    <TabsTab value="settings">
      <Settings />
      <TabsLabel>Settings</TabsLabel>
    </TabsTab>
  </TabsList>
  <TabsPanel value="overview" />
  <TabsPanel value="settings" />
</Tabs>`,
  icons: `import {
  Bell,
  CreditCard,
  Settings,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsBackground, TabsList, TabsPanel, TabsTab } from "cuvii-rui";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsBackground />
    <TabsTab value="overview" aria-label="Overview">
      <MessageSquare />
    </TabsTab>
    <TabsTab value="billing" aria-label="Billing">
      <CreditCard />
    </TabsTab>
    <TabsTab value="settings" aria-label="Settings">
      <Settings />
    </TabsTab>
  </TabsList>
  <TabsPanel value="overview" />
  <TabsPanel value="billing" />
  <TabsPanel value="settings" />
</Tabs>

<Tabs defaultValue="messages">
  <TabsList variant="underline">
    <TabsTab value="messages" aria-label="Messages">
      <MessageSquare />
    </TabsTab>
    <TabsTab value="alerts" aria-label="Alerts">
      <Bell />
    </TabsTab>
    <TabsTab value="settings" aria-label="Settings">
      <Settings />
    </TabsTab>
  </TabsList>
  <TabsPanel value="messages" />
  <TabsPanel value="alerts" />
  <TabsPanel value="settings" />
</Tabs>`,
  migrationAnatomy: `// Source
<ReorderablePanelTabs
  tabs={tabs}
  activeTab={active}
  onSelectTab={setActive}
  onReorderTabs={setOrder}
/>

// Current
<Tabs value={active} onValueChange={setActive}>
  <TabsList>
    <TabsBackground />
    <TabsTab value="chat">Chat</TabsTab>
    <TabsTab value="files">Files</TabsTab>
  </TabsList>
  <TabsPanel value="chat">Chat content</TabsPanel>
  <TabsPanel value="files">Files content</TabsPanel>
</Tabs>`,
  migrationReorderable: `// Current, sortable list
<Tabs value={active} onValueChange={setActive}>
  <SortableTabsList value={order} onReorder={setOrder}>
    <TabsBackground />
    {orderedTabs.map((tab) => (
      <SortableTabsTab key={tab.id} value={tab.id}>
        <tab.icon />
        <TabsLabel>{tab.label}</TabsLabel>
      </SortableTabsTab>
    ))}
  </SortableTabsList>
</Tabs>`,
  reorderable: `import {
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsBackground,
  TabsLabel,
  useOrderedTabs,
} from "cuvii-rui";

const orderedTabs = useOrderedTabs(TABS, order);
const plainTabs = useOrderedTabs(TABS, plainOrder);
const underlineBackgroundTabs = useOrderedTabs(TABS, underlineBackgroundOrder);
const underlineTabs = useOrderedTabs(TABS, underlineOrder);

<Tabs value={active} onValueChange={setActive}>
  <SortableTabsList value={order} onReorder={setOrder}>
    <TabsBackground />
    {orderedTabs.map((tab) => (
      <SortableTabsTab key={tab.id} value={tab.id}>
        <tab.icon />
        <TabsLabel>{tab.label}</TabsLabel>
      </SortableTabsTab>
    ))}
  </SortableTabsList>
</Tabs>

<Tabs value={plainActive} onValueChange={setPlainActive}>
  <SortableTabsList value={plainOrder} onReorder={setPlainOrder}>
    {plainTabs.map((tab) => (
      <SortableTabsTab key={tab.id} value={tab.id}>
        <tab.icon />
        <TabsLabel>{tab.label}</TabsLabel>
      </SortableTabsTab>
    ))}
  </SortableTabsList>
</Tabs>

<Tabs value={underlineBackgroundActive} onValueChange={setUnderlineBackgroundActive}>
  <SortableTabsList
    value={underlineBackgroundOrder}
    onReorder={setUnderlineBackgroundOrder}
    variant="underline"
  >
    <TabsBackground />
    {underlineBackgroundTabs.map((tab) => (
      <SortableTabsTab key={tab.id} value={tab.id}>
        <tab.icon />
        <TabsLabel>{tab.label}</TabsLabel>
      </SortableTabsTab>
    ))}
  </SortableTabsList>
</Tabs>

<Tabs value={underlineActive} onValueChange={setUnderlineActive}>
  <SortableTabsList
    value={underlineOrder}
    onReorder={setUnderlineOrder}
    variant="underline"
  >
    {underlineTabs.map((tab) => (
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
    <TabsBackground />
    {orderedTabs.map((tab) => (
      <SortableTabsTab key={tab.id} value={tab.id} data-testid={\`panel-tab-\${tab.id}\`}>
        <tab.icon />
        <TabsLabel>{tab.label}</TabsLabel>
      </SortableTabsTab>
    ))}
  </SortableTabsList>
</Tabs>

<Tabs value={plainActive} onValueChange={setPlainActive}>
  <SortableTabsList value={plainOrder} onReorder={setPlainOrder}>
    {plainTabs.map((tab) => (
      <SortableTabsTab key={tab.id} value={tab.id} data-testid={\`panel-tab-\${tab.id}\`}>
        <tab.icon />
        <TabsLabel>{tab.label}</TabsLabel>
      </SortableTabsTab>
    ))}
  </SortableTabsList>
</Tabs>

<Tabs value={underlineBackgroundActive} onValueChange={setUnderlineBackgroundActive}>
  <SortableTabsList
    value={underlineBackgroundOrder}
    onReorder={setUnderlineBackgroundOrder}
    variant="underline"
  >
    <TabsBackground />
    {underlineBackgroundTabs.map((tab) => (
      <SortableTabsTab key={tab.id} value={tab.id} data-testid={\`panel-tab-\${tab.id}\`}>
        <tab.icon />
        <TabsLabel>{tab.label}</TabsLabel>
      </SortableTabsTab>
    ))}
  </SortableTabsList>
</Tabs>

<Tabs value={underlineActive} onValueChange={setUnderlineActive}>
  <SortableTabsList
    value={underlineOrder}
    onReorder={setUnderlineOrder}
    variant="underline"
  >
    {underlineTabs.map((tab) => (
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
  { name: "Tabs.defaultValue", type: "T", description: "Initial tab value for uncontrolled use." },
  {
    name: "Tabs.onValueChange",
    type: "(value: T) => void",
    description: "Called when Base UI changes the active tab.",
  },
  {
    name: "TabsList.variant",
    type: '"default" | "underline"',
    description: "Visual treatment for the tab list. Defaults to the chip-style default variant.",
  },
  {
    name: "TabsBackground",
    type: "span props",
    description:
      "Optional visual slot. Place it inside TabsList to render the default container surface or underline top edge.",
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
  {
    name: "TabsLabel",
    type: "span props",
    description: "Optional text slot for icon-and-label tab layouts.",
  },
];

type PlaygroundValues = {
  background: boolean;
  variant: (typeof VARIANTS)[number];
  icons: boolean;
};

const TabsCurrent = TABS_SOURCE_COMPARISON_COMPOSITION;

const TABS_COMPOSITION_RAW_SOURCES = {
  ReorderableDefault: tabsReorderableDefaultCompositionSource,
  ReorderableDefaultBackground: tabsReorderableDefaultBackgroundCompositionSource,
  ReorderableUnderline: tabsReorderableUnderlineCompositionSource,
  ReorderableUnderlineBackground: tabsReorderableUnderlineBackgroundCompositionSource,
} as const;

const TABS_COMPOSITION_SOURCES = createCompositionSourceMap(TABS_COMPOSITION_RAW_SOURCES);

const TABS_COMPOSITION_SNIPPET_IDS = {
  ReorderableDefault: "tabsReorderableDefaultComposition",
  ReorderableDefaultBackground: "tabsReorderableDefaultBackgroundComposition",
  ReorderableUnderline: "tabsReorderableUnderlineComposition",
  ReorderableUnderlineBackground: "tabsReorderableUnderlineBackgroundComposition",
} as const;

type TabsCompositionKey = keyof typeof TABS_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/tabs")({
  component: TabsDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(TABS_COMPOSITION_SOURCES, TABS_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

type TabId = "chat" | "files" | "members" | "alerts";
type SettingsTabId = "overview" | "billing" | "settings";
type IconComponent = ComponentType<{
  className?: string;
  size?: number;
  strokeWidth?: number | string;
}>;

type TabItem = OrderedTabItem<TabId> & {
  label: string;
  icon: IconComponent;
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

const SETTINGS_TABS: readonly (OrderedTabItem<SettingsTabId> & {
  label: string;
  icon: IconComponent;
})[] = [
  { id: "overview", label: "Overview", icon: MessageSquare },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

function TabsDoc() {
  const code = Route.useLoaderData();
  const [sourceOrder, setSourceOrder] = useState<TabId[]>(["chat", "files", "members", "alerts"]);
  const [sourceActive, setSourceActive] = useState<TabId>("chat");
  const sourceTabs = useOrderedTabs(SOURCE_TABS, sourceOrder);
  const tabsComposition = (key: TabsCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: TABS_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: TABS_COMPOSITION_SNIPPET_IDS,
      sources: TABS_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Tabs"
      description="A Base UI Tabs family for switching related panels with default, underline, and opt-in sortable list treatments."
      headerAction={
        <Button
          render={<a href="/components/tabs/matrix" target="_blank" rel="noreferrer" />}
          variant="ghost"
          size="sm"
        >
          Matrix
          <Grid2X2 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            background: true,
            variant: "default",
            icons: true,
          }}
          controls={[
            { name: "variant", label: "Variant", type: "select", options: VARIANTS },
            { name: "background", label: "Background", type: "boolean" },
            { name: "icons", label: "Icons", type: "boolean" },
          ]}
          render={(values) => (
            <Tabs defaultValue="overview" className="flex flex-col items-center">
              <TabsList variant={values.variant}>
                {values.background ? <TabsBackground /> : null}
                {SETTINGS_TABS.map((tab) => (
                  <TabsTab key={tab.id} value={tab.id}>
                    {values.icons ? <tab.icon /> : null}
                    {values.icons ? <TabsLabel>{tab.label}</TabsLabel> : tab.label}
                  </TabsTab>
                ))}
              </TabsList>
              {SETTINGS_TABS.map((tab) => (
                <TabsPanel
                  key={tab.id}
                  value={tab.id}
                  className="w-full max-w-md p-3 text-center text-xs text-foreground-muted"
                >
                  {tab.label} content
                </TabsPanel>
              ))}
            </Tabs>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Tabs.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="variants" title="Variants">
        <div className="space-y-4">
          <Example html={code.variants}>
            <div className="flex w-full max-w-xl flex-col items-center gap-10 overflow-visible px-1">
              <Tabs defaultValue="overview" className="overflow-visible">
                <TabsList>
                  <TabsBackground />
                  {SETTINGS_TABS.map((tab) => (
                    <TabsTab key={tab.id} value={tab.id}>
                      <tab.icon />
                      <TabsLabel>{tab.label}</TabsLabel>
                    </TabsTab>
                  ))}
                </TabsList>
                {SETTINGS_TABS.map((tab) => (
                  <TabsPanel key={tab.id} value={tab.id} className="sr-only">
                    {tab.label}
                  </TabsPanel>
                ))}
              </Tabs>

              <Tabs defaultValue="overview" className="overflow-visible">
                <TabsList>
                  {SETTINGS_TABS.map((tab) => (
                    <TabsTab key={tab.id} value={tab.id}>
                      <tab.icon />
                      <TabsLabel>{tab.label}</TabsLabel>
                    </TabsTab>
                  ))}
                </TabsList>
                {SETTINGS_TABS.map((tab) => (
                  <TabsPanel key={tab.id} value={tab.id} className="sr-only">
                    {tab.label}
                  </TabsPanel>
                ))}
              </Tabs>

              <Tabs defaultValue="overview" className="overflow-visible">
                <TabsList variant="underline">
                  <TabsBackground />
                  {SETTINGS_TABS.map((tab) => (
                    <TabsTab key={tab.id} value={tab.id}>
                      <tab.icon />
                      <TabsLabel>{tab.label}</TabsLabel>
                    </TabsTab>
                  ))}
                </TabsList>
                {SETTINGS_TABS.map((tab) => (
                  <TabsPanel key={tab.id} value={tab.id} className="sr-only">
                    {tab.label}
                  </TabsPanel>
                ))}
              </Tabs>

              <Tabs defaultValue="overview" className="overflow-visible">
                <TabsList variant="underline">
                  {SETTINGS_TABS.map((tab) => (
                    <TabsTab key={tab.id} value={tab.id}>
                      <tab.icon />
                      <TabsLabel>{tab.label}</TabsLabel>
                    </TabsTab>
                  ))}
                </TabsList>
                {SETTINGS_TABS.map((tab) => (
                  <TabsPanel key={tab.id} value={tab.id} className="sr-only">
                    {tab.label}
                  </TabsPanel>
                ))}
              </Tabs>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="icon-only" title="Icons">
        <div className="space-y-4">
          <Example html={code.icons}>
            <div className="flex w-full max-w-xl flex-col items-center gap-10 overflow-visible px-1">
              <Tabs defaultValue="overview" className="overflow-visible">
                <TabsList>
                  <TabsBackground />
                  <TabsTab value="overview" aria-label="Overview">
                    <MessageSquare />
                  </TabsTab>
                  <TabsTab value="billing" aria-label="Billing">
                    <CreditCard />
                  </TabsTab>
                  <TabsTab value="settings" aria-label="Settings">
                    <Settings />
                  </TabsTab>
                </TabsList>
                {SETTINGS_TABS.map((tab) => (
                  <TabsPanel key={tab.id} value={tab.id} className="sr-only">
                    {tab.label}
                  </TabsPanel>
                ))}
              </Tabs>

              <Tabs defaultValue="messages" className="overflow-visible">
                <TabsList variant="underline">
                  <TabsTab value="messages" aria-label="Messages">
                    <MessageSquare />
                  </TabsTab>
                  <TabsTab value="alerts" aria-label="Alerts">
                    <Bell />
                  </TabsTab>
                  <TabsTab value="settings" aria-label="Settings">
                    <Settings />
                  </TabsTab>
                </TabsList>
                <TabsPanel value="messages" className="sr-only">
                  Messages
                </TabsPanel>
                <TabsPanel value="alerts" className="sr-only">
                  Alerts
                </TabsPanel>
                <TabsPanel value="settings" className="sr-only">
                  Settings
                </TabsPanel>
              </Tabs>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="reorderable" title="Reorderable">
        <div className="space-y-4">
          <Example html={code.reorderable}>
            <div className="flex w-full max-w-xl flex-col items-center gap-8 overflow-visible px-1">
              <ReorderableTabsDemo background />
              <ReorderableTabsDemo />
              <ReorderableTabsDemo background variant="underline" />
              <ReorderableTabsDemo variant="underline" />
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Reorderable default background",
              status: "difference",
              note: "Source always mounted one brutal reorderable strip. Current keeps sorting in SortableTabsList and composes TabsBackground for the default container surface.",
              source: (
                <LegacyReorderablePanelTabs
                  tabs={sourceTabs}
                  activeTab={sourceActive}
                  onSelectTab={setSourceActive}
                  onReorderTabs={setSourceOrder}
                />
              ),
              brutal: <TabsCurrent.ReorderableDefaultBackground />,
              elegant: <TabsCurrent.ReorderableDefaultBackground />,
              elegantDark: <TabsCurrent.ReorderableDefaultBackground />,
              ...tabsComposition("ReorderableDefaultBackground"),
            },
            {
              label: "Reorderable default",
              status: "new",
              source: <MissingSource />,
              brutal: <TabsCurrent.ReorderableDefault />,
              elegant: <TabsCurrent.ReorderableDefault />,
              elegantDark: <TabsCurrent.ReorderableDefault />,
              ...tabsComposition("ReorderableDefault"),
            },
            {
              label: "Reorderable underline background",
              status: "new",
              source: <MissingSource />,
              brutal: <TabsCurrent.ReorderableUnderlineBackground />,
              elegant: <TabsCurrent.ReorderableUnderlineBackground />,
              elegantDark: <TabsCurrent.ReorderableUnderlineBackground />,
              ...tabsComposition("ReorderableUnderlineBackground"),
            },
            {
              label: "Reorderable underline",
              status: "new",
              source: <MissingSource />,
              brutal: <TabsCurrent.ReorderableUnderline />,
              elegant: <TabsCurrent.ReorderableUnderline />,
              elegantDark: <TabsCurrent.ReorderableUnderline />,
              ...tabsComposition("ReorderableUnderline"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

function ReorderableTabsDemo({
  background = false,
  variant = "default",
}: {
  background?: boolean;
  variant?: (typeof VARIANTS)[number];
}) {
  const [order, setOrder] = useState<TabId[]>(["chat", "files", "members", "alerts"]);
  const [active, setActive] = useState<TabId>("chat");
  const orderedTabs = useOrderedTabs(TABS, order);

  return (
    <Tabs value={active} onValueChange={setActive} className="flex justify-center overflow-visible">
      <SortableTabsList value={order} onReorder={setOrder} variant={variant} className="max-w-md">
        {background ? <TabsBackground /> : null}
        {orderedTabs.map((tab) => (
          <SortableTabsTab key={tab.id} value={tab.id}>
            <tab.icon />
            <TabsLabel>{tab.label}</TabsLabel>
          </SortableTabsTab>
        ))}
      </SortableTabsList>
    </Tabs>
  );
}
