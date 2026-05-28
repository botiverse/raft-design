import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "../app.js";
import { initDatabase, closeDatabase } from "../db/index.js";
import { setupSocket } from "../socket/index.js";
import * as agentActivityLogService from "../services/agentActivityLogService.js";

type StubAgentOrchestrator = {
  deliverMessage: () => Promise<void>;
  receiveMessages: () => Promise<never[]>;
  acknowledgeDeliveredMessages: () => { removedCount: number };
  acknowledgeDeliveredMessagesForChannel: () => { removedCount: number };
  acknowledgeDeliveredMessagesForChannelUpToSeq: () => { removedCount: number };
  recordAgentSlockAction: (
    agentId: string,
    event: { title: string; text: string; activity?: string; dedupeKey?: string },
  ) => Promise<void>;
  getActivity: (agentId: string) => Promise<{ activity: string; activityDetail: string }>;
  getMachineStatus: (machineId: string) => Promise<"online" | "offline">;
  getMachineStatusVersion: (machineId: string) => Promise<number>;
  getMachineDaemonVersion: (machineId: string) => string | null;
  stopAgent: (agentId: string, reason?: string) => Promise<void>;
  evictCache: (agentId: string) => void;
  shutdown: () => void;
  setIO: () => void;
};

function ensureTestEnv() {
  process.env.NODE_ENV ||= "test";
  process.env.JWT_SECRET ||= "test-jwt-secret";
  process.env.CORS_ORIGIN ||= "http://127.0.0.1:4173";
  process.env.APP_URL ||= "http://127.0.0.1:4173";
}

function createAgentOrchestratorStub(): StubAgentOrchestrator {
  return {
    deliverMessage: async () => {},
    receiveMessages: async () => [],
    acknowledgeDeliveredMessages: () => ({ removedCount: 0 }),
    acknowledgeDeliveredMessagesForChannel: () => ({ removedCount: 0 }),
    acknowledgeDeliveredMessagesForChannelUpToSeq: () => ({ removedCount: 0 }),
    recordAgentSlockAction: async (agentId, event) => {
      await agentActivityLogService.appendAgentActivityEvent(
        agentId,
        event.activity ?? "online",
        "",
        [{ kind: "slock_action", title: event.title, text: event.text }],
        new Date(),
        event.dedupeKey,
      );
    },
    getActivity: async () => ({ activity: "offline", activityDetail: "" }),
    getMachineStatus: async () => "offline",
    getMachineStatusVersion: async () => 0,
    getMachineDaemonVersion: () => null,
    stopAgent: async () => {},
    evictCache: () => {},
    shutdown: () => {},
    setIO: () => {},
  };
}

export async function startTestApp(databaseUrl = "pglite://", port = 0) {
  ensureTestEnv();
  await initDatabase(databaseUrl);

  const app = createApp();
  const server = createServer(app);
  const io = setupSocket(server, process.env.CORS_ORIGIN || "http://127.0.0.1:4173");
  // TODO: swap this stub for a real orchestrator in agent-flow tests.
  const agentOrchestrator = createAgentOrchestratorStub();

  app.set("io", io);
  app.set("agentOrchestrator", agentOrchestrator);

  await new Promise<void>((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    app,
    io,
    server,
    baseUrl,
    async close() {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      io.close();
      agentOrchestrator.shutdown();
      await closeDatabase();
    },
  };
}
