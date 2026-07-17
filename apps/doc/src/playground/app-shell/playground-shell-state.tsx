import { useMemo, useState, type ReactNode } from "react";

import {
  PlaygroundShellContext,
  type PlaygroundShellState,
} from "./playground-shell-state-context.ts";
import { PLAYGROUND_SERVERS, type PlaygroundServerId } from "./playground-servers.ts";

export function PlaygroundShellStateProvider({ children }: { children: ReactNode }) {
  const [serverId, setServerId] = useState<PlaygroundServerId>("raft");
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeServer =
    PLAYGROUND_SERVERS.find((server) => server.id === serverId) ?? PLAYGROUND_SERVERS[0];

  const value = useMemo<PlaygroundShellState>(
    () => ({
      activeServer,
      notificationVisible,
      sidebarCollapsed,
      dismissNotification: () => setNotificationVisible(false),
      selectServer: setServerId,
      toggleSidebar: () => setSidebarCollapsed((collapsed) => !collapsed),
    }),
    [activeServer, notificationVisible, sidebarCollapsed],
  );

  return <PlaygroundShellContext value={value}>{children}</PlaygroundShellContext>;
}
