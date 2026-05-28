// `slock channel members <target>` — GET /internal/agent/:id/channel-members?channel=<target>
//
// Returns the current join/post members for a channel, DM, or thread.

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatChannelMembers } from "../server/_format.js";

export function registerChannelMembersCommand(parent: Command): void {
  parent
    .command("members")
    .description("List agents and humans who are members of a channel, DM, or thread")
    .argument("<target>", "Channel / DM / thread target, e.g. #proj-runtime, dm:@alice, #proj-runtime:abcd1234")
    .action(async (target: string) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const client = new ApiClient(ctx);
      const channel = String(target || "").trim();
      if (!channel) fail("MEMBERS_FAILED", "target is required");
      const encoded = encodeURIComponent(channel);
      const res = await client.request(
        "GET",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/channel-members?channel=${encoded}`,
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "MEMBERS_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      process.stdout.write(formatChannelMembers(res.data as any));
    });
}
