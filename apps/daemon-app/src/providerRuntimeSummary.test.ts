import assert from "node:assert/strict";
import test from "node:test";
import type { ProviderConfig } from "./model";
import { buildProviderRuntimeSummary } from "./providerRuntimeSummary";

function makeProvider(overrides: Partial<ProviderConfig> = {}): ProviderConfig {
  return {
    id: "provider-1",
    kind: "openai",
    credentialSource: "app-managed",
    name: "OpenAI",
    model: "gpt-5.4",
    status: "connected",
    hasLocalKey: true,
    keyHint: "saved locally · ••••1234",
    usage: "Connectivity verified against api.openai.com",
    endpoint: "https://api.openai.com/v1",
    ...overrides,
  };
}

test("anthropic provider surfaces whether Claude defaults are ready locally", () => {
  assert.equal(
    buildProviderRuntimeSummary(
      makeProvider({
        kind: "anthropic",
        name: "Anthropic",
        model: "Claude Sonnet 4",
      }),
      [],
    ),
    "Claude default",
  );

  assert.equal(
    buildProviderRuntimeSummary(
      makeProvider({
        kind: "anthropic",
        name: "Anthropic",
        model: "Claude Sonnet 4",
        hasLocalKey: false,
        keyHint: "not configured",
      }),
      [],
    ),
    "Claude target",
  );
});

test("system Claude providers surface Claude Code availability", () => {
  assert.equal(
    buildProviderRuntimeSummary(
      makeProvider({
        id: "system-claude",
        kind: "anthropic",
        credentialSource: "system",
        name: "Claude Code (system)",
        model: "Claude Sonnet 4",
        status: "connected",
        hasLocalKey: false,
        keyHint: "system login",
      }),
      [],
    ),
    "Claude Code default",
  );

  assert.equal(
    buildProviderRuntimeSummary(
      makeProvider({
        id: "system-claude",
        kind: "anthropic",
        credentialSource: "system",
        name: "Claude Code (system)",
        model: "Claude Sonnet 4",
        status: "pending",
        hasLocalKey: false,
        keyHint: "system login",
      }),
      [],
    ),
    "Claude Code detected",
  );
});

test("a unique configured OpenAI-compatible provider is labeled as the Codex default", () => {
  const provider = makeProvider();

  assert.equal(buildProviderRuntimeSummary(provider, [provider]), "Codex default");
});

test("multiple configured OpenAI-compatible providers are marked ambiguous", () => {
  const openai = makeProvider({ id: "openai-1", kind: "openai", name: "OpenAI" });
  const custom = makeProvider({
    id: "custom-1",
    kind: "custom",
    name: "Gateway",
    endpoint: "https://proxy.example.com/v1",
  });

  assert.equal(buildProviderRuntimeSummary(openai, [openai, custom]), "Codex target · ambiguous");
  assert.equal(buildProviderRuntimeSummary(custom, [openai, custom]), "Codex target · ambiguous");
});

test("custom providers stay honest when they still need a local endpoint", () => {
  assert.equal(
    buildProviderRuntimeSummary(
      makeProvider({
        kind: "custom",
        name: "Gateway",
        endpoint: null,
      }),
      [],
    ),
    "Codex target · endpoint required",
  );
});
