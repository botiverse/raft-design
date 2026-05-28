// `slock task unclaim --channel <ch> --number <N>`
// → POST /internal/agent/:id/tasks/unclaim

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatTaskUnclaimed } from "./_format.js";

interface UnclaimOpts {
  channel: string;
  number: string;
}

export function registerTaskUnclaimCommand(parent: Command): void {
  parent
    .command("unclaim")
    .description("Release a previously-claimed task")
    .requiredOption("--channel <target>", "Channel target: '#channel'")
    .requiredOption("--number <n>", "Task number to unclaim")
    .action(async (opts: UnclaimOpts) => {
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

      const client = new ApiClient(ctx);
      const res = await client.request(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/tasks/unclaim`,
        { channel: opts.channel, task_number: n },
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "UNCLAIM_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatTaskUnclaimed(n) + "\n");
    });
}
