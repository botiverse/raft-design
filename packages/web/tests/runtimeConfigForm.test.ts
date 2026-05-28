import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRuntimeConfig,
  hydrateRuntimeConfigForm,
  runtimeConfigApiKey,
  runtimeConfigApiUrl,
  runtimeConfigCustomModelName,
  runtimeConfigProviderMode,
  runtimeApiUrlUnsupportedCopy,
  supportsRuntimeFastMode,
  supportsRuntimeApiUrl,
  supportsRuntimeCustomModelName,
} from "../src/utils/runtimeConfigForm.js";

test("buildRuntimeConfig maps Claude API URL and custom model into structured config", () => {
  const config = buildRuntimeConfig({
    runtime: "claude",
    model: "sonnet",
    customModelMode: true,
    customModelName: "claude-opus-router",
    providerApiUrl: " https://gateway.example.test/v1 ",
    providerApiKey: " sk-ant-test ",
    reasoningEffort: "high",
    envVars: { TEAM_FLAG: "1" },
  });

  assert.deepEqual(config, {
    version: 1,
    runtime: "claude",
    provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1", apiKey: "sk-ant-test" },
    model: { kind: "custom", name: "claude-opus-router" },
    mode: { kind: "default" },
    reasoningEffort: "high",
    envVars: { TEAM_FLAG: "1" },
  });
});

test("hydrateRuntimeConfigForm maps legacy agent rows into editable runtime config state", () => {
  const config = hydrateRuntimeConfigForm({
    runtime: "claude",
    model: "claude-opus-router",
    reasoningEffort: "high",
    envVars: {
      ANTHROPIC_BASE_URL: "https://gateway.example.test/v1",
      ANTHROPIC_API_KEY: "sk-ant-test",
      ANTHROPIC_CUSTOM_MODEL_OPTION: "old-generated-value",
      TEAM_FLAG: "1",
    },
  });

  assert.equal(config.runtime, "claude");
  assert.equal(runtimeConfigProviderMode(config), "custom");
  assert.equal(runtimeConfigApiUrl(config), "https://gateway.example.test/v1");
  assert.equal(runtimeConfigApiKey(config), "sk-ant-test");
  assert.equal(runtimeConfigCustomModelName(config), "claude-opus-router");
  assert.equal(config.reasoningEffort, "high");
  assert.deepEqual(config.envVars, { TEAM_FLAG: "1" });
});

test("buildRuntimeConfig keeps Claude provider default when provider mode is default", () => {
  const config = buildRuntimeConfig({
    runtime: "claude",
    model: "sonnet",
    customModelMode: false,
    providerMode: "default",
    providerApiUrl: "https://stale-hidden-value.example.test",
    providerApiKey: "stale-hidden-key",
    reasoningEffort: "medium",
    envVars: null,
  });

  assert.deepEqual(config, {
    version: 1,
    runtime: "claude",
    provider: { kind: "default" },
    model: { kind: "preset", id: "sonnet" },
    mode: { kind: "default" },
    reasoningEffort: "medium",
    envVars: null,
  });
});

test("buildRuntimeConfig maps Claude custom provider only when provider mode is custom", () => {
  const config = buildRuntimeConfig({
    runtime: "claude",
    model: "opus",
    customModelMode: false,
    providerMode: "custom",
    providerApiUrl: " https://gateway.example.test ",
    providerApiKey: " sk-ant-test ",
    reasoningEffort: null,
    envVars: null,
  });

  assert.deepEqual(config.provider, {
    kind: "custom",
    apiUrl: "https://gateway.example.test",
    apiKey: "sk-ant-test",
  });
});

test("Cursor supports custom model name but not per-agent API URL", () => {
  const config = buildRuntimeConfig({
    runtime: "cursor",
    model: "gpt-5.3-codex",
    customModelMode: true,
    customModelName: "my-cursor-model",
    providerApiUrl: "https://ignored.example.test",
    envVars: null,
  });

  assert.equal(supportsRuntimeCustomModelName("cursor"), true);
  assert.equal(supportsRuntimeApiUrl("cursor"), false);
  assert.match(runtimeApiUrlUnsupportedCopy("cursor") ?? "", /does not expose a per-agent API URL/);
  assert.deepEqual(config, {
    version: 1,
    runtime: "cursor",
    model: { kind: "custom", name: "my-cursor-model" },
    mode: { kind: "default" },
    reasoningEffort: null,
    envVars: null,
  });
});

test("Codex supports custom model name and no per-agent API URL", () => {
  const config = buildRuntimeConfig({
    runtime: "codex",
    model: "gpt-5.3-codex",
    customModelMode: true,
    customModelName: "gpt-5.5-codex-preview",
    providerApiUrl: "https://ignored.example.test",
    envVars: null,
  });

  assert.equal(supportsRuntimeCustomModelName("codex"), true);
  assert.equal(supportsRuntimeApiUrl("codex"), false);
  assert.deepEqual(config, {
    version: 1,
    runtime: "codex",
    model: { kind: "custom", name: "gpt-5.5-codex-preview" },
    mode: { kind: "default" },
    reasoningEffort: null,
    envVars: null,
  });
});

test("runtime config form exposes only supported per-runtime axes", () => {
  const runtimes = ["claude", "codex", "antigravity", "kimi", "copilot", "cursor", "gemini", "opencode"];

  assert.deepEqual(runtimes.filter(supportsRuntimeApiUrl), ["claude"]);
  assert.deepEqual(runtimes.filter(supportsRuntimeFastMode), ["claude", "codex"]);
  assert.deepEqual(runtimes.filter(supportsRuntimeCustomModelName), ["claude", "codex", "copilot", "cursor"]);
});

test("buildRuntimeConfig maps fast mode only for supported runtimes", () => {
  const codexConfig = buildRuntimeConfig({
    runtime: "codex",
    model: "gpt-5.5",
    customModelMode: false,
    fastMode: true,
    reasoningEffort: "low",
    envVars: null,
  });
  const cursorConfig = buildRuntimeConfig({
    runtime: "cursor",
    model: "composer-2",
    customModelMode: false,
    fastMode: true,
    envVars: null,
  });

  assert.deepEqual(codexConfig.mode, { kind: "fast" });
  assert.deepEqual(cursorConfig.mode, { kind: "default" });
});
