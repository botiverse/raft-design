// `slock auth whoami` — print the bootstrapped agent context.
//
// Useful for debugging the daemon→cli env injection without making a
// network call. Token value is never echoed; only the client mode and local
// secret source are shown.

import type { Command } from "commander";

import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { emit, fail } from "../../output.js";

export function registerWhoamiCommand(parent: Command): void {
  parent
    .command("whoami")
    .description("Print the agent context resolved from env (token value redacted)")
    .action(() => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }
      emit({
        ok: true,
        data: {
          agentId: ctx.agentId,
          serverUrl: ctx.serverUrl,
          serverId: ctx.serverId,
          clientMode: ctx.clientMode,
          secretSource: ctx.secretSource,
          ...(ctx.profileSlug ? { profileSlug: ctx.profileSlug } : {}),
          ...(ctx.profileCredentialPath ? { profileCredentialPath: ctx.profileCredentialPath } : {}),
        },
      });
    });
}
