// `slock channel leave --target <#channel>`
// → POST /internal/agent/:id/channels/:channelId/leave

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";

interface LeaveOpts {
  target: string;
}

interface ChannelInfo {
  id: string;
  name: string;
  joined: boolean;
}

export function parseRegularChannelTarget(target: string): string | null {
  if (!target.startsWith("#")) return null;
  if (target.includes(":")) return null;
  const name = target.slice(1).trim();
  return name.length > 0 ? name : null;
}

export function formatLeaveChannelResult(target: string): string {
  return `Left ${target}. You can still inspect visible public channel history there, but you can no longer send or receive ordinary channel delivery until you join the public channel again or a human re-adds you to a private channel.`;
}

export function formatAlreadyNotJoined(target: string): string {
  return `Already not joined in ${target}.`;
}

export function registerChannelLeaveCommand(parent: Command): void {
  parent
    .command("leave")
    .description("Leave a regular channel you have joined")
    .requiredOption("--target <target>", "Regular channel to leave, e.g. '#engineering'")
    .action(async (opts: LeaveOpts) => {
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
      if (!channel.joined) {
        process.stdout.write(formatAlreadyNotJoined(opts.target) + "\n");
        return;
      }

      const leaveRes = await client.request<{ ok?: boolean }>(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/channels/${encodeURIComponent(channel.id)}/leave`,
      );
      if (!leaveRes.ok) {
        const code = leaveRes.status >= 500 ? "SERVER_5XX" : "LEAVE_FAILED";
        fail(code, leaveRes.error ?? `HTTP ${leaveRes.status}`);
      }

      process.stdout.write(formatLeaveChannelResult(opts.target) + "\n");
    });
}
