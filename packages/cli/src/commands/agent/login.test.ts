/**
 * Unit tests for `slock agent login` helpers that don't need the network
 * or process.exit handling — the agent-id sanity check.
 *
 * The end-to-end device-code → mint → write flow is covered by the
 * server-side `agentCredentials.api.test.ts` (mint behavior) and
 * `deviceAuthClient.test.ts` (device-code flow). Wiring tests for the
 * shell-out branches (PROFILE_ALREADY_EXISTS, INVALID_AGENT_ID,
 * post-mint write) would need a `fail()` test seam or process-exit
 * shimming, which is out of scope for these unit tests.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { describeInvalidAgentIdShape } from "./login.js";

test("describeInvalidAgentIdShape: rejects @handle", () => {
  const reason = describeInvalidAgentIdShape("@huai");
  assert.ok(reason && reason.includes("@handle"), `expected @handle hint, got: ${reason}`);
});

test("describeInvalidAgentIdShape: rejects #channel name", () => {
  const reason = describeInvalidAgentIdShape("#general");
  assert.ok(reason && reason.includes("#channel"), `expected #channel hint, got: ${reason}`);
});

test("describeInvalidAgentIdShape: rejects URLs", () => {
  for (const input of [
    "https://slock.example.com/agents/abc",
    "http://slock.example.com/",
    "slock.example.com/agents/abc",
  ]) {
    const reason = describeInvalidAgentIdShape(input);
    assert.ok(
      reason && (reason.includes("URL") || reason.includes("path")),
      `expected URL/path hint for ${input}, got: ${reason}`,
    );
  }
});

test("describeInvalidAgentIdShape: rejects empty / whitespace-only", () => {
  for (const input of ["", "   "]) {
    const reason = describeInvalidAgentIdShape(input);
    assert.ok(reason && reason.includes("not be empty"), `expected empty hint, got: ${reason}`);
  }
});

test("describeInvalidAgentIdShape: accepts plausible agent ids", () => {
  for (const input of [
    "agent_abc",
    "11111111-2222-3333-4444-555555555555",
    "huai-test",
    "abc123",
  ]) {
    assert.equal(describeInvalidAgentIdShape(input), null, `expected ${input} to be accepted`);
  }
});

// --- Parser contract regression: --profile-slug must not collide with root
// `slock --profile` (Hao #wg-self-hosted-agent:4707250a msg=319e1c26,
// Jianwei msg=f206a886). The Computer `--version` root-shadow PR-E pattern
// applies here too: any subcommand option that duplicates a root flag name
// is silently shadowed by Commander, so the action runs with the wrong
// option value (or none at all). The login `--profile <slug>` regression
// caused Jianwei's fresh-home smoke to write `agent-id` instead of the
// operator-requested slug. ---
import { Command } from "commander";
import { registerAgentLoginCommand } from "./login.js";

test("login subcommand uses --profile-slug, never --profile (root-shadow contract)", () => {
  const program = new Command();
  // Mirror the real root: `-p, --profile <slug>` is the "use a profile"
  // selector. Subcommands MUST NOT declare a colliding `--profile`.
  program.option("-p, --profile <slug>", "Use existing profile");
  const agentCmd = program.command("agent");
  registerAgentLoginCommand(agentCmd);

  const loginCmd = agentCmd.commands.find((c) => c.name() === "login");
  assert.ok(loginCmd, "login subcommand should be registered");

  const profileSlugOption = loginCmd!.options.find((o) => o.long === "--profile-slug");
  const profileOption = loginCmd!.options.find((o) => o.long === "--profile");

  assert.ok(
    profileSlugOption,
    "login subcommand must declare --profile-slug (the create-side flag).",
  );
  assert.equal(
    profileOption,
    undefined,
    "login subcommand MUST NOT declare --profile — Commander silently shadows it with root --profile, so the action's options.profile would be undefined. Use --profile-slug instead. See #wg-self-hosted-agent:4707250a msg=f206a886 for the field repro.",
  );
});

test("login subcommand --profile-dir option preserved (separate semantics from --profile-slug)", () => {
  // `--profile-dir` overrides the per-profile directory path (test/operator
  // escape hatch); `--profile-slug` names the new profile. Both must coexist.
  const program = new Command();
  program.option("-p, --profile <slug>", "Use existing profile");
  const agentCmd = program.command("agent");
  registerAgentLoginCommand(agentCmd);

  const loginCmd = agentCmd.commands.find((c) => c.name() === "login");
  const profileDirOption = loginCmd!.options.find((o) => o.long === "--profile-dir");
  assert.ok(profileDirOption, "login subcommand must keep --profile-dir override.");
});
