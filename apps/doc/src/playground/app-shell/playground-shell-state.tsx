import { createContext, use, useMemo, useState, type ReactNode } from "react";

export const PLAYGROUND_SERVERS = [
  { id: "raft", name: "Raft Playground", initial: "R" },
  { id: "design-guild", name: "Design Guild", initial: "D" },
  { id: "open-source", name: "Open Source", initial: "O" },
] as const;

type PlaygroundServerId = (typeof PLAYGROUND_SERVERS)[number]["id"];

type PlaygroundShellState = {
  activeServer: (typeof PLAYGROUND_SERVERS)[number];
  notificationVisible: boolean;
  dismissNotification: () => void;
  selectServer: (serverId: PlaygroundServerId) => void;
};

const PlaygroundShellContext = createContext<PlaygroundShellState | null>(null);

export function PlaygroundShellStateProvider({ children }: { children: ReactNode }) {
  const [serverId, setServerId] = useState<PlaygroundServerId>("raft");
  const [notificationVisible, setNotificationVisible] = useState(true);
  const activeServer =
    PLAYGROUND_SERVERS.find((server) => server.id === serverId) ?? PLAYGROUND_SERVERS[0];
  const value = useMemo<PlaygroundShellState>(
    () => ({
      activeServer,
      notificationVisible,
      dismissNotification: () => setNotificationVisible(false),
      selectServer: setServerId,
    }),
    [activeServer, notificationVisible],
  );

  return <PlaygroundShellContext value={value}>{children}</PlaygroundShellContext>;
}

export function usePlaygroundShellState() {
  const state = use(PlaygroundShellContext);
  if (!state) {
    throw new Error("usePlaygroundShellState must be used inside PlaygroundShellStateProvider");
  }
  return state;
}
