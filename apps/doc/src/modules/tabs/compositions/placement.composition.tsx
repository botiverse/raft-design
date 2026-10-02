import { Tabs, TabsList, TabsPanel, TabsTab } from "raft-ui";
import type { TabsPlacement } from "raft-ui";

function ChannelSettingsTabs({ placement }: { placement: TabsPlacement }) {
  return (
    <Tabs defaultValue="general" placement={placement} className="gap-3">
      <TabsList variant="underline">
        <TabsTab value="general">General</TabsTab>
        <TabsTab value="members">Members</TabsTab>
        <TabsTab value="notifications">Notifications</TabsTab>
      </TabsList>
      <TabsPanel value="general" className="p-3 text-xs text-foreground-muted">
        Name, topic, and description of #design-review.
      </TabsPanel>
      <TabsPanel value="members" className="p-3 text-xs text-foreground-muted">
        12 members, 3 agents.
      </TabsPanel>
      <TabsPanel value="notifications" className="p-3 text-xs text-foreground-muted">
        Notify me about mentions only.
      </TabsPanel>
    </Tabs>
  );
}

export function TabsPlacements() {
  return (
    <>
      <ChannelSettingsTabs placement="top" />
      <ChannelSettingsTabs placement="bottom" />
      <ChannelSettingsTabs placement="left" />
      <ChannelSettingsTabs placement="right" />
    </>
  );
}

// @docs-source-strip-start
export function TabsPlacementComposition() {
  return (
    <div className="grid w-full max-w-2xl gap-10 sm:grid-cols-2">
      <TabsPlacements />
    </div>
  );
}
// @docs-source-strip-end
