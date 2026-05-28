// `slock reminder list [--status <s>]`
// → GET /internal/agent/:id/reminders

import type { Command } from "commander";
import type { ReminderSummary, ReminderStatus } from "@slock-ai/shared";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatReminderList } from "./_format.js";

interface ListOpts {
  status?: string;
  all?: boolean;
}

const VALID_STATUSES = new Set<ReminderStatus>(["scheduled", "fired", "canceled"]);

export function registerReminderListCommand(parent: Command): void {
  parent
    .command("list")
    .description("List your own reminders (defaults to scheduled and fired)")
    .option("--all", "Include canceled reminders")
    .option(
      "--status <s>",
      "Comma-separated statuses (scheduled,fired,canceled). Default: scheduled,fired",
    )
    .action(async (opts: ListOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const statusRaw = opts.status && opts.status.trim().length > 0 ? opts.status.trim() : "scheduled,fired";
      for (const s of statusRaw.split(",").map((x) => x.trim()).filter(Boolean)) {
        if (!VALID_STATUSES.has(s as ReminderStatus)) {
          fail("INVALID_ARG", `--status entries must be one of ${Array.from(VALID_STATUSES).join("|")}; got ${s}`);
        }
      }

      const params = new URLSearchParams();
      if (opts.all && !opts.status) {
        params.set("all", "true");
      } else {
        params.set("status", statusRaw);
      }

      const client = new ApiClient(ctx);
      const res = await client.request<{ reminders: ReminderSummary[] }>(
        "GET",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/reminders?${params.toString()}`,
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "LIST_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatReminderList(res.data?.reminders ?? []) + "\n");
    });
}
