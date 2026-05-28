import type { Server as SocketServer } from "socket.io";
import * as reminderService from "./reminderService.js";
import type { TimeProvider } from "./reminderService.js";
import type { AgentOrchestrator } from "./agentOrchestrator.js";

/**
 * Server-side fallback scanner. The daemon is the primary mover — it runs a
 * local timer per reminder and pushes `reminder.fire_attempt` when due. This
 * scanner is the belt-and-suspenders that catches the "daemon missed its
 * timer" case (process stall, clock drift, dropped push) by polling the DB
 * and atomically firing any scheduled reminder past its grace window. The
 * atomic UPDATE guard in `fireReminder` preserves the R1/R2 invariants — if
 * the daemon won the race we see null and no-op.
 */

export interface SchedulerClock extends TimeProvider {
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(handle: unknown): void;
}

export const systemSchedulerClock: SchedulerClock = {
  now: () => new Date(),
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (h) => clearInterval(h as ReturnType<typeof setInterval>),
};

export interface ReminderSchedulerOptions {
  io?: SocketServer | null;
  /** Orchestrator used for the owner-only fire-wake delivery path (synthetic transient AgentMessage push). */
  orchestrator?: AgentOrchestrator | null;
  clock?: SchedulerClock;
  /** How often to poll (ms). Default 30s. */
  intervalMs?: number;
  /**
   * Grace period after `fireAt` before the scanner will pick up a reminder.
   * Gives the daemon time to win normally. Default 15s.
   */
  graceMs?: number;
  /** Batch cap per tick. Default 100. */
  batchSize?: number;
  /** Hook for tests to observe each fire outcome. */
  onFired?: (reminderId: string) => void;
}

export interface ReminderSchedulerHandle {
  tick(): Promise<void>;
  stop(): void;
}

export function startReminderScheduler(opts: ReminderSchedulerOptions = {}): ReminderSchedulerHandle {
  const clock = opts.clock ?? systemSchedulerClock;
  const intervalMs = opts.intervalMs ?? 30_000;
  const graceMs = opts.graceMs ?? 15_000;
  const batchSize = opts.batchSize ?? 100;

  let running = false;

  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const now = clock.now();
      const cutoff = new Date(now.getTime() - graceMs);
      const due = await reminderService.getDueReminders({
        limit: batchSize,
        clock: { now: () => cutoff },
      });
      for (const row of due) {
        try {
          // A fallback-scanner fire that is past graceMs is a catch-up by
          // definition — the daemon missed its timer. For recurring reminders
          // the agent sees `(catchup)` in the wake DM; for single-shot there's
          // no observable difference (it fires once either way).
          const catchup = row.fireAt.getTime() + graceMs < now.getTime();
          const result = await reminderService.fireReminder(row.id, row.version, { catchup });
          if (!result) continue;
          if (!result.fired) continue; // unsupported recurrence kind was skipped
          const fired = result.row;
          opts.onFired?.(fired.id);
          opts.io?.to(`server:${fired.serverId}`).emit("reminder:fired", {
            reminderId: fired.id,
            ownerAgentId: fired.ownerAgentId,
            firedAt: fired.firedAt?.toISOString() ?? new Date().toISOString(),
            firedBy: "server",
            catchup: result.catchup,
            nextFireAt: result.nextFireAt?.toISOString() ?? null,
          });
          if (opts.orchestrator) {
            await reminderService.deliverFireWake(opts.io ?? null, opts.orchestrator, fired, {
              catchup: result.catchup,
            });
          }
        } catch (err) {
          console.error(`[reminderScheduler] failed to fire ${row.id}:`, err);
        }
      }
    } catch (err) {
      console.error("[reminderScheduler] tick failed:", err);
    } finally {
      running = false;
    }
  };

  const handle = clock.setInterval(() => {
    void tick();
  }, intervalMs);

  return {
    tick,
    stop: () => clock.clearInterval(handle),
  };
}
