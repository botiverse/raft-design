// `slock task update --channel <ch> --number <N> --status <s>`
// → POST /internal/agent/:id/tasks/update-status

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { formatFreshnessHoldOutput, isFreshnessHeldResponse } from "../freshnessHold.js";
import { fail } from "../../output.js";
import { formatTaskStatusUpdated } from "./_format.js";

const STATUSES = ["todo", "in_progress", "in_review", "done", "closed"] as const;
type Status = (typeof STATUSES)[number];

interface UpdateOpts {
  channel: string;
  number: string;
  status: string;
}

export function registerTaskUpdateCommand(parent: Command): void {
  parent
    .command("update")
    .description("Update task status")
    .requiredOption("--channel <target>", "Channel target: '#channel'")
    .requiredOption("--number <n>", "Task number to update")
    .requiredOption(
      "--status <status>",
      `New status. One of: ${STATUSES.join(", ")}`,
    )
    .action(async (opts: UpdateOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const n = Number(opts.number);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
        fail("INVALID_ARG", `--number must be a positive integer; got ${opts.number}`);
      }

      if (!(STATUSES as readonly string[]).includes(opts.status)) {
        fail(
          "INVALID_ARG",
          `--status must be one of: ${STATUSES.join(", ")}; got ${opts.status}`,
        );
      }

      const client = new ApiClient(ctx);
      const res = await client.request(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/tasks/update-status`,
        { channel: opts.channel, task_number: n, status: opts.status as Status },
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "UPDATE_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      if (isFreshnessHeldResponse(res.data)) {
        process.stdout.write(formatFreshnessHoldOutput(opts.channel, res.data, {
          heldAction: "Your task status update was not applied.",
          draftInstructions: "After reviewing the newer context, rerun the task update command if it is still correct.\n",
        }));
        return;
      }
      process.stdout.write(formatTaskStatusUpdated(n, opts.status) + "\n");
    });
}
