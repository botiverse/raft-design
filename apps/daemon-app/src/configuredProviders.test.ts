import assert from "node:assert/strict";
import test from "node:test";
import type { ProviderConfig } from "./model";
import {
  countConfiguredProviders,
  countPendingProviders,
  getConfiguredProviderKinds,
  getExistingProviderKinds,
} from "./configuredProviders";

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

test("countConfiguredProviders only counts providers with local keys", () => {
  const providers = [
    makeProvider({ id: "provider-1", kind: "anthropic", hasLocalKey: true }),
    makeProvider({ id: "provider-2", kind: "openai", hasLocalKey: false }),
    makeProvider({ id: "provider-3", kind: "custom", hasLocalKey: true }),
  ];

  assert.equal(countConfiguredProviders(providers), 2);
});

test("countPendingProviders only counts providers that still need local keys", () => {
  const providers = [
    makeProvider({ id: "provider-1", kind: "anthropic", hasLocalKey: true }),
    makeProvider({ id: "provider-2", kind: "openai", hasLocalKey: false }),
    makeProvider({ id: "provider-3", kind: "custom", hasLocalKey: false }),
  ];

  assert.equal(countPendingProviders(providers), 2);
});

test("getConfiguredProviderKinds only returns provider kinds backed by local keys", () => {
  const providers = [
    makeProvider({ id: "provider-1", kind: "anthropic", hasLocalKey: true }),
    makeProvider({ id: "provider-2", kind: "openai", hasLocalKey: false }),
    makeProvider({ id: "provider-3", kind: "custom", hasLocalKey: true }),
  ];

  assert.deepEqual(getConfiguredProviderKinds(providers), ["anthropic", "custom"]);
});

test("getExistingProviderKinds returns unique provider kinds even when a provider is still pending", () => {
  const providers = [
    makeProvider({ id: "provider-1", kind: "anthropic", hasLocalKey: true }),
    makeProvider({ id: "provider-2", kind: "openai", hasLocalKey: false }),
    makeProvider({ id: "provider-3", kind: "openai", hasLocalKey: false }),
  ];

  assert.deepEqual(getExistingProviderKinds(providers), ["anthropic", "openai"]);
});

test("countConfiguredProviders treats ready system providers as usable", () => {
  const providers = [
    makeProvider({
      id: "system-claude",
      credentialSource: "system",
      name: "Claude Code (system)",
      status: "connected",
      hasLocalKey: false,
      keyHint: "system login",
      usage: "Ready via existing Claude Code login on this machine.",
    }),
    makeProvider({ id: "provider-2", kind: "openai", hasLocalKey: false }),
  ];

  assert.equal(countConfiguredProviders(providers), 1);
  assert.equal(countPendingProviders(providers), 1);
});
