import { useState, type ComponentType } from "react";
import {
  SortableTabsList,
  SortableTabsTab,
  Tabs,
  TabsLabel,
  useOrderedTabs,
  type OrderedTabItem,
} from "raft-ui";
import { Bell, Files, MessageSquare, Users } from "lucide-react";

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
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "files", label: "Files", icon: Files },
  { id: "members", label: "Members", icon: Users },
  { id: "alerts", label: "Alerts", icon: Bell },
] as const satisfies readonly TabItem[];

export function TabsContent() {
  const [order, setOrder] = useState<TabId[]>(["chat", "files", "members", "alerts"]);
  const [active, setActive] = useState<TabId>("chat");
  const orderedTabs = useOrderedTabs(TABS, order);

  return (
    <Tabs value={active} onValueChange={setActive} className="flex justify-center overflow-visible">
      <SortableTabsList value={order} onReorder={setOrder} className="max-w-md">
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
export function TabsReorderableDefaultComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <TabsContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
