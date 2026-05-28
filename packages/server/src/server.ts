import "dotenv/config";

// Safety net: log unhandled rejections instead of crashing the process
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
});

import { createServer } from "node:http";
import { initDatabase } from "./db/index.js";
import { createApp } from "./app.js";
import { setupSocket } from "./socket/index.js";
import { setupMachineWebSocket } from "./routes/daemon.js";
import { AgentOrchestrator } from "./services/agentOrchestrator.js";
import { setIO as setBillingIO, cleanupWebhookEvents, refreshStaleSubscriptions } from "./services/billingService.js";
import { setStorageTracer, startOrphanCleanup } from "./services/storageService.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";
import { enforceDowngradeLimits } from "./services/downgradeEnforcement.js";
import { initRedis, shutdownRedis } from "./redis.js";
import { startMetricsServer } from "./metrics.js";
import { createServerTracerFromEnv } from "./tracing/serverTracer.js";


const PORT = Number(process.env.PORT) || 3001;
const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_URL_READ_REPLICA = process.env.DATABASE_URL_READ_REPLICA;

function parseCorsOrigin(): string | string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return "http://localhost:5173";
  if (raw.includes(",")) return raw.split(",").map((s) => s.trim());
  return raw;
}
const CORS_ORIGIN = parseCorsOrigin();

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET environment variable is required");
  process.exit(1);
}

async function bootstrap() {
  // Initialize PostgreSQL database
  await initDatabase(DATABASE_URL!, DATABASE_URL_READ_REPLICA);
  console.log("[Slock] Database connected");

  // Initialize Redis (optional — enables multi-replica support)
  const REDIS_URL = process.env.REDIS_URL;
  if (REDIS_URL) {
    initRedis(REDIS_URL);
    console.log("[Slock] Redis initialized");
  }

  // Create Express app
  const app = createApp();

  // Create HTTP server
  const server = createServer(app);

  const serverTracer = createServerTracerFromEnv();
  app.set("serverTracer", serverTracer.tracer);
  setStorageTracer(serverTracer.tracer);

  // Setup Agent Orchestrator
  const agentOrchestrator = new AgentOrchestrator(undefined, undefined, serverTracer.tracer);
  app.set("agentOrchestrator", agentOrchestrator);

  // Initialize cross-replica routing (Redis pub/sub) if Redis is available
  const { initReplicaRouter } = await import("./replicaRouter.js");
  await initReplicaRouter(
    (machineId, message) => {
      agentOrchestrator.handleRoutedMachineCommand(machineId, message).catch((err) => {
        console.error(`[ReplicaRouter] Failed to handle routed machine command for ${machineId}:`, err);
      });
    },
    (agentId, machineId, message) => {
      agentOrchestrator.handleRoutedInboxDelivery(agentId, machineId, message).catch((err) => {
        console.error(`[ReplicaRouter] Failed to handle routed inbox delivery for ${agentId}:`, err);
      });
    },
  );

  // Setup Machine WebSocket BEFORE Socket.io (since Socket.io intercepts all upgrade events)
  setupMachineWebSocket(server, agentOrchestrator);

  // Setup Socket.io with auth (must be after machine WS to avoid intercepting /daemon/connect)
  const io = setupSocket(server, CORS_ORIGIN);
  app.set("io", io);
  agentOrchestrator.setIO(io);
  setBillingIO(io);

  // Hourly maintenance — downgrade enforcement + webhook event cleanup
  const MAINTENANCE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  const runMaintenance = () => {
    enforceDowngradeLimits(agentOrchestrator).catch((err) =>
      console.error("[Slock] Enforcement check failed:", err));
    cleanupWebhookEvents().catch((err) =>
      console.error("[Slock] Webhook event cleanup failed:", err));
    refreshStaleSubscriptions().catch((err) =>
      console.error("[Slock] Stale subscription refresh failed:", err));
  };
  setTimeout(runMaintenance, 10_000); // Run once 10s after startup
  setInterval(runMaintenance, MAINTENANCE_INTERVAL_MS);

  // Orphan attachment cleanup (every 15 minutes)
  startOrphanCleanup();

  // Reminder fallback scanner — catches daemon-missed fires (process stall /
  // dropped push). Daemon is the primary; this is the backstop.
  const reminderScheduler = startReminderScheduler({ io, orchestrator: agentOrchestrator });

  // Start Prometheus metrics endpoint
  startMetricsServer();

  // Start server
  server.listen(PORT, () => {
    console.log(`[Slock] Server listening on http://localhost:${PORT}`);
  });

  // Graceful shutdown — close WebSocket connections before exiting
  let shuttingDown = false;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("[Slock] Shutting down...");
    reminderScheduler.stop();
    agentOrchestrator.shutdown();
    Promise.allSettled([
      serverTracer.shutdown(),
      shutdownRedis(),
    ]).then((results) => {
      const traceResult = results[0];
      if (traceResult.status === "rejected") {
        console.warn("[Slock] Failed to flush server traces:", traceResult.reason);
      }
      server.close(() => {
        process.exit(0);
      });
    });
    // Force exit after 5s if server.close() hangs
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

bootstrap().catch((err) => {
  console.error("[Slock] Fatal error:", err);
  process.exit(1);
});
