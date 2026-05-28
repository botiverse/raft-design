import type { ReminderJob } from "@slock-ai/shared";
import type { Clock } from "./connection.js";
import { systemClock } from "./connection.js";
import { logger } from "./logger.js";

/**
 * Per-reminder local state. Version is the key-to-idempotency contract: the
 * server bumps it on every state transition and the cache only applies an
 * incoming upsert/cancel if it is newer than what we have — late packets are
 * discarded automatically.
 */
interface CacheEntry {
  job: ReminderJob;
  timer: unknown | null;
}

export interface ReminderCacheOptions {
  clock?: Clock;
  /** Called when a reminder's local timer fires. */
  onFire: (job: ReminderJob) => void;
  /** Max ms ahead we'll schedule a setTimeout. Prevents 2^31 overflow. */
  maxDelayMs?: number;
}

const DEFAULT_MAX_DELAY_MS = 24 * 60 * 60 * 1000; // 24h — re-scheduled via snapshot for longer horizons

/**
 * Daemon-side reminder cache: ephemeral `reminderId → local timer` map. The
 * server is authoritative; the cache just holds enough to fire on time.
 *
 * Version semantics:
 * - upsert(job): applied if job.version > cached.version (or not cached)
 * - cancel(id, version): applied if version >= cached.version (cancel with
 *   equal version is idempotent — the daemon may learn about cancel and the
 *   original schedule at the same version during a snapshot-driven rebuild)
 * - snapshot(agentId, jobs): replaces the cache *for that agent only*.
 *   Other agents' entries on the same daemon are left untouched — snapshots
 *   arrive one per agent after reconnect, so a global clear would have the
 *   last snapshot wipe timers set up by earlier ones.
 *
 * fireAt in the past → timer fires immediately (setTimeout with delay 0).
 */
export class ReminderCache {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly clock: Clock;
  private readonly onFire: (job: ReminderJob) => void;
  private readonly maxDelayMs: number;

  constructor(opts: ReminderCacheOptions) {
    this.clock = opts.clock ?? systemClock;
    this.onFire = opts.onFire;
    this.maxDelayMs = opts.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  }

  upsert(job: ReminderJob): void {
    const existing = this.entries.get(job.reminderId);
    if (existing && existing.job.version >= job.version) {
      logger.info(`[ReminderCache] Stale upsert for ${job.reminderId} (incoming v${job.version} <= cached v${existing.job.version}) — ignored`);
      return;
    }
    if (existing?.timer) this.clock.clearTimeout(existing.timer);
    const timer = this.scheduleTimer(job);
    this.entries.set(job.reminderId, { job, timer });
  }

  cancel(reminderId: string, version: number): void {
    const existing = this.entries.get(reminderId);
    if (!existing) return;
    if (existing.job.version > version) {
      logger.info(`[ReminderCache] Stale cancel for ${reminderId} (incoming v${version} < cached v${existing.job.version}) — ignored`);
      return;
    }
    if (existing.timer) this.clock.clearTimeout(existing.timer);
    this.entries.delete(reminderId);
  }

  snapshot(agentId: string, jobs: ReminderJob[]): void {
    for (const [reminderId, entry] of this.entries) {
      if (entry.job.ownerAgentId !== agentId) continue;
      if (entry.timer) this.clock.clearTimeout(entry.timer);
      this.entries.delete(reminderId);
    }
    for (const job of jobs) {
      if (job.ownerAgentId !== agentId) {
        logger.warn(
          `[ReminderCache] snapshot for agent ${agentId} carried job ${job.reminderId} owned by ${job.ownerAgentId} — skipping`,
        );
        continue;
      }
      const timer = this.scheduleTimer(job);
      this.entries.set(job.reminderId, { job, timer });
    }
  }

  clear(): void {
    for (const entry of this.entries.values()) {
      if (entry.timer) this.clock.clearTimeout(entry.timer);
    }
    this.entries.clear();
  }

  size(): number {
    return this.entries.size;
  }

  getJob(reminderId: string): ReminderJob | null {
    return this.entries.get(reminderId)?.job ?? null;
  }

  private scheduleTimer(job: ReminderJob): unknown {
    const fireAt = Date.parse(job.fireAt);
    if (Number.isNaN(fireAt)) {
      logger.warn(`[ReminderCache] Invalid fireAt for ${job.reminderId}: ${job.fireAt}`);
      return null;
    }
    const delay = Math.max(0, Math.min(this.maxDelayMs, fireAt - this.clock.now()));
    return this.clock.setTimeout(() => {
      // Remove before firing so onFire callback is not racing with cleanup.
      this.entries.delete(job.reminderId);
      try {
        this.onFire(job);
      } catch (err) {
        logger.error(`[ReminderCache] onFire threw for ${job.reminderId}`, err);
      }
    }, delay);
  }
}
