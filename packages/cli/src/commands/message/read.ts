// `slock message read --channel <t> [--before N] [--after N] [--around <id|seq>] [--limit N]`
// → GET /internal/agent/:id/history
//
// `--around` accepts either a message id (full or short prefix) or a
// numeric seq — the server's classifyHistoryAroundCursor() picks the
// right lookup mode.

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatHistory } from "./_format.js";

interface ReadOpts {
  channel: string;
  before?: string;
  after?: string;
  around?: string;
  limit?: string;
}

function parsePositiveInt(name: string, raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    fail("INVALID_ARG", `--${name} must be a positive integer; got ${raw}`);
  }
  return n;
}

export function registerReadCommand(parent: Command): void {
  parent
    .command("read")
    .description("Read message history for a channel, DM, or thread")
    .requiredOption("--channel <target>", "Target: '#channel', 'dm:@peer', '#channel:threadId', 'dm:@peer:threadId'")
    .option("--before <seq>", "Return messages strictly before this seq (paginate backwards)")
    .option("--after <seq>", "Return messages strictly after this seq (paginate forwards)")
    .option("--around <idOrSeq>", "Center the window on this messageId or seq")
    .option("--limit <n>", "Max messages to return (server default applies if omitted)")
    .action(async (opts: ReadOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const before = parsePositiveInt("before", opts.before);
      const after = parsePositiveInt("after", opts.after);
      const limit = parsePositiveInt("limit", opts.limit);

      const params = new URLSearchParams();
      params.set("channel", opts.channel);
      if (before !== undefined) params.set("before", String(before));
      if (after !== undefined) params.set("after", String(after));
      if (opts.around !== undefined) params.set("around", opts.around);
      if (limit !== undefined) params.set("limit", String(limit));

      const client = new ApiClient(ctx);
      const res = await client.request(
        "GET",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/history?${params.toString()}`,
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "READ_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatHistory(opts.channel, res.data as any, { around: opts.around, after, before }) + "\n");
    });
}
