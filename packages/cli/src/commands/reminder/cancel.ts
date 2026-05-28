// `slock reminder cancel --id <full-or-short>`
// → DELETE /internal/agent/:id/reminders/:reminderId
//
// If `--id` is shorter than a full UUID (32 hex chars after stripping dashes),
// we first GET scheduled reminders and resolve by prefix. Matches the MCP
// cancel_reminder tool behavior so AX is identical.

import type { Command } from "commander";
import type { ReminderSummary } from "@slock-ai/shared";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatReminderCanceled } from "./_format.js";
import { resolveReminderId } from "./_resolve.js";

interface CancelOpts {
  id: string;
}

export function registerReminderCancelCommand(parent: Command): void {
  parent
    .command("cancel")
    .description("Cancel a scheduled reminder by id (full uuid or 8-char prefix)")
    .requiredOption("--id <id>", "Reminder id (full uuid or short prefix)")
    .action(async (opts: CancelOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      if (!opts.id || opts.id.trim().length === 0) {
        fail("INVALID_ARG", "--id is required");
      }

      const client = new ApiClient(ctx);
      const fullId = await resolveReminderId(client, ctx.agentId, opts.id, {
        statuses: ["scheduled", "fired"],
        failureCode: "CANCEL_FAILED",
      });

      const res = await client.request<{ reminder: ReminderSummary }>(
        "DELETE",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/reminders/${encodeURIComponent(fullId)}`,
      );
      if (!res.ok || !res.data?.reminder) {
        const code = res.status >= 500 ? "SERVER_5XX" : "CANCEL_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatReminderCanceled(res.data.reminder) + "\n");
    });
}
