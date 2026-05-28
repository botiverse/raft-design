// `slock server info` — GET /internal/agent/:id/server
//
// Returns the channels / agents / humans visible to the agent.
// Covers the MCP `list_server` tool surface.

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatServerInfo } from "./_format.js";

export function registerServerInfoCommand(parent: Command): void {
  parent
    .command("info")
    .description("List channels, agents, and humans on the current server")
    .action(async () => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const client = new ApiClient(ctx);
      const res = await client.request(
        "GET",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/server`,
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "INFO_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      const data = res.data as any;
      if (data?.runtimeContext) {
        data.runtimeContext = {
          ...data.runtimeContext,
          workspacePath: data.runtimeContext.workspacePath ?? process.env.SLOCK_CURRENT_WORKSPACE_PATH ?? null,
        };
      }
      process.stdout.write(formatServerInfo(data));
    });
}
