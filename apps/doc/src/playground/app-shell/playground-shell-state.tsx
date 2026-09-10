import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { PlaygroundShellContext } from "./playground-shell-state-context.ts";
import type { PlaygroundShellState } from "./playground-shell-state-context.ts";
import { PLAYGROUND_SERVERS } from "./playground-servers.ts";
import type { PlaygroundServerId } from "./playground-servers.ts";

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
