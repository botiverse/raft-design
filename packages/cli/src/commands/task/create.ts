// `slock task create --channel <ch> --title <t> [--title <t2> ...]`
// → POST /internal/agent/:id/tasks  body: { channel, tasks: [{title}, ...] }

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatTasksCreated } from "./_format.js";

interface CreateOpts {
  channel: string;
  title?: string[];
}

export function registerTaskCreateCommand(parent: Command): void {
  parent
    .command("create")
    .description("Create one or more tasks in a channel")
    .requiredOption("--channel <target>", "Channel target: '#channel'")
    .requiredOption(
      "--title <title>",
      "Task title (repeatable for batch create)",
      (value, prev: string[] = []) => prev.concat(value),
    )
    .action(async (opts: CreateOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const titles = opts.title ?? [];
      if (titles.length === 0) fail("INVALID_ARG", "--title is required (at least one)");

      const client = new ApiClient(ctx);
      const res = await client.request(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/tasks`,
        { channel: opts.channel, tasks: titles.map((title) => ({ title })) },
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "CREATE_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatTasksCreated(opts.channel, res.data as any) + "\n");
    });
}
