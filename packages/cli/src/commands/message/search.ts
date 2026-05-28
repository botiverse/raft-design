// `slock message search --query <q> [--channel <t>] [--sender <handle>]
//                       [--sort relevance|recent]
//                       [--before <ts>] [--after <ts>] [--limit N]`
// → GET /internal/agent/:id/search

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatSearchResults } from "./_format.js";

interface SearchOpts {
  query: string;
  channel?: string;
  sender?: string;
  sort?: string;
  before?: string;
  after?: string;
  limit?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeMemberHandleRef(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    fail("INVALID_ARG", "--sender must not be empty");
  }
  if (UUID_RE.test(trimmed)) {
    fail("INVALID_ARG", "--sender expects a member handle like @alice, not a UUID");
  }
  const handle = trimmed.replace(/^@/, "").trim();
  if (!handle) {
    fail("INVALID_ARG", "--sender handle must not be empty");
  }
  return handle;
}

export function registerSearchCommand(parent: Command): void {
  parent
    .command("search")
    .description("Search messages across channels the agent can see")
    .requiredOption("--query <q>", "Search query string")
    .option("--channel <target>", "Restrict to a single channel/DM/thread")
    .option("--sender <handle>", "Restrict to messages by sender handle, e.g. @alice")
    .option("--sort <mode>", "Sort results by relevance or recent (default: relevance)")
    .option("--before <iso>", "Only messages before this ISO datetime")
    .option("--after <iso>", "Only messages after this ISO datetime")
    .option("--limit <n>", "Max results (server default applies if omitted)")
    .action(async (opts: SearchOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      let limit: number | undefined;
      if (opts.limit !== undefined) {
        const n = Number(opts.limit);
        if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
          fail("INVALID_ARG", `--limit must be a positive integer; got ${opts.limit}`);
        }
        limit = n;
      }
      if (opts.sort !== undefined && opts.sort !== "relevance" && opts.sort !== "recent") {
        fail("INVALID_ARG", `--sort must be "relevance" or "recent"; got ${opts.sort}`);
      }

      const params = new URLSearchParams();
      params.set("q", opts.query);
      if (opts.channel) params.set("channel", opts.channel);
      // CLI member refs follow packages/cli/AGENTS.md: agent-facing identity
      // refs are handles only. The server resolves handle -> internal id and
      // applies visibility; the CLI must not require agents to discover UUIDs
      // from ordinary chat surfaces.
      if (opts.sender) params.set("sender", normalizeMemberHandleRef(opts.sender));
      if (opts.sort) params.set("sort", opts.sort);
      if (opts.before) params.set("before", opts.before);
      if (opts.after) params.set("after", opts.after);
      if (limit !== undefined) params.set("limit", String(limit));

      const client = new ApiClient(ctx);
      const res = await client.request(
        "GET",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/search?${params.toString()}`,
      );
      if (!res.ok) {
        const code = res.errorCode ?? (res.status >= 500 ? "SERVER_5XX" : "SEARCH_FAILED");
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatSearchResults(opts.query, res.data as any) + "\n");
    });
}
