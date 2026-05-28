// `slock integration list` — GET /internal/agent/:id/integrations

import type { Command } from "commander";

import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { ApiClient } from "../../client.js";
import { emit, fail } from "../../output.js";
import { formatIntegrationList, type IntegrationListResponse } from "./_format.js";

interface ListOptions {
  json?: boolean;
}

export function registerIntegrationListCommand(parent: Command): void {
  parent
    .command("list")
    .description("List registered third-party services and this agent's active logins")
    .option("--json", "Emit machine-readable JSON")
    .action(async (opts: ListOptions) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const client = new ApiClient(ctx);
      const res = await client.request<IntegrationListResponse>(
        "GET",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/integrations`,
      );
      if (!res.ok || !res.data) {
        const code = res.status >= 500 ? "SERVER_5XX" : "INTEGRATION_LIST_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }

      if (opts.json) {
        emit({ ok: true, data: res.data });
        return;
      }

      process.stdout.write(`${formatIntegrationList(res.data)}\n`);
    });
}
