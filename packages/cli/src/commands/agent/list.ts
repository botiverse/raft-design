/**
 * `slock agent list --server <url>` — discovery primitive for the
 * self-managed agent flow. Drives a device-code grant to authenticate
 * the human, then returns the agents the resulting user session has
 * `manageAgents` on across that server (and any other servers the user
 * is a member of).
 *
 * The output is **agent-readable**, not human-readable: `slock` CLI is
 * for AGENTS, not direct human use (xxchan msg=3e8330a3). The calling
 * agent reads the list, asks the human via natural-language
 * conversation in its own surface (Slock DM, chat, etc.) which agent
 * to bind, then runs `slock agent login --agent <id>` with the chosen
 * id.
 *
 * Server returns `{ agents, reason, manageable_server_count }` —
 * stable machine-readable fields, no CLI-specific copy. This command
 * maps `reason` to a CLI-shaped `suggested_next_action` via
 * `describeListResult(...)`, same layer as `login.ts:describeMintError(...)`.
 * Per @xxchan #wg-self-hosted-agent msg=4acca4ce + @Hao msg=27f60c48:
 * server API must not own client-facing next-action copy.
 *
 * This command does NOT mint any `sk_agent_*` — it's strictly a read.
 * The user session it acquires is short-lived and discarded after the
 * single list call.
 */

import type { Command } from "commander";
import { fetch as undiciFetch } from "undici";

import {
  DeviceCodeLoginError,
  runDeviceCodeLogin,
} from "../../agentLogin/deviceAuthClient.js";
import { emit, fail } from "../../output.js";

interface ManageableAgent {
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  serverId: string;
  serverName: string | null;
}

export type ListReason = "ok" | "no_manageable_server" | "no_agents_on_manageable_servers";

interface ListResponse {
  ok: boolean;
  data?: {
    agents: ManageableAgent[];
    reason?: ListReason;
    manageable_server_count?: number;
  };
}

/**
 * Map server-side stable `reason` to CLI-shaped guidance copy. Server
 * MUST stay copy-free; this function owns the CLI's next-action text.
 * Same layer as `login.ts:describeMintError(...)`.
 */
export function describeListResult(
  reason: ListReason,
  serverUrl: string,
): string {
  switch (reason) {
    case "ok":
      return `Ask the user which agent to bind to this machine, then run \`slock agent login --server ${serverUrl} --agent <id>\` with the selected agent id.`;
    case "no_manageable_server":
      return "You are logged in but don't have `manageAgents` on any server you're a member of. Ask a server owner or admin to grant the capability, then rerun `slock agent list`.";
    case "no_agents_on_manageable_servers":
      return "You have `manageAgents` on at least one server, but no agents exist on those servers yet. Ask the user to create an agent first (via web UI), then rerun `slock agent list`.";
  }
}

export function registerAgentListCommand(parent: Command): void {
  parent
    .command("list")
    .description(
      "List Slock agents the user can mint credentials for (after a device-code login).",
    )
    .requiredOption("--server <url>", "Slock server base URL, e.g. https://slock.example.com")
    .option("--client-name <label>", "Human-readable label shown on the web approval page")
    .action(async (options: { server: string; clientName?: string }) => {
      let userSession: { accessToken: string };
      try {
        userSession = await runDeviceCodeLogin({
          serverUrl: options.server,
          ...(options.clientName ? { clientName: options.clientName } : {}),
          onUserAction: ({ verificationUri, userCode, expiresInSeconds }) => {
            process.stderr.write(
              `Open ${verificationUri} in your browser, enter code ${userCode} (expires in ~${Math.max(0, Math.floor(expiresInSeconds / 60))}m).\n`,
            );
          },
        });
      } catch (err) {
        if (err instanceof DeviceCodeLoginError) {
          fail(err.code, err.message);
        }
        throw err;
      }

      const res = await undiciFetch(
        `${options.server.replace(/\/+$/, "")}/api/agents/manageable`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${userSession.accessToken}`,
          },
        },
      );
      if (!res.ok) {
        let body: { code?: string; error?: string } | null = null;
        try {
          body = (await res.json()) as { code?: string; error?: string };
        } catch {
          /* fall through */
        }
        fail(
          body?.code ?? `list_failed_${res.status}`,
          body?.error ?? `Failed to list manageable agents (status ${res.status}).`,
        );
      }

      const payload = (await res.json()) as ListResponse;
      const agents = payload.data?.agents ?? [];
      const reason: ListReason = payload.data?.reason
        ?? (agents.length > 0 ? "ok" : "no_agents_on_manageable_servers");
      const suggestedNextAction = describeListResult(reason, options.server);

      emit({
        ok: true,
        data: {
          agents,
          reason,
          ...(typeof payload.data?.manageable_server_count === "number"
            ? { manageable_server_count: payload.data.manageable_server_count }
            : {}),
          suggested_next_action: suggestedNextAction,
        },
      });
    });
}
