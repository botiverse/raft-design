import type { Command } from "commander";
import type { ProfileView } from "@slock-ai/shared";

import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { ApiClient } from "../../client.js";
import { emit, fail } from "../../output.js";
import { formatProfile } from "./_format.js";

interface ShowOptions {
  json?: boolean;
}

function normalizeTarget(target: string | undefined): string | null {
  if (target === undefined) return null;
  const trimmed = target.trim();
  if (!trimmed) {
    fail("INVALID_ARG", "profile target must not be empty");
  }
  if (!trimmed.startsWith("@")) {
    fail("INVALID_ARG", "profile target must start with @");
  }
  return trimmed;
}

export function registerProfileShowCommand(parent: Command): void {
  parent
    .command("show")
    .description("Show a profile. Omit the target to show your own profile.")
    .argument("[target]", "Handle like @alice; omit to show your own profile")
    .option("--json", "Emit machine-readable JSON")
    .action(async (target: string | undefined, opts: ShowOptions) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const normalizedTarget = normalizeTarget(target);
      const params = new URLSearchParams();
      if (normalizedTarget) params.set("target", normalizedTarget);

      const client = new ApiClient(ctx);
      const pathname = params.size > 0
        ? `/internal/agent/${encodeURIComponent(ctx.agentId)}/profile?${params.toString()}`
        : `/internal/agent/${encodeURIComponent(ctx.agentId)}/profile`;
      const res = await client.request<ProfileView>("GET", pathname);
      if (!res.ok || !res.data) {
        const code = res.status >= 500 ? "SERVER_5XX" : "PROFILE_SHOW_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }

      if (opts.json) {
        emit({ ok: true, data: res.data });
        return;
      }

      process.stdout.write(`${formatProfile(res.data)}\n`);
    });
}
