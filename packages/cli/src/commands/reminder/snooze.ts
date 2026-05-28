import type { Command } from "commander";
import type { ReminderSummary } from "@slock-ai/shared";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { parseDurationSeconds } from "./_duration.js";
import { formatReminderSnoozed } from "./_format.js";
import { resolveReminderId } from "./_resolve.js";

interface SnoozeOpts {
  id: string;
  by: string;
}

export function registerReminderSnoozeCommand(parent: Command): void {
  parent
    .command("snooze")
    .description("Snooze a scheduled or fired reminder")
    .requiredOption("--id <id>", "Reminder id (full uuid or short prefix)")
    .requiredOption("--by <duration>", "Snooze duration, e.g. 30m, 2h, 1d")
    .action(async (opts: SnoozeOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const delaySeconds = parseDurationSeconds(opts.by);
      if (delaySeconds == null) {
        fail("INVALID_ARG", "--by must be a positive duration like 30m, 2h, or 1d");
      }

      const client = new ApiClient(ctx);
      const fullId = await resolveReminderId(client, ctx.agentId, opts.id, {
        statuses: ["scheduled", "fired"],
        failureCode: "SNOOZE_FAILED",
      });

      const res = await client.request<{ reminder: ReminderSummary }>(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/reminders/${encodeURIComponent(fullId)}/snooze`,
        { delaySeconds },
      );
      if (!res.ok || !res.data?.reminder) {
        const code = res.status >= 500 ? "SERVER_5XX" : "SNOOZE_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatReminderSnoozed(res.data.reminder) + "\n");
    });
}
