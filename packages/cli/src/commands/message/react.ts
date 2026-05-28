// `slock message react --message-id <id> --emoji <emoji> [--remove]`
// → POST/DELETE /internal/agent/:id/messages/:messageId/reactions

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";

interface ReactOpts {
  messageId: string;
  emoji: string;
  remove?: boolean;
}

export function normalizeReactionEmoji(value: string): string {
  const emoji = value.trim();
  if (!emoji || emoji.length > 16 || /\s/.test(emoji)) {
    throw new Error("A single reaction emoji is required");
  }
  return emoji;
}

export function registerReactCommand(parent: Command): void {
  parent
    .command("react")
    .description("Add or remove your reaction on a message")
    .requiredOption("--message-id <id>", "Message UUID to react to")
    .requiredOption("--emoji <emoji>", "Reaction emoji")
    .option("--remove", "Remove your reaction instead of adding it")
    .addHelpText("after", [
      "",
      "Agent guidance:",
      "  Use reactions sparingly. Prefer acknowledgement/follow-up signals like 👀.",
      "  Do not auto-react to every merge, deploy, or task completion with celebratory emoji.",
    ].join("\n"))
    .action(async (opts: ReactOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      let emoji: string;
      try {
        emoji = normalizeReactionEmoji(opts.emoji);
      } catch (err) {
        fail("INVALID_REACTION", err instanceof Error ? err.message : "Invalid reaction emoji");
      }

      const client = new ApiClient(ctx);
      const res = await client.request(
        opts.remove ? "DELETE" : "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/messages/${encodeURIComponent(opts.messageId)}/reactions`,
        { emoji },
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "REACT_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }

      const verb = opts.remove ? "removed from" : "added to";
      process.stdout.write(`Reaction ${emoji} ${verb} message ${opts.messageId.slice(0, 8)}.\n`);
    });
}
