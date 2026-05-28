import assert from "node:assert/strict";
import test from "node:test";
import type { ProviderConfig } from "./model";
import { resolveDefaultAgentEnvVars } from "./providerEnv";

function makeProvider(overrides: Partial<ProviderConfig> = {}): ProviderConfig {
  return {
    id: "provider-1",
    kind: "openai",
    credentialSource: "app-managed",
    name: "OpenAI",
    model: "gpt-5.4",
    status: "connected",
    hasLocalKey: true,
    keyHint: "saved locally",
    usage: "ready",
    endpoint: "https://api.openai.com/v1",
    ...overrides,
  };
}

test("claude runtime receives the saved Anthropic API key", async () => {
  const envVars = await resolveDefaultAgentEnvVars(
    "claude",
    [makeProvider({ id: "anthropic-1", kind: "anthropic", name: "Anthropic", model: "sonnet", endpoint: "https://api.anthropic.com" })],
    async (providerId) => (providerId === "anthropic-1" ? "sk-ant-123" : null),
  );

  assert.deepEqual(envVars, {
    ANTHROPIC_API_KEY: "sk-ant-123",
  });
});

test("codex runtime receives a unique OpenAI-compatible provider as OPENAI defaults", async () => {
  const envVars = await resolveDefaultAgentEnvVars(
    "codex",
    [makeProvider({ id: "dashscope-1", kind: "alibaba", name: "DashScope", endpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1" })],
    async (providerId) => (providerId === "dashscope-1" ? "sk-openai-compatible" : null),
  );

  assert.deepEqual(envVars, {
    OPENAI_API_KEY: "sk-openai-compatible",
    OPENAI_BASE_URL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  });
});

test("codex runtime refuses to guess between multiple OpenAI-compatible providers", async () => {
  const envVars = await resolveDefaultAgentEnvVars(
    "codex",
    [
      makeProvider({ id: "openai-1", kind: "openai", name: "OpenAI" }),
      makeProvider({ id: "custom-1", kind: "custom", name: "Custom Gateway", endpoint: "https://proxy.example.com/v1" }),
    ],
    async () => "sk-present",
  );

  assert.equal(envVars, null);
});

test("unsupported runtimes do not receive machine-level provider defaults", async () => {
  const envVars = await resolveDefaultAgentEnvVars(
    "kimi",
    [makeProvider({ id: "openai-1" })],
    async () => "sk-openai",
  );

  assert.equal(envVars, null);
});
