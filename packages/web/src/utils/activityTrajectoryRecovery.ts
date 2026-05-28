export interface ReconnectAwareSocket {
  on(event: "connect", listener: () => void): void;
  off(event: "connect", listener: () => void): void;
}

interface RegisterActivityTrajectoryReconnectReloadOptions {
  socket: ReconnectAwareSocket;
  agentId: string;
  loadTrajectoryLog: (agentId: string, limit?: number) => Promise<void>;
  limit?: number;
  debounceMs?: number;
}

/**
 * Keep the durable activity tab self-healing across socket reconnects.
 *
 * The live `agent:activity` stream only appends trajectory entries while the
 * socket stays healthy. If the socket disconnects while the activity tab is
 * open, we need an explicit reconnect reload to fill any missed durable
 * entries back from `/agents/:id/activity-log`.
 */
export function registerActivityTrajectoryReconnectReload({
  socket,
  agentId,
  loadTrajectoryLog,
  limit,
  debounceMs = 500,
}: RegisterActivityTrajectoryReconnectReloadOptions) {
  let isFirstConnect = true;
  let inFlight = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const runReload = async () => {
    if (inFlight) return;
    inFlight = true;
    try {
      await loadTrajectoryLog(agentId, limit);
    } finally {
      inFlight = false;
    }
  };

  const handleReconnect = () => {
    if (isFirstConnect) {
      isFirstConnect = false;
      return;
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void runReload();
    }, debounceMs);
  };

  socket.on("connect", handleReconnect);

  return () => {
    socket.off("connect", handleReconnect);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  };
}
