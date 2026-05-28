// `slock integration login --service <service>` — provision/reuse Slock Agent Login.

import type { Command } from "commander";

import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { ApiClient } from "../../client.js";
import { emit, fail } from "../../output.js";
import { formatIntegrationLogin, type IntegrationLoginResponse } from "./_format.js";

interface LoginOptions {
  service: string;
  scope?: string[];
  json?: boolean;
}

function normalizeScopes(raw: string[] | undefined): string[] | undefined {
  if (!raw || raw.length === 0) return undefined;
  const scopes = Array.from(new Set(
    raw.flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean),
  )).sort();
  if (scopes.length === 0) {
    fail("INVALID_ARG", "--scope must include at least one non-empty scope");
  }
  return scopes;
}

export function registerIntegrationLoginCommand(parent: Command): void {
  parent
    .command("login")
    .description("Provision or reuse this agent's login for a registered service")
    .requiredOption("--service <id>", "Registered service id, client id, or exact service name")
    .option("--scope <scope>", "Requested scope; can be repeated or comma-separated", (value, previous: string[] = []) => {
      previous.push(value);
      return previous;
    })
    .option("--json", "Emit machine-readable JSON")
    .action(async (opts: LoginOptions) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const service = opts.service.trim();
      if (!service) {
        fail("INVALID_ARG", "--service must not be empty");
      }

      const client = new ApiClient(ctx);
      const res = await client.request<IntegrationLoginResponse>(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/integrations/login`,
        {
          service,
          scopes: normalizeScopes(opts.scope),
        },
      );
      if (!res.ok || !res.data) {
        const code = res.status >= 500 ? "SERVER_5XX" : "INTEGRATION_LOGIN_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }

      if (opts.json) {
        emit({ ok: true, data: res.data });
        return;
      }

      process.stdout.write(`${formatIntegrationLogin(res.data)}\n`);
    });
}
