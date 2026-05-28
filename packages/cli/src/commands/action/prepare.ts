// `slock action prepare --target <ch>` reads an ActionCardAction JSON from
// stdin and posts an action card to <target>.
//
// Action cards are B-mode shortcuts: an agent prepares the form, the human
// admin clicks the action verb to commit it under their own identity. The
// scope `action:prepare` gates this CLI command (added in the agent
// permission system; until that lands the command is open to all agents).
//
// Replaces the legacy `prepare_action` MCP tool — same backend route
// (`POST /internal/agent/:id/prepare-action`), same payload shape. The
// MCP tool is demoted to a deprecated shim that points here.
//
// Input shape (read from stdin, JSON):
//   { "type": "channel:create",
//     "name": "demo",
//     "visibility": "public",
//     "description": "...",
//     "initialHumans": ["uuid", ...],
//     "initialAgents": ["uuid", ...],
//     "draftHint": "..." }
// or
//   { "type": "agent:create",
//     "name": "scout",
//     "description": "...",
//     "requiredComputer": "tygg-ec2",
//     "draftHint": "..." }
// or
//   { "type": "channel:add_member",
//     "channel": "#existing-channel",
//     "humans": ["@alice", ...],
//     "agents": ["@scout", ...],
//     "draftHint": "..." }
//
// Why stdin (not flags)?  The action shape is a discriminated union with
// type-specific fields and arrays of UUIDs — flag-based design ends up
// being either rigid (subcommand per type) or awkward (repeatable opts
// for `--initial-human`). stdin JSON mirrors the existing `slock message
// send` pattern (content on stdin) and keeps the API symmetric with the
// old MCP tool's `action` argument.

import type { Readable } from "node:stream";
import type { Command } from "commander";

import { actionCardActionSchema, validateActionCardAction } from "@slock-ai/shared";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";

interface PrepareOpts {
  target: string;
}

const ACTION_HEREDOC_DELIMITER = "SLOCKACTION";

export class PrepareActionInputError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "PrepareActionInputError";
  }
}

async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  let content = "";
  stream.setEncoding("utf8");
  for await (const chunk of stream as Readable) {
    content += String(chunk);
  }
  return content;
}

function missingActionMessage(): string {
  return [
    "No action JSON received on stdin.",
    "Pipe a JSON ActionCardAction object (channel:create / agent:create / channel:add_member) into slock action prepare:",
    `  slock action prepare --target "#channel" <<'${ACTION_HEREDOC_DELIMITER}'`,
    "  {\"type\":\"channel:create\",\"name\":\"demo\",\"visibility\":\"public\"}",
    `  ${ACTION_HEREDOC_DELIMITER}`,
  ].join("\n");
}

export async function resolveActionInput(
  input: NodeJS.ReadableStream = process.stdin,
): Promise<unknown> {
  if ((input as NodeJS.ReadableStream & { isTTY?: boolean }).isTTY) {
    throw new PrepareActionInputError("MISSING_ACTION", missingActionMessage());
  }
  const raw = (await readStream(input)).replace(/^\uFEFF/, "");
  if (raw.trim().length === 0) {
    throw new PrepareActionInputError("MISSING_ACTION", missingActionMessage());
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new PrepareActionInputError(
      "INVALID_JSON",
      `Action JSON failed to parse: ${(err as Error).message}`,
    );
  }
}

export function registerActionPrepareCommand(parent: Command): void {
  parent
    .command("prepare")
    .description("Prepare an action card for a human to commit (B-mode quick-commit shortcut)")
    .requiredOption(
      "--target <target>",
      "Channel/DM/thread target to post the card. Same format as slock message send: '#channel', 'dm:@peer', '#channel:shortid'",
    )
    .action(async (opts: PrepareOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      let raw: unknown;
      try {
        raw = await resolveActionInput();
      } catch (err) {
        if (err instanceof PrepareActionInputError) fail(err.code, err.message);
        throw err;
      }

      const parsed = actionCardActionSchema.safeParse(raw);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; ");
        fail("INVALID_ACTION", `Action failed validation: ${issues}`);
      }
      const crossFieldError = validateActionCardAction(parsed.data);
      if (crossFieldError) {
        fail("INVALID_ACTION", `Action failed validation: ${crossFieldError}`);
      }

      const client = new ApiClient(ctx);
      const res = await client.request(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/prepare-action`,
        { target: opts.target, action: parsed.data },
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "PREPARE_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      const data = res.data as { messageId?: string };
      const shortId = data.messageId ? data.messageId.slice(0, 8) : null;
      process.stdout.write(
        shortId
          ? `Action card posted to ${opts.target} as message ${data.messageId} (short ${shortId}). The human can click the action verb to commit.\n`
          : `Action card posted to ${opts.target}.\n`,
      );
    });
}
