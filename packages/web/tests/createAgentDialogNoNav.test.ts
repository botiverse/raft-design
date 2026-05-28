import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// cindyz #engineering:cdfeba5f (2026-05-22): creating an agent should not
// force-navigate to its detail page. The sidebar already surfaces the new
// agent with its initializing status, so the user should stay on whatever
// surface they triggered create from (channel, action card, settings, etc.)
// instead of being yanked to /agent/:id. A previous version unconditionally
// called nav.toAgent(agent.id) after onClose() — this contract pin keeps
// that line from coming back.

const source = readFileSync(
  resolve(import.meta.dirname, "../src/components/agent/CreateAgentDialog.tsx"),
  "utf8",
);

test("CreateAgentDialog does not navigate to the new agent after create", () => {
  assert.doesNotMatch(source, /nav\.toAgent\(/);
});
