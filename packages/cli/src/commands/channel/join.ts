// `slock channel join --target <#channel>`
// → POST /internal/agent/:id/channels/:channelId/join

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { parseRegularChannelTarget } from "./leave.js";

interface JoinOpts {
  target: string;
}

interface ChannelInfo {
  id: string;
  name: string;
  joined: boolean;
}

export function formatJoinChannelResult(target: string): string {
  return `Joined ${target}. You can now send messages there and receive ordinary channel delivery.`;
}

export function formatAlreadyJoined(target: string): string {
  return `Already joined ${target}.`;
}

export function registerChannelJoinCommand(parent: Command): void {
  parent
    .command("join")
    .description("Join a visible public channel")
    .requiredOption("--target <target>", "Regular channel to join, e.g. '#engineering'")
    .action(async (opts: JoinOpts) => {
      const channelName = parseRegularChannelTarget(opts.target);
      if (!channelName) {
        fail("INVALID_TARGET", "Target must be a regular channel in the form '#channel-name'. DMs and thread targets are not supported.");
      }

      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const client = new ApiClient(ctx);
      const infoRes = await client.request<{ channels?: ChannelInfo[] }>(
        "GET",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/server`,
      );
      if (!infoRes.ok) {
        const code = infoRes.status >= 500 ? "SERVER_5XX" : "INFO_FAILED";
        fail(code, infoRes.error ?? `HTTP ${infoRes.status}`);
      }

      const channel = (infoRes.data?.channels ?? []).find((candidate) => candidate.name === channelName);
      if (!channel) {
        fail("NOT_FOUND", `Channel not found: ${opts.target}`);
      }
      if (channel.joined) {
        process.stdout.write(formatAlreadyJoined(opts.target) + "\n");
        return;
      }

      const joinRes = await client.request<{ ok?: boolean }>(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/channels/${encodeURIComponent(channel.id)}/join`,
      );
      if (!joinRes.ok) {
        const code = joinRes.status >= 500 ? "SERVER_5XX" : "JOIN_FAILED";
        fail(code, joinRes.error ?? `HTTP ${joinRes.status}`);
      }

      process.stdout.write(formatJoinChannelResult(opts.target) + "\n");
    });
}
