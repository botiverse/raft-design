import assert from "node:assert/strict";
import test from "node:test";
import { getDriver } from "./index.js";

const runtimeIds = ["claude", "codex", "antigravity", "kimi", "cursor", "gemini", "copilot", "opencode"] as const;

const expectedContracts = {
  claude: {
    lifecycle: { kind: "persistent", stdin: "gated", inFlightWake: "queue" },
    communication: { chat: "slock_cli", runtimeControl: "none" },
    session: { recovery: "resume_or_fresh" },
    modelVerifiedAs: "launchable",
  },
  codex: {
    lifecycle: { kind: "persistent", stdin: "direct", inFlightWake: "steer" },
    communication: { chat: "slock_cli", runtimeControl: "mcp_runtime_actions" },
    session: { recovery: "resume_or_fresh" },
    modelVerifiedAs: "launchable",
  },
  antigravity: {
    lifecycle: { kind: "per_turn", start: "immediate", exit: "natural", inFlightWake: "spawn_new" },
    communication: { chat: "slock_cli", runtimeControl: "none" },
    session: { recovery: "resume_or_fresh" },
    modelVerifiedAs: "suggestion_only",
  },
  kimi: {
    lifecycle: { kind: "persistent", stdin: "direct", inFlightWake: "steer" },
    communication: { chat: "slock_cli", runtimeControl: "mcp_runtime_actions" },
    session: { recovery: "resume_or_fresh" },
    modelVerifiedAs: "launchable",
  },
  cursor: {
    lifecycle: { kind: "per_turn", start: "immediate", exit: "natural", inFlightWake: "spawn_new" },
    communication: { chat: "slock_cli", runtimeControl: "mcp_runtime_actions" },
    session: { recovery: "resume_or_fresh" },
    modelVerifiedAs: "launchable",
  },
  gemini: {
    lifecycle: { kind: "per_turn", start: "immediate", exit: "natural", inFlightWake: "spawn_new" },
    communication: { chat: "slock_cli", runtimeControl: "mcp_runtime_actions" },
    session: { recovery: "resume_or_fresh" },
    modelVerifiedAs: "suggestion_only",
  },
  copilot: {
    lifecycle: { kind: "per_turn", start: "immediate", exit: "natural", inFlightWake: "spawn_new" },
    communication: { chat: "slock_cli", runtimeControl: "mcp_runtime_actions" },
    session: { recovery: "resume_or_fresh" },
    modelVerifiedAs: "launchable",
  },
  opencode: {
    lifecycle: {
      kind: "per_turn",
      start: "defer_until_concrete_message",
      exit: "terminate_on_turn_end",
      inFlightWake: "coalesce_into_pending",
    },
    communication: { chat: "slock_cli", runtimeControl: "mcp_runtime_actions" },
    session: { recovery: "resume_or_fresh" },
    modelVerifiedAs: "launchable",
  },
} as const;

test("built-in runtime contracts match the current driver matrix", () => {
  for (const runtimeId of runtimeIds) {
    const driver = getDriver(runtimeId);
    const expected = expectedContracts[runtimeId];

    assert.deepEqual(driver.lifecycle, expected.lifecycle, runtimeId);
    assert.deepEqual(driver.communication, expected.communication, runtimeId);
    assert.deepEqual(driver.session, expected.session, runtimeId);
    assert.equal(driver.model.detectedModelsVerifiedAs, expected.modelVerifiedAs, runtimeId);
  }
});

test("structured contracts preserve legacy daemon flag behavior", () => {
  for (const runtimeId of runtimeIds) {
    const driver = getDriver(runtimeId);

    if (driver.lifecycle.kind === "persistent") {
      assert.equal(driver.supportsStdinNotification, true, runtimeId);
      assert.equal(driver.busyDeliveryMode, driver.lifecycle.stdin, runtimeId);
    } else {
      assert.equal(driver.supportsStdinNotification, false, runtimeId);
      assert.equal(driver.busyDeliveryMode, "none", runtimeId);
      assert.equal(driver.deferSpawnUntilMessage === true, driver.lifecycle.start === "defer_until_concrete_message", runtimeId);
      assert.equal(driver.terminateProcessOnTurnEnd === true, driver.lifecycle.exit === "terminate_on_turn_end", runtimeId);
    }

    assert.equal(driver.usesSlockCliForCommunication === true, driver.communication.chat === "slock_cli", runtimeId);
  }
});

test("runtime communication modes expose the expected control bridge", () => {
  for (const runtimeId of runtimeIds) {
    const driver = getDriver(runtimeId);
    assert.match(driver.communication.runtimeControl, /^(mcp_runtime_actions|none)$/, runtimeId);
  }
});

test("launchable model contracts expose a model-to-launch-spec round trip", async () => {
  for (const runtimeId of runtimeIds) {
    const driver = getDriver(runtimeId);
    if (driver.model.detectedModelsVerifiedAs !== "launchable") continue;

    const launchSpec = await driver.model.toLaunchSpec?.("example/model");
    assert.ok(launchSpec, runtimeId);
    assert.ok(
      launchSpec.args?.includes("example/model")
        || Object.values(launchSpec.env ?? {}).includes("example/model")
        || Object.values(launchSpec.params ?? {}).includes("example/model"),
      runtimeId,
    );
  }
});
