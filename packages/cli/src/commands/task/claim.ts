// `slock task claim --channel <ch> [--number N ...] [--message-id <id> ...]`
// → POST /internal/agent/:id/tasks/claim
//
// Either --number (task number) or --message-id (short or full) — at
// least one is required. Each instance of a flag can be repeated to
// claim several tasks in one call.

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { formatFreshnessHoldOutput, isFreshnessHeldResponse } from "../freshnessHold.js";
import { fail } from "../../output.js";
import { formatClaimResults } from "./_format.js";

interface ClaimOpts {
  channel: string;
  number?: string[];
  messageId?: string[];
}

export function registerTaskClaimCommand(parent: Command): void {
  parent
    .command("claim")
    .description("Claim one or more tasks (by task number or message id)")
    .requiredOption("--channel <target>", "Channel target: '#channel'")
    .option(
      "--number <n>",
      "Task number to claim (repeatable)",
      (value, prev: string[] = []) => prev.concat(value),
    )
    .option(
      "--message-id <id>",
      "Message id (full or short) to claim (repeatable)",
      (value, prev: string[] = []) => prev.concat(value),
    )
    .action(async (opts: ClaimOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const numbers = (opts.number ?? []).map((raw) => {
        const n = Number(raw);
        if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
          fail("INVALID_ARG", `--number must be a positive integer; got ${raw}`);
        }
        return n;
      });
      const messageIds = opts.messageId ?? [];

      if (numbers.length === 0 && messageIds.length === 0) {
        fail("INVALID_ARG", "Provide at least one --number or --message-id");
      }

      const body: Record<string, unknown> = { channel: opts.channel };
      if (numbers.length > 0) body.task_numbers = numbers;
      if (messageIds.length > 0) body.message_ids = messageIds;

      const client = new ApiClient(ctx);
      const res = await client.request(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/tasks/claim`,
        body,
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "CLAIM_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      if (isFreshnessHeldResponse(res.data)) {
        process.stdout.write(formatFreshnessHoldOutput(opts.channel, res.data, {
          heldAction: "Your task claim was not applied.",
          draftInstructions: "After reviewing the newer context, rerun the task claim command if it is still correct.\n",
        }));
        return;
      }
      process.stdout.write(formatClaimResults(opts.channel, res.data as any) + "\n");
    });
}
