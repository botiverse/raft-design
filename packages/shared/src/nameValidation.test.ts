import assert from "node:assert/strict";
import test from "node:test";
import { validateAgentName, validateName } from "./index.js";

test("validateAgentName rejects reserved mention-like handles case-insensitively", () => {
  for (const name of ["all", "Human", "HUMANS", "agent", "Agents", "here", "Idle", "BUSY", "system"]) {
    assert.match(validateAgentName(name) ?? "", /is reserved\. Choose another name\./i);
  }
});

test("validateAgentName keeps normal name validation behavior", () => {
  assert.equal(validateAgentName("dozy"), null);
  assert.equal(validateAgentName("agent-helper"), null);
  assert.equal(validateAgentName("1-agent"), validateName("1-agent", "Agent name"));
});
