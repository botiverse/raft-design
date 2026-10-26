import { useState } from "react";
import { SortableTabsList, SortableTabsTab, Tabs, TabsLabel, TabsPanel } from "@botiverse/raft-ui";

const LABELS: Record<string, string> = {
  profile: "Profile",
  activity: "Activity",
  workspace: "Workspace",
};

export function SortableContent() {
  const [order, setOrder] = useState(["profile", "activity", "workspace"]);
  return (
    <Tabs defaultValue="profile" className="gap-3">
      <SortableTabsList aria-label="Wug" value={order} onReorder={setOrder}>
        {order.map((id) => (
          <SortableTabsTab key={id} value={id}>
            <TabsLabel>{LABELS[id]}</TabsLabel>
          </SortableTabsTab>
        ))}
      </SortableTabsList>
      <TabsPanel value="profile" className="p-3 text-xs text-foreground-muted">
        Wug runs on Claude Code and answers in #launch-week.
      </TabsPanel>
      <TabsPanel value="activity" className="p-3 text-xs text-foreground-muted">
        Wug claimed #25 an hour ago.
      </TabsPanel>
      <TabsPanel value="workspace" className="p-3 text-xs text-foreground-muted">
        3 files changed in the last day.
      </TabsPanel>
    </Tabs>
  );
}
