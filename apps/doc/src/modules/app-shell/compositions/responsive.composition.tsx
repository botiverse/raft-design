import {
  AppShellMainSlot,
  AppShellRailSlot,
  AppShellRoot,
  AppShellSidebarSlot,
  MobileNavItem,
  MobileNavLabel,
  MobileNavRoot,
} from "raft-ui";

export function AppShellResponsiveComposition() {
  return (
    <AppShellRoot className="min-h-dvh">
      <AppShellRailSlot>
        <nav aria-label="Workspace navigation">Rail</nav>
      </AppShellRailSlot>

      <AppShellSidebarSlot>
        <div>Conversation list</div>
      </AppShellSidebarSlot>

      <AppShellMainSlot>
        <div>Conversation</div>
      </AppShellMainSlot>

      <MobileNavRoot className="order-last md:hidden" aria-label="Primary navigation">
        <MobileNavItem selected>
          <MobileNavLabel>Messages</MobileNavLabel>
        </MobileNavItem>
      </MobileNavRoot>
    </AppShellRoot>
  );
}
