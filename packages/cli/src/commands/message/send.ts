// `slock message send --target <t> [--attachment-id <id>...]`
// → POST /internal/agent/:id/send

import type { Readable } from "node:stream";
import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";
import { formatFreshnessHoldOutput, type FreshnessHoldOutputData } from "../freshnessHold.js";
import { clearSavedDraft, getSavedDraft, setSavedDraft } from "./_continueDraftState.js";
import { formatMessages } from "./_format.js";

interface SendOpts {
  target: string;
  content?: string;
  attachmentId?: string[];
  sendDraft?: boolean;
  anyway?: boolean;
}

const MESSAGE_HEREDOC_DELIMITER = "SLOCKMSG";

export class SendContentError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "SendContentError";
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

function missingContentMessage(): string {
  return [
    "No message content received on stdin.",
    "Use a heredoc or pipe content into slock message send:",
    `  slock message send --target "#channel" <<'${MESSAGE_HEREDOC_DELIMITER}'`,
    "  message body",
    `  ${MESSAGE_HEREDOC_DELIMITER}`,
  ].join("\n");
}

export async function resolveSendContent(input: NodeJS.ReadableStream = process.stdin): Promise<string> {
  if ((input as NodeJS.ReadableStream & { isTTY?: boolean }).isTTY) {
    throw new SendContentError("MISSING_CONTENT", missingContentMessage());
  }

  const content = await readStream(input);
  if (content.trim().length === 0) {
    throw new SendContentError("MISSING_CONTENT", missingContentMessage());
  }
  return content;
}

export async function resolveOptionalSendContent(input: NodeJS.ReadableStream = process.stdin): Promise<string | undefined> {
  if ((input as NodeJS.ReadableStream & { isTTY?: boolean }).isTTY) {
    return undefined;
  }

  const content = await readStream(input);
  return content.trim().length > 0 ? content : undefined;
}

export function rejectArgContent(positionalContent: string[], opts: Pick<SendOpts, "content">): void {
  if (positionalContent.length > 0) {
    throw new SendContentError(
      "POSITIONAL_CONTENT_UNSUPPORTED",
      [
        "Message content must be provided on stdin, not as positional arguments.",
        "Use:",
        `  slock message send --target "#channel" <<'${MESSAGE_HEREDOC_DELIMITER}'`,
        "  message body",
        `  ${MESSAGE_HEREDOC_DELIMITER}`,
      ].join("\n"),
    );
  }

  if (opts.content !== undefined) {
    throw new SendContentError(
      "CONTENT_FLAG_UNSUPPORTED",
      [
        "--content is no longer supported. Pipe message content to stdin.",
        "Use:",
        "  printf 'hello' | slock message send --target \"#channel\"",
      ].join("\n"),
    );
  }
}

export function validateDraftSendFlags(opts: Pick<SendOpts, "sendDraft" | "anyway" | "attachmentId">): void {
  if (opts.anyway && !opts.sendDraft) {
    throw new SendContentError(
      "SEND_DRAFT_ANYWAY_REQUIRES_SEND_DRAFT",
      "--anyway can only be used together with --send-draft.",
    );
  }
  if (opts.sendDraft && opts.attachmentId && opts.attachmentId.length > 0) {
    throw new SendContentError(
      "SEND_DRAFT_ATTACHMENTS_UNSUPPORTED",
      "--attachment-id cannot be used with --send-draft. Use a normal send to replace the draft.",
    );
  }
}

export function rejectSendDraftStdin(content: string | undefined, target: string): void {
  if (content === undefined) return;
  throw new SendContentError(
    "SEND_DRAFT_STDIN_UNSUPPORTED",
    [
      "--send-draft sends the current saved draft and does not accept stdin.",
      "To update the draft, send the revised content normally without --send-draft:",
      `  slock message send --target "${target}" <<'${MESSAGE_HEREDOC_DELIMITER}'`,
      "  revised message",
      `  ${MESSAGE_HEREDOC_DELIMITER}`,
    ].join("\n"),
  );
}

export function formatHeldSendOutput(target: string, data: FreshnessHoldOutputData): string {
  return formatFreshnessHoldOutput(target, data, {
    heldAction: "Your message has been saved as a draft.",
    draftInstructions:
      `To update the draft, send revised content normally:\n` +
      `  slock message send --target "${target}" <<'${MESSAGE_HEREDOC_DELIMITER}'\n` +
      `  revised message\n` +
      `  ${MESSAGE_HEREDOC_DELIMITER}\n` +
      `To send the current draft unchanged:\n` +
      `  slock message send --send-draft --target \"${target}\"\n`,
    continueAnywayInstruction:
      `If repeated updates keep blocking the same draft and this is still the right reply, you may use:\n` +
      `  slock message send --send-draft --anyway --target \"${target}\"\n`,
  });
}

export function registerSendCommand(parent: Command): void {
  parent
    .command("send")
    .description("Send a message to a channel, DM, or thread")
    .argument("[content...]", "Unsupported positional message content. Pipe content to stdin instead.")
    .requiredOption("--target <target>", "Target: '#channel', 'dm:@peer', '#channel:threadId', 'dm:@peer:threadId'")
    .option("--send-draft", "Send the current saved draft after reviewing newer messages")
    .option("--anyway", "Escape hatch: send a saved draft even if freshness re-check is still stale")
    .option("--content <content>", "Unsupported. Pipe message content to stdin instead.")
    .option(
      "--attachment-id <id>",
      "Attachment id to link (repeatable). Get one from `slock attachment upload`.",
      (value, prev: string[] = []) => prev.concat(value),
    )
    .action(async (positionalContent: string[], opts: SendOpts) => {
      try {
        rejectArgContent(positionalContent, opts);
      } catch (err) {
        if (err instanceof SendContentError) fail(err.code, err.message);
        throw err;
      }

      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const client = new ApiClient(ctx);
      try {
        validateDraftSendFlags(opts);
      } catch (err) {
        if (err instanceof SendContentError) fail(err.code, err.message);
        throw err;
      }
      let content: string | undefined;
      let outgoingContent: string;
      let outgoingAttachmentIds: string[] = [];
      let previousDraftReholdCount = 0;
      let seenUpToSeq: number | undefined;
      if (opts.sendDraft) {
        content = await resolveOptionalSendContent();
        try {
          rejectSendDraftStdin(content, opts.target);
        } catch (err) {
          if (err instanceof SendContentError) fail(err.code, err.message);
          throw err;
        }
        const savedDraft = getSavedDraft(ctx.agentId, opts.target);
        if (!savedDraft) {
          fail(
            "SEND_DRAFT_NOT_FOUND",
            [
              "No saved draft exists for this target.",
              "To create or update a draft, send message content normally:",
              `  slock message send --target "${opts.target}" <<'${MESSAGE_HEREDOC_DELIMITER}'`,
              "  message body",
              `  ${MESSAGE_HEREDOC_DELIMITER}`,
            ].join("\n"),
          );
          return;
        }
        outgoingContent = savedDraft.content;
        outgoingAttachmentIds = savedDraft.attachmentIds;
        previousDraftReholdCount = savedDraft.reholdCount;
        seenUpToSeq = savedDraft.seenUpToSeq;
      } else {
        try {
          content = await resolveSendContent();
        } catch (err) {
          if (err instanceof SendContentError) fail(err.code, err.message);
          throw err;
        }
        outgoingContent = content;
        outgoingAttachmentIds = opts.attachmentId && opts.attachmentId.length > 0 ? opts.attachmentId : [];
        const previousDraft = getSavedDraft(ctx.agentId, opts.target);
        previousDraftReholdCount = previousDraft?.reholdCount ?? 0;
        seenUpToSeq = previousDraft?.seenUpToSeq;
      }
      const body: Record<string, unknown> = {
        target: opts.target,
        content: outgoingContent,
        draftReholdCount: previousDraftReholdCount,
      };
      if (seenUpToSeq !== undefined) {
        body.seenUpToSeq = seenUpToSeq;
      }
      if (opts.sendDraft) {
        body.sendDraft = true;
        if (opts.anyway) body.continueAnyway = true;
      } else {
        body.draftReplacedExisting = previousDraftReholdCount > 0;
      }
      if (outgoingAttachmentIds.length > 0) {
        body.attachmentIds = outgoingAttachmentIds;
      }
      const res = await client.request(
        "POST",
        `/internal/agent/${encodeURIComponent(ctx.agentId)}/send`,
        body,
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "SEND_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      const data = res.data as {
        state?: "sent" | "held";
        messageId?: string;
        recentUnread?: any[];
        heldMessages?: any[];
        newMessageCount?: number;
        shownMessageCount?: number;
        omittedMessageCount?: number;
        mentionAnnotation?: { formalMentionCount: number };
        continueAnywaySuggested?: boolean;
        seenUpToSeq?: number;
      };

      if (data.state === "held") {
        setSavedDraft(ctx.agentId, opts.target, {
          content: outgoingContent,
          attachmentIds: outgoingAttachmentIds,
          savedAt: Date.now(),
          reholdCount: previousDraftReholdCount + 1,
          seenUpToSeq: data.seenUpToSeq,
        });
        process.stdout.write(formatHeldSendOutput(opts.target, data));
        return;
      }

      clearSavedDraft(ctx.agentId, opts.target);
      const shortId = data.messageId ? data.messageId.slice(0, 8) : null;
      const replyHint = shortId
        ? ` (to reply in this message's thread, use target "${opts.target.includes(":") ? opts.target : opts.target + ":" + shortId}")`
        : "";

      let unreadSection = "";
      if (data.recentUnread && data.recentUnread.length > 0) {
        unreadSection = `\n\n--- New messages you may have missed ---\n${formatMessages(data.recentUnread)}`;
      }

      process.stdout.write(`Message sent to ${opts.target}. Message ID: ${data.messageId}${replyHint}${unreadSection}\n`);
    });
}
