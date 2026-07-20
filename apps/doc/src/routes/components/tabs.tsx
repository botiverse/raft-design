import { createFileRoute } from "@tanstack/react-router";
import {
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
} from "raft-ui";
import { Bell, CreditCard, Files, Settings, MessageSquare, Users } from "lucide-react";
import { useState, type ComponentType } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const VARIANTS = ["default", "underline"] as const;

const SNIPPETS = {
  preview: `<Tabs defaultValue="overview">
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
    <TabsTab value="settings">
      <Settings />
      <TabsLabel>Settings</TabsLabel>
    </TabsTab>
  </TabsList>
  <TabsPanel value="overview">Overview content</TabsPanel>
  <TabsPanel value="billing">Billing content</TabsPanel>
  <TabsPanel value="settings">Settings content</TabsPanel>
</Tabs>`,
  anatomy: `<Tabs>
  <TabsList>
    <TabsBackground />
    <TabsTab />
  </TabsList>
  <TabsPanel />
</Tabs>`,
  variants: `import {
  CreditCard,
  Settings,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsBackground, TabsLabel, TabsList, TabsPanel, TabsTab } from "raft-ui";

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
import { Tabs, TabsBackground, TabsList, TabsPanel, TabsTab } from "raft-ui";

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
  reorderable: `import {
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsBackground,
  TabsLabel,
  useOrderedTabs,
} from "raft-ui";

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

export const Route = createFileRoute("/components/tabs")({
  component: TabsDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
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

const SETTINGS_TABS: readonly (OrderedTabItem<SettingsTabId> & {
  label: string;
  icon: IconComponent;
})[] = [
  { id: "overview", label: "Overview", icon: MessageSquare },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

function TabsPreview({
  code,
  collapsedCode,
}: {
  code: ReturnType<typeof Route.useLoaderData>["preview"];
  collapsedCode?: ReturnType<typeof Route.useLoaderData>["previewBody"];
}) {
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("default");
  const [background, setBackground] = useState(true);
  const [icons, setIcons] = useState(true);

  return (
    <Preview>
      <Preview.Canvas>
        <Tabs defaultValue="overview" className="flex flex-col items-center">
          <TabsList variant={variant}>
            {background ? <TabsBackground /> : null}
            {SETTINGS_TABS.map((tab) => (
              <TabsTab key={tab.id} value={tab.id}>
                {icons ? <tab.icon /> : null}
                {icons ? <TabsLabel>{tab.label}</TabsLabel> : tab.label}
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
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Variant" htmlFor="tabs-preview-variant">
          <Preview.Select
            id="tabs-preview-variant"
            label="Variant"
            options={VARIANTS}
            value={variant}
            onValueChange={(value) => setVariant(value as (typeof VARIANTS)[number])}
          />
        </Preview.Control>
        <Preview.Control label="Background" htmlFor="tabs-preview-background">
          <Preview.Checkbox
            id="tabs-preview-background"
            label="Background"
            checked={background}
            onCheckedChange={setBackground}
          />
        </Preview.Control>
        <Preview.Control label="Icons" htmlFor="tabs-preview-icons">
          <Preview.Checkbox
            id="tabs-preview-icons"
            label="Icons"
            checked={icons}
            onCheckedChange={setIcons}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

function TabsDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Tabs"
      description="A Base UI Tabs family for switching related panels with default, underline, and opt-in sortable list treatments."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <TabsPreview code={code.preview} collapsedCode={code.previewBody} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="variants" title="Variants">
            <Preview>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.variants} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="icon-only" title="Icons">
            <Preview>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.icons} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="reorderable" title="Reorderable">
            <Preview>
              <Preview.Canvas>
                <div className="flex w-full max-w-xl flex-col items-center gap-8 overflow-visible px-1">
                  <ReorderableTabsDemo background />
                  <ReorderableTabsDemo />
                  <ReorderableTabsDemo background variant="underline" />
                  <ReorderableTabsDemo variant="underline" />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.reorderable} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
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
