// `slock message check` — non-blocking GET /internal/agent/:id/receive
// followed by an immediate /receive-ack of the seqs we received.
//
// Non-blocking is a hard requirement (kuku redline): the CLI must return
// promptly with whatever is in the inbox, never hold the request open.
//
// Ack-failure semantics: when /receive succeeds but /receive-ack fails,
// the messages are still emitted to the agent (server retries delivery
// on the next poll). The ack failure is silently swallowed in the
// canonical text output — the agent sees the messages but not the ack
// failure signal. See _inbox.ts for the underlying drain logic.

import type { Command } from "commander";

import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { drainInbox } from "./_inbox.js";
import { formatMessages } from "./_format.js";

export function registerCheckCommand(parent: Command): void {
  parent
    .command("check")
    .description("Drain the agent inbox (non-blocking). Acks delivered seqs before returning.")
    .action(async () => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const result = await drainInbox(ctx, { block: false });
      process.stdout.write(formatMessages(result.messages) + "\n");
    });
}
