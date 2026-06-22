import { useState, type ComponentType } from "react";
import {
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsBackground,
  TabsLabel,
  useOrderedTabs,
  type OrderedTabItem,
} from "@raft/ui";
import {
  IconBellOutline18,
  IconFilesOutline18,
  IconMessageOutline18,
  IconUsersOutline18,
} from "nucleo-ui-outline-18";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

type TabId = "chat" | "files" | "members" | "alerts";
type IconComponent = ComponentType<{
  className?: string;
  size?: number;
  strokeWidth?: number | string;
}>;

type TabItem = OrderedTabItem<TabId> & {
  label: string;
  icon: IconComponent;
};

const TABS = [
  { id: "chat", label: "Chat", icon: IconMessageOutline18 },
  { id: "files", label: "Files", icon: IconFilesOutline18 },
  { id: "members", label: "Members", icon: IconUsersOutline18 },
  { id: "alerts", label: "Alerts", icon: IconBellOutline18 },
] as const satisfies readonly TabItem[];

export function TabsContent() {
  const [order, setOrder] = useState<TabId[]>(["chat", "files", "members", "alerts"]);
  const [active, setActive] = useState<TabId>("chat");
  const orderedTabs = useOrderedTabs(TABS, order);

  return (
    <Tabs value={active} onValueChange={setActive} className="flex justify-center overflow-visible">
      <SortableTabsList value={order} onReorder={setOrder} className="max-w-md">
        <TabsBackground />
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

// @docs-source-strip-start
export function TabsReorderableDefaultBackgroundComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <TabsContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
