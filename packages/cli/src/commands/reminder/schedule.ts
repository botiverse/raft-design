// `slock reminder schedule --title <t> [--delay-seconds <n> | --fire-at <iso>] [--msg-id <id>]`
// → POST /internal/agent/:id/reminders

import type { Command } from "commander";
import type { ReminderSummary } from "@slock-ai/shared";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatReminderScheduled } from "./_format.js";

export interface ScheduleOpts {
  title: string;
  delaySeconds?: string;
  fireAt?: string;
  msgId?: string;
  repeat?: string;
  channel?: string;
}

export interface ScheduleBodyResult {
  body: Record<string, unknown>;
  error?: { code: string; message: string };
}

// Pure body builder so tests can assert the agent-side reminder contract
// without spinning up an HTTP client. Agent-created reminders must carry an
// explicit anchor msgId; resolve failure should fail closed instead of
// silently creating an unanchored row.
export function buildScheduleBody(
  opts: ScheduleOpts,
  now: () => string = () => Intl.DateTimeFormat().resolvedOptions().timeZone,
): ScheduleBodyResult {
  if (!opts.delaySeconds && !opts.fireAt && !opts.repeat) {
    return {
      body: {},
      error: { code: "INVALID_ARG", message: "Provide --delay-seconds, --fire-at, or --repeat" },
    };
  }
  if (opts.delaySeconds && opts.fireAt) {
    return {
      body: {},
      error: {
        code: "INVALID_ARG",
        message: "Pass either --delay-seconds or --fire-at, not both",
      },
    };
  }

  const body: Record<string, unknown> = { title: opts.title, msgId: opts.msgId ?? null };

  if (opts.delaySeconds !== undefined) {
    const n = Number(opts.delaySeconds);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
      return {
        body: {},
        error: {
          code: "INVALID_ARG",
          message: `--delay-seconds must be a positive integer; got ${opts.delaySeconds}`,
        },
      };
    }
    body.delaySeconds = n;
  }
  if (opts.fireAt !== undefined) body.fireAt = opts.fireAt;
  if (opts.repeat !== undefined) {
    body.repeat = opts.repeat;
    // Snapshot caller's IANA tz into daily/weekly rules so later fires
    // don't drift if the caller's host tz changes. Interval rules ignore
    // tz but passing it is harmless.
    body.tz = now();
  }
  if (opts.channel !== undefined) body.channel = opts.channel;

  // Agent-created reminders must stay anchored. If we still failed to carry
  // a message anchor, fail closed instead of silently creating a
  // half-correct reminder row with msgRef = null.
  if (body.msgId == null) {
    return {
      body: {},
      error: {
        code: "INVALID_ARG",
        message:
          "Reminder create requires an anchor msgId; resolve a message first and pass --msg-id",
      },
    };
  }

  return { body };
}

export function registerReminderScheduleCommand(parent: Command): void {
  parent
    .command("schedule")
    .description("Schedule a reminder that fires at a future time")
    .requiredOption("--title <t>", "Short description of what the reminder is about")
    .option(
      "--delay-seconds <n>",
      "Preferred for relative times. Fires this many seconds from now (server-computed, timezone-safe)",
    )
    .option(
      "--fire-at <iso>",
      "ISO-8601 UTC timestamp, e.g. 2026-04-21T09:00:00Z. Use only for absolute calendar times",
    )
    .option(
      "--repeat <rule>",
      "Recurrence rule: every:15m | every:2h | every:1d | daily@09:00 | weekly:mon,fri@09:00",
    )
    .option(
      "--channel <ref>",
      "Optional channel to post a receipt message in (e.g. #general, dm:@alice).",
    )
    .requiredOption(
      "--msg-id <id>",
      "Message id this reminder is anchored to. Required for agent-created reminders.",
    )
    .action(async (opts: ScheduleOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const built = buildScheduleBody(opts);
      if (built.error) fail(built.error.code, built.error.message);

      const client = new ApiClient(ctx);
      const res = await client.request<{ reminder: ReminderSummary; warning?: string }>(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/reminders`,
        built.body,
      );
      if (!res.ok || !res.data?.reminder) {
        const code = res.status >= 500 ? "SERVER_5XX" : "SCHEDULE_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(
        formatReminderScheduled(res.data.reminder, res.data.warning ?? null) + "\n",
      );
    });
}
