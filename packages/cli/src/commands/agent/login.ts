/**
 * `slock agent login` — let a human user wear a Slock agent's
 * identity via the device-code grant (RFC v0.8 §4.2 /
 * #wg-slock-computer:de272812).
 *
 * Per xxchan msg=edbc4976 the **self-managed agent** UX is just
 * "human gets a `sk_agent_*` and uses the CLI as that agent" — there
 * is no local runtime spawning, no daemon mode. End-to-end flow:
 *
 *   0. agent-id sanity check + profile-already-exists check (fail fast
 *      BEFORE asking the human to open a browser)
 *   1. `POST /api/auth/device/authorize`     → user_code + verificationUri
 *   2. operator opens browser + approves user identity
 *   3. `POST /api/auth/device/token`         → user session
 *   4. `POST /api/agents/:id/credentials`    → sk_agent_* (minted once)
 *   5. write `~/.slock/profiles/<slug>/credential.json` (0600)
 *
 * Subsequent CLI invocations can then run as the agent via
 * `slock --profile <slug>` or `SLOCK_PROFILE=<slug>` (see
 * `packages/cli/src/auth/env.ts`).
 *
 * WIP(self-hosted-runner-layer1): this command only creates the
 * credential/profile entry layer. It does not register or supervise a runner
 * process, emit runner lifecycle heartbeat/status, or perform runtime
 * integration.
 *
 * No interactive prompts — `slock` CLI is agent-facing, not
 * human-facing (xxchan msg=3e8330a3). The operator passes the agent
 * id via `--agent`; if they don't have one, the calling agent should
 * run `slock agent list` and ask the human via natural-language
 * conversation in the agent's own surface (Slock DM, chat, etc.).
 * All error responses include a structured `suggested_next_action`
 * so the calling agent can recover gracefully.
 */

import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Command } from "commander";
import { fetch as undiciFetch } from "undici";

import {
  DeviceCodeLoginError,
  describeDeviceCodeLoginError,
  runDeviceCodeLogin,
} from "../../agentLogin/deviceAuthClient.js";
import { resolveProfileDir } from "../../auth/env.js";
import { emit, fail } from "../../output.js";

interface AgentCredentialResponse {
  credentialId: string;
  apiKey: string;
  scopes: string[];
  agentId: string;
  agentName: string;
  serverId: string;
}

interface MintErrorDetail {
  message: string;
  suggestedNextAction?: string;
}

export function registerAgentLoginCommand(parent: Command): void {
  parent
    .command("login")
    .description(
      "Sign this CLI in as a specific Slock agent via the device-code login grant.",
    )
    .requiredOption("--server <url>", "Slock server base URL, e.g. https://slock.example.com")
    .requiredOption("--agent <agentId>", "Agent id to log in as")
    .option("--client-name <label>", "Human-readable label shown on the web approval page")
    // NOTE: Named `--profile-slug`, not `--profile`. Root `slock --profile <slug>`
    // is the "use an existing profile" selector and lives at program level;
    // Commander silently shadows a duplicate subcommand `--profile`, so login
    // would write the agent-id slug regardless of what the operator typed
    // (#wg-self-hosted-agent:4707250a Jianwei msg=f206a886 + Hao msg=319e1c26).
    // Same family pattern as `--target-version` in Computer PR-E to avoid
    // Commander root-shadow traps.
    .option("--profile-slug <slug>", "Slug to save the new profile under (defaults to the agent id). Distinct from root `slock --profile`, which selects an existing profile to use.")
    .option("--profile-dir <path>", "Override the profile directory root (default resolution: SLOCK_HOME/profiles/<slug> when SLOCK_HOME is set, else ~/.slock/profiles/<slug>)")
    .action(async (options: {
      server: string;
      agent: string;
      clientName?: string;
      profileSlug?: string;
      profileDir?: string;
    }) => {
      // Step 0a: agent-id sanity check. Catches the most common operator
      // confusion (passing a handle / channel name / URL where the server
      // expects an agent id) before we ask the human to open a browser.
      const invalidShape = describeInvalidAgentIdShape(options.agent);
      if (invalidShape) {
        fail("INVALID_AGENT_ID", invalidShape, {
          suggestedNextAction:
            `Run \`slock agent list --server ${options.server}\` to see valid agent ids, then rerun login with --agent <id>.`,
        });
      }

      // Step 0b: profile-already-exists check (Option C, xxchan call).
      // Fail closed if a profile credential file is already on disk —
      // doing this BEFORE device-code saves the human from approving in
      // the browser only to have us refuse afterward. Also avoids minting
      // a server-side credential that would be discarded.
      const profileSlug = options.profileSlug ?? options.agent;
      // Share the same resolver auth/env.ts uses so a login write at path X
      // is always read back at path X. Honors SLOCK_HOME isolation (§10
      // invariant, Dayu #wg-slock-computer msg=15528a10).
      const profileDir = options.profileDir ?? resolveProfileDir(profileSlug);
      const credentialPath = path.join(profileDir, "credential.json");
      if (await profileFileExists(credentialPath)) {
        fail(
          "PROFILE_ALREADY_EXISTS",
          `Profile '${profileSlug}' already has a credential at ${credentialPath}.`,
          {
            suggestedNextAction:
              `Use a different \`--profile-slug <slug>\` to mint a coexistent credential, OR manually delete ${credentialPath} and rerun login. Note: the existing sk_agent_* on the server is NOT revoked by deleting the local file — it remains valid until it expires or is explicitly revoked from the agent settings UI.`,
          },
        );
      }

      // Step 1-3: device-code grant → user session.
      let userSession: { accessToken: string; refreshToken: string; userId: string };
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

      // Step 4: mint sk_agent_* using the user session. No X-Server-Id
      // header — the route derives server context from the agent row
      // (CLI resource-explicit invariant, see #proj-runtime:3d515727).
      const mintRes = await undiciFetch(
        `${options.server.replace(/\/+$/, "")}/api/agents/${encodeURIComponent(options.agent)}/credentials`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${userSession.accessToken}`,
          },
          body: JSON.stringify({}),
        },
      );
      if (!mintRes.ok) {
        const body = (await safeJson(mintRes)) as { code?: string; error?: string } | null;
        const code = body?.code ?? `mint_failed_${mintRes.status}`;
        const detail = describeMintError(code, options.server);
        fail(
          code,
          detail?.message ?? body?.error ?? `Failed to mint agent credential (status ${mintRes.status}).`,
          detail?.suggestedNextAction
            ? { suggestedNextAction: detail.suggestedNextAction }
            : undefined,
        );
      }
      const minted = (await mintRes.json()) as AgentCredentialResponse;
      if (!minted.apiKey || !minted.agentId || !minted.serverId) {
        fail(
          "mint_response_invalid",
          "Server mint response was missing apiKey / agentId / serverId.",
        );
      }

      // Step 5: persist profile credential.
      await mkdir(profileDir, { recursive: true, mode: 0o700 });
      await writeFile(
        credentialPath,
        JSON.stringify(
          {
            schemaVersion: 1,
            serverUrl: options.server,
            agentId: minted.agentId,
            agentName: minted.agentName,
            serverId: minted.serverId,
            credentialId: minted.credentialId,
            scopes: minted.scopes,
            apiKey: minted.apiKey,
            createdAt: new Date().toISOString(),
          },
          null,
          2,
        ) + "\n",
        { mode: 0o600 },
      );

      emit({
        ok: true,
        data: {
          agentId: minted.agentId,
          agentName: minted.agentName,
          serverId: minted.serverId,
          credentialId: minted.credentialId,
          scopes: minted.scopes,
          profileSlug,
          credentialPath,
        },
      });
    });
}

async function safeJson(res: { json: () => Promise<unknown> }): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function profileFileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Catch obviously-wrong shapes for `--agent`. The server's agent ids are
 * opaque to the CLI, so we don't validate the format — we only reject
 * inputs that look like they belong to a different kind of identifier.
 * Returns a human-readable description of the problem when the shape is
 * obviously wrong, or `null` if the input is plausibly an agent id.
 */
export function describeInvalidAgentIdShape(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return "--agent must not be empty.";
  }
  if (trimmed.startsWith("@")) {
    return "--agent expects an agent id (an opaque server-issued identifier), not an @handle.";
  }
  if (trimmed.startsWith("#")) {
    return "--agent expects an agent id, not a #channel name.";
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.includes("/")) {
    return "--agent expects an agent id, not a URL or path.";
  }
  return null;
}

function describeMintError(code: string, serverUrl: string): MintErrorDetail | undefined {
  switch (code) {
    case "device_login_disabled":
      return { message: describeDeviceCodeLoginError(code) ?? code };
    case "agent_missing":
      return {
        message:
          "Agent id is not known on this server, or the user you approved with isn't a member of the agent's server.",
        suggestedNextAction:
          `Run \`slock agent list --server ${serverUrl}\` to see manageable agents, then rerun login with --agent <id>.`,
      };
    case "insufficient_role":
      return {
        message:
          "The user you approved with isn't a server owner or admin on the agent's server, so they can't mint agent credentials.",
        suggestedNextAction:
          "Ask a server owner or admin to grant you the `manageAgents` capability on this server, then rerun login.",
      };
    case "scopes_invalid":
    case "scopes_empty":
    case "name_invalid":
      return {
        message: "Invalid request body for the agent credential mint. Re-run with default flags.",
      };
  }
  return undefined;
}
