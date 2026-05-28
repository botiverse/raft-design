import assert from "node:assert/strict";
import test from "node:test";

import { buildKnowledgeGetPath, formatKnowledgeStdout } from "./get.js";

test("buildKnowledgeGetPath: minimal request only carries topic", () => {
  const path = buildKnowledgeGetPath("agent-123", "workspace.server", {});
  assert.equal(path, "/internal/agent/agent-123/knowledge?topic=workspace.server");
});

test("buildKnowledgeGetPath: all optional correlation fields are wire-encoded", () => {
  const path = buildKnowledgeGetPath("agent-1", "participants.agent-profile", {
    reason: "Looking up the agent profile contract for an authoring decision.",
    turnId: "turn-7",
    traceId: "trace-9",
  });
  const parsed = new URLSearchParams(path.split("?")[1]);
  assert.equal(parsed.get("topic"), "participants.agent-profile");
  assert.equal(parsed.get("reason"), "Looking up the agent profile contract for an authoring decision.");
  assert.equal(parsed.get("turn_id"), "turn-7");
  assert.equal(parsed.get("trace_id"), "trace-9");
});

test("buildKnowledgeGetPath: agent id with reserved characters is encoded once", () => {
  const path = buildKnowledgeGetPath("agent/with spaces", "topic", {});
  assert.equal(path, "/internal/agent/agent%2Fwith%20spaces/knowledge?topic=topic");
});

test("formatKnowledgeStdout: byte-preserves content that already ends with newline", () => {
  const input = "# Hello\n\nbody\n";
  assert.equal(formatKnowledgeStdout(input), input);
});

test("formatKnowledgeStdout: appends a trailing newline when missing", () => {
  assert.equal(formatKnowledgeStdout("# Hello\n\nbody"), "# Hello\n\nbody\n");
});

test("formatKnowledgeStdout: does not parse, strip, or render MDX-shaped tokens", () => {
  // Regression guard per #engineering:30f5f012 agreement (msg=cbbf5cc1 +
  // msg=22d1eea3): CLI byte-preserves whatever the server returns. Future
  // MDX rendering must be an explicit opt-in. If the server returns content
  // with a `<UnknownComponent>` literal or an unstripped `{/* */}` comment,
  // the CLI must surface them verbatim and let the operator notice the
  // server-side sanitation regression.
  const mdxLeak = "# Doc\n\n<UnknownComponent>literal</UnknownComponent>\n\n{/* server-side comment */}\n";
  assert.equal(formatKnowledgeStdout(mdxLeak), mdxLeak);
});
