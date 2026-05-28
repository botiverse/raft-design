import type { Command } from "commander";
import type { ReminderSummary } from "@slock-ai/shared";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { parseDurationSeconds } from "./_duration.js";
import { formatReminderUpdated } from "./_format.js";
import { resolveReminderId } from "./_resolve.js";

interface UpdateOpts {
  id: string;
  fireAt?: string;
  in?: string;
  cadence?: string;
  title?: string;
}

export function registerReminderUpdateCommand(parent: Command): void {
  parent
    .command("update")
    .description("Update one field on a scheduled reminder")
    .requiredOption("--id <id>", "Reminder id (full uuid or short prefix)")
    .option("--fire-at <iso>", "New absolute next fire time")
    .option("--in <duration>", "New relative next fire time, e.g. 30m, 2h")
    .option("--cadence <rule>", "New recurrence rule: every:15m | daily@09:00 | weekly:mon,fri@09:00")
    .option("--title <text>", "New reminder title")
    .action(async (opts: UpdateOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const mutationCount = [opts.fireAt, opts.in, opts.cadence, opts.title]
        .filter((x) => x !== undefined && x !== null).length;
      if (mutationCount !== 1) {
        fail("INVALID_ARG", "Pass exactly one of --fire-at, --in, --cadence, or --title");
      }

      const body: Record<string, unknown> = {};
      if (opts.fireAt !== undefined) body.fireAt = opts.fireAt;
      if (opts.in !== undefined) {
        const delaySeconds = parseDurationSeconds(opts.in);
        if (delaySeconds == null) {
          fail("INVALID_ARG", "--in must be a positive duration like 30m, 2h, or 1d");
        }
        body.delaySeconds = delaySeconds;
      }
      if (opts.cadence !== undefined) {
        body.repeat = opts.cadence;
        body.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      if (opts.title !== undefined) body.title = opts.title;

      const client = new ApiClient(ctx);
      const fullId = await resolveReminderId(client, ctx.agentId, opts.id, {
        all: true,
        failureCode: "UPDATE_FAILED",
      });

      const res = await client.request<{ reminder: ReminderSummary; warning?: string }>(
        "PATCH",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/reminders/${encodeURIComponent(fullId)}`,
        body,
      );
      if (!res.ok || !res.data?.reminder) {
        const code = res.status >= 500 ? "SERVER_5XX" : "UPDATE_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatReminderUpdated(res.data.reminder, res.data.warning ?? null) + "\n");
    });
}
