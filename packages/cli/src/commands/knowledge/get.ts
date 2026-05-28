// `slock knowledge get <topic>` — GET /internal/agent/:id/knowledge?topic=...
//
// Interim thin command (per @cindyz unblock #engineering:14d34608 msg=0a4c283c
// "slock cli 重构不 block 功能开发" + task #445). Migrates into the new
// command framework when the CLI architecture RFC v0.4 stack (task #242,
// HaoHao) lands.
//
// Server endpoint:
//   - `/internal/agent-api/knowledge?topic=<path>&reason=<text>&turn_id=<id>&trace_id=<id>`
//     for managed-runner / self-hosted-runner (client.ts rewrites the path).
//   - Requires `knowledge:read` scope on the credential; `DEFAULT_ACTIVE_CAPABILITIES`
//     in cliTransport.ts already includes `knowledge`.
//   - Success response: `{ ok: true, docId, topicOrPath, docVersion, docState, contentType, content }`.
//   - 404: `{ ok: false, code: "knowledge_not_found", error }`.
//
// Byte-preserving output: per the agent payload sanitation contract agreed
// in #engineering:30f5f012 (msg=22d1eea3 + msg=f8aaf7a6), the server is the
// only place that may strip editorial MDX comment blocks. This command
// writes the server-served content to stdout unchanged. The CLI must not
// parse/render/strip MDX components or comments.

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";

interface KnowledgeDoc {
  ok: true;
  docId: string;
  topicOrPath: string;
  docVersion: string;
  docState: string;
  contentType: string;
  content: string;
}

export interface KnowledgeGetOptions {
  reason?: string;
  turnId?: string;
  traceId?: string;
}

export function buildKnowledgeGetPath(agentId: string, topic: string, opts: KnowledgeGetOptions): string {
  const params = new URLSearchParams();
  params.set("topic", topic);
  if (opts.reason) params.set("reason", opts.reason);
  if (opts.turnId) params.set("turn_id", opts.turnId);
  if (opts.traceId) params.set("trace_id", opts.traceId);
  return `/internal/agent/${encodeURIComponent(agentId)}/knowledge?${params.toString()}`;
}

export function formatKnowledgeStdout(content: string): string {
  return content.endsWith("\n") ? content : `${content}\n`;
}

export function registerKnowledgeGetCommand(parent: Command): void {
  parent
    .command("get <topic>")
    .description("Fetch an agent knowledge topic from the current server")
    .option("--reason <text>", "Optional rationale for fetching this topic (>=12 chars when provided)")
    .option("--turn-id <id>", "Optional turn id for correlation in the knowledge event")
    .option("--trace-id <id>", "Optional trace id for correlation in the knowledge event")
    .action(async (topic: string, opts: KnowledgeGetOptions) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const client = new ApiClient(ctx);
      const res = await client.request<KnowledgeDoc>(
        "GET",
        buildKnowledgeGetPath(ctx.agentId, topic, opts),
      );
      if (!res.ok) {
        const code = res.errorCode ?? (res.status >= 500 ? "SERVER_5XX" : "KNOWLEDGE_GET_FAILED");
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      const data = res.data;
      if (!data || data.ok !== true) {
        fail("KNOWLEDGE_GET_FAILED", "Server returned an unexpected response shape");
      }
      process.stdout.write(formatKnowledgeStdout(data.content));
    });
}
