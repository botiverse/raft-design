import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test, { afterEach } from "node:test";

import { clearSavedDraft, getSavedDraft, setSavedDraft } from "./_continueDraftState.js";
import {
  rejectArgContent,
  rejectSendDraftStdin,
  resolveOptionalSendContent,
  resolveSendContent,
  SendContentError,
  validateDraftSendFlags,
  formatHeldSendOutput,
} from "./send.js";
import { formatFreshnessHoldOutput } from "../freshnessHold.js";

const originalDraftStateDir = process.env.SLOCK_CLI_DRAFT_STATE_DIR;

afterEach(() => {
  if (originalDraftStateDir === undefined) {
    delete process.env.SLOCK_CLI_DRAFT_STATE_DIR;
  } else {
    process.env.SLOCK_CLI_DRAFT_STATE_DIR = originalDraftStateDir;
  }
});

test("resolveSendContent reads multiline content from stdin", async () => {
  const input = Readable.from([
    "long message with 'quotes', $vars, `backticks`\n",
    "and a second line\n",
  ]);

  assert.equal(
    await resolveSendContent(input),
    "long message with 'quotes', $vars, `backticks`\nand a second line\n",
  );
});

test("resolveSendContent rejects empty stdin", async () => {
  await assert.rejects(
    () => resolveSendContent(Readable.from([])),
    (err) =>
      err instanceof SendContentError &&
      err.code === "MISSING_CONTENT" &&
      err.message.includes("<<'SLOCKMSG'") &&
      !err.message.includes("<<'EOF'"),
  );
});

test("resolveSendContent rejects whitespace-only stdin", async () => {
  await assert.rejects(
    () => resolveSendContent(Readable.from(["\n\t  \n"])),
    (err) => err instanceof SendContentError && err.code === "MISSING_CONTENT",
  );
});

test("resolveSendContent rejects TTY stdin without waiting for input", async () => {
  const input = Readable.from(["this should not be read"]);
  Object.defineProperty(input, "isTTY", { value: true });

  await assert.rejects(
    () => resolveSendContent(input),
    (err) => err instanceof SendContentError && err.code === "MISSING_CONTENT",
  );
});

test("resolveOptionalSendContent reads non-empty stdin", async () => {
  const input = Readable.from(["updated draft\n"]);

  assert.equal(await resolveOptionalSendContent(input), "updated draft\n");
});

test("resolveOptionalSendContent treats empty stdin as absent", async () => {
  assert.equal(await resolveOptionalSendContent(Readable.from([])), undefined);
  assert.equal(await resolveOptionalSendContent(Readable.from(["\n\t  \n"])), undefined);
});

test("resolveOptionalSendContent treats TTY stdin as absent without waiting", async () => {
  const input = Readable.from(["this should not be read"]);
  Object.defineProperty(input, "isTTY", { value: true });

  assert.equal(await resolveOptionalSendContent(input), undefined);
});

test("rejectArgContent gives friendly errors for positional content", () => {
  assert.throws(
    () => rejectArgContent(["hello"], {}),
    (err) =>
      err instanceof SendContentError &&
      err.code === "POSITIONAL_CONTENT_UNSUPPORTED" &&
      err.message.includes("provided on stdin"),
  );
});

test("rejectArgContent gives friendly errors for the legacy --content flag", () => {
  assert.throws(
    () => rejectArgContent([], { content: "hello" }),
    (err) =>
      err instanceof SendContentError &&
      err.code === "CONTENT_FLAG_UNSUPPORTED" &&
      err.message.includes("--content is no longer supported"),
  );
});

test("validateDraftSendFlags rejects --anyway without --send-draft", () => {
  assert.throws(
    () => validateDraftSendFlags({ anyway: true }),
    (err) =>
      err instanceof SendContentError &&
      err.code === "SEND_DRAFT_ANYWAY_REQUIRES_SEND_DRAFT",
  );
});

test("validateDraftSendFlags allows --anyway with --send-draft", () => {
  assert.doesNotThrow(() => validateDraftSendFlags({ anyway: true, sendDraft: true }));
});

test("rejectSendDraftStdin fails loud and points agents to a normal send", () => {
  assert.throws(
    () => rejectSendDraftStdin("revised draft\n", "#room:abcd1234"),
    (err) =>
      err instanceof SendContentError &&
      err.code === "SEND_DRAFT_STDIN_UNSUPPORTED" &&
      err.message.includes("does not accept stdin") &&
      err.message.includes("without --send-draft") &&
      err.message.includes("slock message send --target"),
  );
});

test("rejectSendDraftStdin allows absent stdin", () => {
  assert.doesNotThrow(() => rejectSendDraftStdin(undefined, "#room"));
});

test("local draft state stores body and expires stale drafts", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "slock-cli-drafts-"));
  process.env.SLOCK_CLI_DRAFT_STATE_DIR = tmp;

  setSavedDraft("agent-1", "#room:abcd1234", {
    content: "draft body",
    attachmentIds: ["att-1"],
    savedAt: Date.now(),
    reholdCount: 2,
    seenUpToSeq: 42,
  });

  const saved = getSavedDraft("agent-1", "#room:abcd1234");
  assert.ok(saved);
  assert.deepEqual(saved, {
    content: "draft body",
    attachmentIds: ["att-1"],
    savedAt: saved.savedAt,
    reholdCount: 2,
    seenUpToSeq: 42,
  });

  clearSavedDraft("agent-1", "#room:abcd1234");
  assert.equal(getSavedDraft("agent-1", "#room:abcd1234"), null);

  setSavedDraft("agent-1", "#room:abcd1234", {
    content: "expired body",
    attachmentIds: [],
    savedAt: Date.now() - 11 * 60 * 1000,
    reholdCount: 1,
  });
  assert.equal(getSavedDraft("agent-1", "#room:abcd1234"), null);
});

test("formatHeldSendOutput frames held context as bounded latest messages", () => {
  const out = formatHeldSendOutput("#room", {
    newMessageCount: 46,
    shownMessageCount: 3,
    omittedMessageCount: 43,
    heldMessages: [
      { seq: 44, id: "msg44", senderName: "alice", content: "forty four" },
      { seq: 45, id: "msg45", senderName: "bob", content: "forty five" },
      { seq: 46, id: "msg46", senderName: "charlie", content: "forty six" },
    ],
  });

  assert.match(out, /Freshness hold: showing latest 3 of 46 newer messages\./);
  assert.match(out, /43 earlier same-target messages omitted/);
  assert.match(out, /no longer block this action/);
  assert.match(out, /use slock message read explicitly if you need earlier context/);
  assert.match(out, /Review the bounded context shown here/);
  assert.doesNotMatch(out, /Read the new messages below/);
});

test("formatHeldSendOutput teaches a Slock-specific heredoc delimiter instead of EOF", () => {
  const out = formatHeldSendOutput("#room", {
    newMessageCount: 1,
    shownMessageCount: 1,
    omittedMessageCount: 0,
    heldMessages: [
      { seq: 1, id: "msg1", senderName: "alice", content: "new context" },
    ],
  });

  assert.match(out, /<<'SLOCKMSG'/);
  assert.match(out, /\n  SLOCKMSG\n/);
  assert.doesNotMatch(out, /<<'EOF'/);
  assert.doesNotMatch(out, /\n  EOF\n/);
});

test("formatHeldSendOutput renders canonical agent-visible message fields", () => {
  const out = formatHeldSendOutput("dm:@tygg", {
    newMessageCount: 1,
    shownMessageCount: 1,
    omittedMessageCount: 0,
    heldMessages: [
      {
        seq: 241,
        message_id: "recent-241",
        timestamp: "2026-05-19T00:00:00.000Z",
        sender_type: "user",
        sender_name: "tygg",
        content: "recent context",
      },
    ],
  });

  assert.match(out, /## Message History for dm:@tygg/);
  assert.match(out, /seq=241/);
  assert.match(out, /msg=recent-241/);
  assert.match(out, /time=(?!-)/);
  assert.match(out, /type=user/);
  assert.match(out, /@tygg: recent context/);
  assert.doesNotMatch(out, /@unknown/);
});

test("formatFreshnessHoldOutput can block non-message side effects without draft copy", () => {
  const out = formatFreshnessHoldOutput("#proj-runtime", {
    newMessageCount: 1,
    shownMessageCount: 1,
    omittedMessageCount: 0,
    heldMessages: [
      { seq: 8, message_id: "msg8", sender_name: "tygg", content: "new context" },
    ],
  }, {
    heldAction: "Your task claim was not applied.",
    draftInstructions: "After reviewing the newer context, rerun the task claim command if it is still correct.\n",
  });

  assert.match(out, /Freshness hold: showing latest 1 of 1 newer message/);
  assert.match(out, /Your task claim was not applied/);
  assert.match(out, /rerun the task claim command/);
  assert.doesNotMatch(out, /saved as a draft/);
  assert.doesNotMatch(out, /send-draft/);
});
