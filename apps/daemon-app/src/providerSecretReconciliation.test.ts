import assert from "node:assert/strict";
import test from "node:test";
import type { ProviderConfig } from "./model";
import { reconcileProviderSecrets } from "./providerSecretReconciliation";

function makeProvider(overrides: Partial<ProviderConfig> = {}): ProviderConfig {
  return {
    id: "provider-1",
    kind: "anthropic",
    credentialSource: "app-managed",
    name: "Anthropic",
    model: "Claude Sonnet 4",
    status: "pending",
    hasLocalKey: false,
    keyHint: "not configured",
    usage: "Local credentials required",
    endpoint: null,
    ...overrides,
  };
}

test("reconcileProviderSecrets downgrades stale connected providers when the local key is gone", async () => {
  const provider = makeProvider({
    status: "connected",
    hasLocalKey: true,
    keyHint: "saved locally · ••••1234",
    usage: "Ready for local agents",
    endpoint: "https://api.anthropic.com",
  });

  const result = await reconcileProviderSecrets([provider], async () => null);

  assert.equal(result.changed, true);
  assert.deepEqual(result.providers[0], {
    ...provider,
    status: "pending",
    hasLocalKey: false,
    keyHint: "not configured",
    usage: "Local credentials required",
  });
});

test("reconcileProviderSecrets rehydrates key hints from stored local secrets", async () => {
  const provider = makeProvider({
    kind: "openai",
    name: "OpenAI",
    model: "GPT-4o",
  });

  const result = await reconcileProviderSecrets([provider], async () => "sk-openai-1234");

  assert.equal(result.changed, true);
  assert.equal(result.providers[0].hasLocalKey, true);
  assert.equal(result.providers[0].keyHint, "saved locally · ••••1234");
  assert.equal(result.providers[0].status, "pending");
  assert.equal(result.providers[0].usage, "Local credentials required");
});

test("reconcileProviderSecrets preserves provider entries that already match secret reality", async () => {
  const provider = makeProvider({
    hasLocalKey: true,
    keyHint: "saved locally · ••••1234",
    usage: "Connectivity check requested",
  });

  const result = await reconcileProviderSecrets([provider], async () => "sk-test-1234");

  assert.equal(result.changed, false);
  assert.equal(result.providers[0], provider);
});
