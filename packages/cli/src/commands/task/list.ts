// `slock task list --channel <ch> [--status <s>]` → GET /internal/agent/:id/tasks

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatTaskList } from "./_format.js";

interface ListOpts {
  channel: string;
  status?: string;
}

const VALID_STATUSES = new Set(["all", "todo", "in_progress", "in_review", "done", "closed"]);

export function registerTaskListCommand(parent: Command): void {
  parent
    .command("list")
    .description("List tasks in a channel")
    .requiredOption("--channel <target>", "Channel target: '#channel'")
    .option("--status <s>", "Filter: all|todo|in_progress|in_review|done (default: server-side)")
    .action(async (opts: ListOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      if (opts.status && !VALID_STATUSES.has(opts.status)) {
        fail("INVALID_ARG", `--status must be one of ${Array.from(VALID_STATUSES).join("|")}; got ${opts.status}`);
      }

      const params = new URLSearchParams();
      params.set("channel", opts.channel);
      if (opts.status) params.set("status", opts.status);

      const client = new ApiClient(ctx);
      const res = await client.request(
        "GET",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/tasks?${params.toString()}`,
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "LIST_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatTaskList(opts.channel, res.data as any, opts.status) + "\n");
    });
}
