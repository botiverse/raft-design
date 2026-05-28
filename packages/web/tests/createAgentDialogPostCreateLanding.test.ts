import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// cindyz 2026-05-26 dm:@cindyz:b966e666 msg=f342577e refined the post-create
// landing rule (superseding the earlier "always jump to new agent DM" path):
//
//   - via action card create → stay on the action card surface
//   - via other surfaces → stay
//   - first agent (server has no agents yet, or onboarding flow) → #all
//   - fallback (no #all channel resolvable) → stay
//
// These contract pins keep the "stay" default and the "first-agent → #all"
// rescue from regressing into the previous "always jump to a new place"
// behavior.

const dialogSource = readFileSync(
  resolve(import.meta.dirname, "../src/components/agent/CreateAgentDialog.tsx"),
  "utf8",
);

const actionCardSource = readFileSync(
  resolve(import.meta.dirname, "../src/components/actions/ActionCard.tsx"),
  "utf8",
);

test("CreateAgentDialog does not jump into the new agent's DM after create", () => {
  // The previous implementation called openDM(agent.id) + nav.toDm(channel.id)
  // unconditionally. The refined spec wants STAY on most surfaces, so the
  // dialog must not reference openDM or nav.toDm in the post-create flow.
  assert.doesNotMatch(dialogSource, /openDM\(/);
  assert.doesNotMatch(dialogSource, /nav\.toDm\(/);
});

test("CreateAgentDialog routes the first agent to #all", () => {
  // Pin both halves of the rescue: (a) the "first agent" detection captured
  // before the create call mutates store state, and (b) the #all channel
  // lookup that drives the navigation.
  assert.match(dialogSource, /wasFirstAgent/);
  assert.match(dialogSource, /channels\.find\(\(c\) => c\.name === "all"\)/);
  assert.match(dialogSource, /nav\.toChannel\(allChannel\.id\)/);
});

test("CreateAgentDialog's first-agent rescue is gated on !fromActionCard", () => {
  // Action card launches must stay on the action card even when it's the
  // user's first agent — the action card already lives on a chat surface,
  // so jumping away mid-guided-flow would break the cindyz spec.
  assert.match(dialogSource, /if \(!fromActionCard && wasFirstAgent\)/);
});

test("ActionCard passes fromActionCard to CreateAgentDialog", () => {
  // The agent:create action-card callsite must opt into the "stay on this
  // surface" branch by passing fromActionCard. Without this prop the dialog
  // would treat the action-card launch like a plain sidebar launch and
  // potentially navigate the user away from the action card when the agent
  // happens to be the first one in the server.
  const agentCreateBlock = actionCardSource.match(
    /action\.type === "agent:create"[\s\S]*?<CreateAgentDialog[\s\S]*?\/>/,
  );
  assert.ok(agentCreateBlock, "expected agent:create CreateAgentDialog block");
  assert.match(agentCreateBlock[0], /fromActionCard/);
});
