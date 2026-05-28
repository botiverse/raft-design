import type { Command } from "commander";
import type { ReminderEventSummary } from "@slock-ai/shared";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatReminderLog } from "./_format.js";
import { resolveReminderId } from "./_resolve.js";

interface LogOpts {
  id: string;
}

export function registerReminderLogCommand(parent: Command): void {
  parent
    .command("log")
    .description("Show lifecycle events for one reminder")
    .requiredOption("--id <id>", "Reminder id (full uuid or short prefix)")
    .action(async (opts: LogOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const client = new ApiClient(ctx);
      const fullId = await resolveReminderId(client, ctx.agentId, opts.id, {
        all: true,
        failureCode: "LOG_FAILED",
      });

      const res = await client.request<{ events: ReminderEventSummary[] }>(
        "GET",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/reminders/${encodeURIComponent(fullId)}/log`,
      );
      if (!res.ok || !res.data?.events) {
        const code = res.status >= 500 ? "SERVER_5XX" : "LOG_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatReminderLog(res.data.events) + "\n");
    });
}
