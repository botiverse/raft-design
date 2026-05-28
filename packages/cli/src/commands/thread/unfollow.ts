// `slock thread unfollow --target <thread>`
// → POST /internal/agent/:id/threads/unfollow

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";

interface UnfollowOpts {
  target: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SHORT_ID_RE = /^[0-9a-f]{8}$/i;

export function parseThreadTarget(target: string): string | null {
  const trimmed = target.trim();
  if (UUID_RE.test(trimmed)) return trimmed;

  if (trimmed.startsWith("#")) {
    const rest = trimmed.slice(1);
    const lastColon = rest.lastIndexOf(":");
    if (lastColon > 0 && SHORT_ID_RE.test(rest.slice(lastColon + 1))) {
      return trimmed;
    }
  }

  if (trimmed.startsWith("dm:@") || trimmed.startsWith("DM:@")) {
    const rest = trimmed.slice(4);
    const lastColon = rest.lastIndexOf(":");
    if (lastColon > 0 && SHORT_ID_RE.test(rest.slice(lastColon + 1))) {
      return trimmed;
    }
  }

  return null;
}

export function formatUnfollowThreadResult(target: string): string {
  return `Unfollowed ${target}. You can still inspect the thread when its parent conversation is visible, but you will no longer receive ordinary thread delivery unless you follow it again or are mentioned.`;
}

export function registerThreadUnfollowCommand(parent: Command): void {
  parent
    .command("unfollow")
    .description("Stop following a thread you no longer need ordinary delivery for")
    .requiredOption("--target <target>", "Thread target, e.g. '#engineering:abcd1234' or 'dm:@alice:abcd1234'")
    .action(async (opts: UnfollowOpts) => {
      const thread = parseThreadTarget(opts.target);
      if (!thread) {
        fail("INVALID_TARGET", "Thread must be a thread target like '#channel:abcd1234', 'dm:@peer:abcd1234', or a thread channel UUID.");
      }

      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const client = new ApiClient(ctx);
      const res = await client.request<{ ok?: boolean }>(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/threads/unfollow`,
        { thread },
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "UNFOLLOW_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }

      process.stdout.write(formatUnfollowThreadResult(thread) + "\n");
    });
}
