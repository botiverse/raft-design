import assert from "node:assert/strict";
import test from "node:test";
import { normalizeDaemonServerUrl, parseMachineBootstrapInput } from "./bootstrapCommand";

test("parseMachineBootstrapInput accepts copied daemon bootstrap commands", () => {
  const parsed = parseMachineBootstrapInput(
    "npx @slock-ai/daemon@latest --server-url https://app.slock.ai --api-key sk_machine_demo # Botiverse",
  );

  assert.deepEqual(parsed, {
    apiKey: "sk_machine_demo",
    serverUrl: "https://app.slock.ai",
    source: "command",
  });
});

test("parseMachineBootstrapInput ignores trailing shell comments before parsing flags", () => {
  const parsed = parseMachineBootstrapInput(
    "npx @slock-ai/daemon@latest --server-url https://app.slock.ai --api-key sk_machine_demo   # copied from Slock",
  );

  assert.deepEqual(parsed, {
    apiKey: "sk_machine_demo",
    serverUrl: "https://app.slock.ai",
    source: "command",
  });
});

test("parseMachineBootstrapInput handles quoted arguments and normalizes server URLs", () => {
  const parsed = parseMachineBootstrapInput(
    `npx @slock-ai/daemon@latest --server-url "app.slock.ai" --api-key 'sk_machine_demo'`,
  );

  assert.deepEqual(parsed, {
    apiKey: "sk_machine_demo",
    serverUrl: "https://app.slock.ai",
    source: "command",
  });
});

test("parseMachineBootstrapInput accepts raw machine keys as a fallback", () => {
  const parsed = parseMachineBootstrapInput("sk_machine_demo");

  assert.deepEqual(parsed, {
    apiKey: "sk_machine_demo",
    serverUrl: null,
    source: "raw-key",
  });
});

test("parseMachineBootstrapInput rejects unrelated shell text", () => {
  assert.equal(parseMachineBootstrapInput("echo hello"), null);
});

test("normalizeDaemonServerUrl keeps only the origin", () => {
  assert.equal(normalizeDaemonServerUrl("https://app.slock.ai/settings/server"), "https://app.slock.ai");
});
