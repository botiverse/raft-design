// Shared inbox-drain helper for `message check`. GETs /receive then POSTs
// /receive-ack so the server doesn't replay seqs on the next poll.
//
// Contract (kuku #ab7c37e4): if /receive succeeds we MUST return the
// messages to the caller, even if the subsequent /receive-ack fails.
// Otherwise the agent loses visibility on a batch the server already
// considers delivered. Ack failure surfaces as a non-fatal `ackFailure`
// field on the result; exit code stays 0.

import type { AgentContext } from "../../auth/env.js";
import { ApiClient } from "../../client.js";
import { fail } from "../../output.js";

interface InboxMessage {
  seq: number;
  [key: string]: unknown;
}

interface ReceiveResponse {
  messages: InboxMessage[];
}

export interface DrainResult {
  messages: InboxMessage[];
  ackFailure?: { code: string; message: string };
}

export interface DrainOpts {
  block: boolean;
  timeoutMs?: number;
}

export async function drainInbox(ctx: AgentContext, opts: DrainOpts): Promise<DrainResult> {
  const client = new ApiClient(ctx);
  const agentPath = `/internal/agent/${encodeURIComponent(ctx.agentId)}`;

  const failCode = opts.block ? "WAIT_FAILED" : "CHECK_FAILED";

  const query: string[] = [];
  if (opts.block) query.push("block=true");
  if (opts.block && opts.timeoutMs !== undefined) query.push(`timeout=${opts.timeoutMs}`);
  const path = query.length > 0 ? `${agentPath}/receive?${query.join("&")}` : `${agentPath}/receive`;

  const res = await client.request<ReceiveResponse>("GET", path);
  if (!res.ok) {
    const code = res.status >= 500 ? "SERVER_5XX" : failCode;
    fail(code, res.error ?? `HTTP ${res.status}`);
  }

  const messages = res.data?.messages ?? [];
  if (ctx.clientMode === "managed-runner" || ctx.clientMode === "self-hosted-runner") {
    // Agent-api `/events` consumes/acks exactly the returned batch server-side.
    // Legacy `/receive-ack` is machine-auth only, so do not call it when this
    // CLI is authenticated through the agent-api surface (either via the
    // daemon proxy or directly as a self-managed agent).
    return { messages };
  }

  const seqs = messages.map((m) => m.seq).filter((s): s is number => Number.isInteger(s) && s > 0);

  if (seqs.length === 0) return { messages };

  const ack = await client.request("POST", `${agentPath}/receive-ack`, { seqs });
  if (ack.ok) return { messages };

  const ackCode = ack.status >= 500 ? "SERVER_5XX" : "ACK_FAILED";
  const ackMessage = ack.error ?? `HTTP ${ack.status}`;
  return { messages, ackFailure: { code: ackCode, message: ackMessage } };
}
