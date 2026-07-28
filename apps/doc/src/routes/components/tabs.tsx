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
  reorderable: `import { useState } from "react";
import { Bell, Files, MessageSquare, Users } from "lucide-react";
import {
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsBackground,
  TabsLabel,
  useOrderedTabs,
} from "raft-ui";

const TABS = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "files", label: "Files", icon: Files },
  { id: "members", label: "Members", icon: Users },
  { id: "alerts", label: "Alerts", icon: Bell },
];
const INITIAL_ORDER = ["chat", "files", "members", "alerts"];

const [order, setOrder] = useState(INITIAL_ORDER);
const [active, setActive] = useState("chat");
const [plainOrder, setPlainOrder] = useState(INITIAL_ORDER);
const [plainActive, setPlainActive] = useState("chat");
const [underlineBackgroundOrder, setUnderlineBackgroundOrder] = useState(INITIAL_ORDER);
const [underlineBackgroundActive, setUnderlineBackgroundActive] = useState("chat");
const [underlineOrder, setUnderlineOrder] = useState(INITIAL_ORDER);
const [underlineActive, setUnderlineActive] = useState("chat");

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

const TABS_PROPS: readonly PropRow[] = [
  {
    name: "value / defaultValue",
    type: "T",
    description: "Controlled active tab value, or initial value for uncontrolled use.",
  },
  {
    name: "onValueChange",
    type: "(value: T, eventDetails) => void",
    description: "Called when Base UI changes the active tab.",
  },
  {
    name: "...props",
    type: "BaseTabs.Root.Props",
    description: "Base UI Tabs root props for orientation and other root behavior.",
  },
];

const TABS_LIST_PROPS: readonly PropRow[] = [
  {
    name: "variant",
    type: '"default" | "underline"',
    default: '"default"',
    description: "Visual treatment for the tab list. Defaults to the chip-style default variant.",
  },
  {
    name: "...props",
    type: "BaseTabs.List.Props",
    description: "Tab list container. Compose TabsBackground and TabsTab as children.",
  },
];

const TABS_BACKGROUND_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"span">',
    description:
      "Optional visual slot. Place it inside TabsList to render the default container surface or underline top edge.",
  },
];

const TABS_TAB_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "T",
    description: "The tab value passed to Base UI.",
  },
  {
    name: "...props",
    type: "BaseTabs.Tab.Props",
    description: "Tab trigger. Compose icon and TabsLabel as children.",
  },
];

const TABS_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"span">',
    description: "Optional text slot for icon-and-label tab layouts.",
  },
];

const TABS_PANEL_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "T",
    description: "Associates the panel with its matching TabsTab value.",
  },
  {
    name: "...props",
    type: "BaseTabs.Panel.Props",
    description: "Panel content associated with a tab value.",
  },
];

const SORTABLE_TABS_LIST_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "readonly T[]",
    description: "Current tab order.",
  },
  {
    name: "onReorder",
    type: "(value: T[]) => void",
    description: "Receives the new order after drag end.",
  },
  {
    name: "variant",
    type: '"default" | "underline"',
    default: '"default"',
    description: "Visual treatment inherited by the underlying TabsList.",
  },
  {
    name: "...props",
    type: "TabsListProps",
    description:
      "Sortable TabsList wrapper. Compose TabsBackground and SortableTabsTab as children.",
  },
];

const SORTABLE_TABS_TAB_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "T",
    description: "A sortable tab value passed to Base UI and dnd-kit.",
  },
  {
    name: "...props",
    type: "TabsTabProps",
    description: "Draggable tab trigger used inside SortableTabsList.",
  },
];

const USE_ORDERED_TABS_PROPS: readonly PropRow[] = [
  {
    name: "items",
    type: "readonly OrderedTabItem[]",
    description: "Canonical tab definitions keyed by id.",
  },
  {
    name: "storedOrder",
    type: "readonly string[]",
    description: "Persisted order to reconcile against items; unknown ids are dropped.",
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

function TabsPreview({ code }: { code: ReturnType<typeof Route.useLoaderData>["preview"] }) {
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
      <Preview.Code html={code} />
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
        <TabsPreview code={code.preview} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
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
              <Preview.Code html={code.variants} collapsedHtml={code.variantsBody} />
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
              <Preview.Code html={code.icons} collapsedHtml={code.iconsBody} />
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
              <Preview.Code html={code.reorderable} collapsedHtml={code.reorderableBody} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Tabs">
            <PropsTable rows={TABS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-list" title="TabsList">
            <PropsTable rows={TABS_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-background" title="TabsBackground">
            <PropsTable rows={TABS_BACKGROUND_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-tab" title="TabsTab">
            <PropsTable rows={TABS_TAB_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-label" title="TabsLabel">
            <PropsTable rows={TABS_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel" title="TabsPanel">
            <PropsTable rows={TABS_PANEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sortable-list" title="SortableTabsList">
            <PropsTable rows={SORTABLE_TABS_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sortable-tab" title="SortableTabsTab">
            <PropsTable rows={SORTABLE_TABS_TAB_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-use-ordered-tabs" title="useOrderedTabs">
            <PropsTable rows={USE_ORDERED_TABS_PROPS} />
          </DocSubsection>
        </div>
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
