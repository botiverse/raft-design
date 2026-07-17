import { createContext } from "react";

import type { PlaygroundServer, PlaygroundServerId } from "./playground-servers.ts";

export type PlaygroundShellState = {
  activeServer: PlaygroundServer;
  notificationVisible: boolean;
  sidebarCollapsed: boolean;
  dismissNotification: () => void;
  selectServer: (serverId: PlaygroundServerId) => void;
  toggleSidebar: () => void;
};

export const PlaygroundShellContext = createContext<PlaygroundShellState | null>(null);
