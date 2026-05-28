#!/usr/bin/env node
// MCP remains only for runtime-control actions that cannot yet move to the
// slock CLI. Visible chat/task/channel/reminder communication has migrated to
// CLI across all supported runtimes.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { executeJsonRequest } from "./chatBridgeRequest.js";
import { buildChatBridgeCommonHeaders } from "./perfAttribution.js";
import { daemonFetch } from "./daemonFetch.js";

// Parse CLI args
const args = process.argv.slice(2);
let agentId = "";
let serverUrl = "http://localhost:3001";
let authToken = "";
let launchId = "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--agent-id" && args[i + 1]) agentId = args[++i];
  if (args[i] === "--server-url" && args[i + 1]) serverUrl = args[++i];
  if (args[i] === "--auth-token" && args[i + 1]) authToken = args[++i];
  if (args[i] === "--launch-id" && args[i + 1]) launchId = args[++i];
}

if (!agentId) {
  console.error("Missing --agent-id");
  process.exit(1);
}

const commonHeaders = buildChatBridgeCommonHeaders(authToken);
const runtimeActionHeaders = {
  ...commonHeaders,
  ...(launchId ? { "X-Agent-Launch-Id": launchId } : {}),
};

function bridgeFetch(url: string, init: RequestInit = {}) {
  return daemonFetch(url, init);
}

const server = new McpServer({
  name: "chat",
  version: "1.0.0",
});

const RUNTIME_PROFILE_MIGRATION_DONE_TOOL_NAME = "runtime_profile_migration_done";

server.tool(
  RUNTIME_PROFILE_MIGRATION_DONE_TOOL_NAME,
  "Deprecated compatibility no-op. Runtime Profile changes now reset the session automatically; this tool is kept so old prompts can acknowledge without blocking.",
  {
    migration_key: z.string().optional().describe("Ignored legacy migration key, if an old prompt provided one"),
  },
  async ({ migration_key }) => {
    const key = migration_key?.trim() ?? "";
    try {
      const { response: res, data } = await executeJsonRequest<{ error?: string; ok?: boolean; message?: string }>(
        `${serverUrl}/internal/agent/${agentId}/runtime-profile/migration-done`,
        {
          method: "POST",
          headers: runtimeActionHeaders,
          body: JSON.stringify({ migrationKey: key }),
        },
        {
          toolName: RUNTIME_PROFILE_MIGRATION_DONE_TOOL_NAME,
          fetchImpl: bridgeFetch,
        },
      );
      if (!res.ok) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error: ${data.error || "Runtime Profile reset acknowledgment failed"}` }],
        };
      }
      return {
        content: [{ type: "text" as const, text: data.message || "Runtime Profile migration acknowledgments are deprecated; runtime changes reset the session automatically." }],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text" as const, text: `Error: ${err.message}` }],
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
