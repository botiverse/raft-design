import test from "node:test";
import assert from "node:assert/strict";
import {
  hydrateRuntimeConfig,
  runtimeConfigToLaunchFields,
  stripControlledRuntimeEnvVars,
  validateRuntimeConfig,
} from "./index.js";

test("hydrates legacy Claude env vars into structured provider config", () => {
  const config = hydrateRuntimeConfig({
    runtime: "claude",
    model: "claude-opus-4-6",
    envVars: {
      ANTHROPIC_BASE_URL: "https://gateway.example.test/v1",
      ANTHROPIC_API_KEY: "sk-ant-test",
      ANTHROPIC_CUSTOM_MODEL_OPTION: "old-generated-value",
      TEAM_FLAG: "enabled",
    },
  });

  assert.deepEqual(config, {
    version: 1 as const,
    runtime: "claude",
    provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1", apiKey: "sk-ant-test" },
    model: { kind: "custom", name: "claude-opus-4-6" },
    mode: { kind: "default" },
    reasoningEffort: null,
    envVars: { TEAM_FLAG: "enabled" },
  });
  assert.deepEqual(runtimeConfigToLaunchFields(config), {
    runtime: "claude",
    model: "claude-opus-4-6",
    mode: { kind: "default" },
    reasoningEffort: null,
    envVars: {
      TEAM_FLAG: "enabled",
      ANTHROPIC_BASE_URL: "https://gateway.example.test/v1",
      ANTHROPIC_API_KEY: "sk-ant-test",
      ANTHROPIC_CUSTOM_MODEL_OPTION: "claude-opus-4-6",
    },
  });
});

test("keeps Cursor as model-only config without provider axis", () => {
  const config = hydrateRuntimeConfig({
    runtime: "cursor",
    model: "custom-composer",
    envVars: { CURSOR_EXPERIMENT: "1" },
  });

  assert.equal(config.provider, undefined);
  assert.deepEqual(config.model, { kind: "custom", name: "custom-composer" });
  assert.deepEqual(runtimeConfigToLaunchFields(config), {
    runtime: "cursor",
    model: "custom-composer",
    mode: { kind: "default" },
    reasoningEffort: null,
    envVars: { CURSOR_EXPERIMENT: "1" },
  });
});

test("structured Claude config emits legacy launch mirrors for downlevel daemon consumption", () => {
  const launch = runtimeConfigToLaunchFields({
    version: 1,
    runtime: "claude",
    provider: { kind: "custom", apiUrl: "https://gateway.example.test/v1", apiKey: "sk-ant-test" },
    model: { kind: "custom", name: "claude-opus-4-6" },
    mode: { kind: "fast" },
    reasoningEffort: "high",
    envVars: { TEAM_FLAG: "enabled" },
  });

  assert.deepEqual(launch, {
    runtime: "claude",
    model: "claude-opus-4-6",
    mode: { kind: "fast" },
    reasoningEffort: "high",
    envVars: {
      TEAM_FLAG: "enabled",
      ANTHROPIC_BASE_URL: "https://gateway.example.test/v1",
      ANTHROPIC_API_KEY: "sk-ant-test",
      ANTHROPIC_CUSTOM_MODEL_OPTION: "claude-opus-4-6",
    },
  });
});

test("rejects provider config on runtimes without a provider launch contract", () => {
  assert.equal(validateRuntimeConfig({
    version: 1,
    runtime: "cursor",
    provider: { kind: "custom", apiUrl: "https://gateway.example.test", apiKey: "sk-ant-test" },
    model: { kind: "custom", name: "custom-composer" },
    mode: { kind: "default" },
    reasoningEffort: null,
    envVars: null,
  }), "runtimeConfig.provider is not supported for runtime: cursor");
});

test("hydrates fast mode as a structured launch variant", () => {
  const config = hydrateRuntimeConfig({
    runtimeConfig: {
      version: 1,
      runtime: "codex",
      model: { kind: "preset", id: "gpt-5.5" },
      mode: { kind: "fast" },
      reasoningEffort: "low",
    },
  });

  assert.deepEqual(config.mode, { kind: "fast" });
  assert.deepEqual(runtimeConfigToLaunchFields(config), {
    runtime: "codex",
    model: "gpt-5.5",
    mode: { kind: "fast" },
    reasoningEffort: "low",
    envVars: null,
  });
});

test("rejects fast mode on runtimes without a launch contract", () => {
  assert.equal(validateRuntimeConfig({
    version: 1,
    runtime: "cursor",
    model: { kind: "preset", id: "composer-2" },
    mode: { kind: "fast" },
    reasoningEffort: null,
    envVars: null,
  }), "runtimeConfig.mode is not supported for runtime: cursor");
});

test("rejects reasoning effort on runtimes without a launch contract", () => {
  assert.equal(validateRuntimeConfig({
    version: 1,
    runtime: "cursor",
    model: { kind: "preset", id: "composer-2" },
    mode: { kind: "default" },
    reasoningEffort: "high",
    envVars: null,
  }), "runtimeConfig.reasoningEffort is not supported for runtime: cursor");
});

test("rejects credential-bearing provider URLs", () => {
  const config = hydrateRuntimeConfig({
    runtimeConfig: {
      version: 1,
      runtime: "claude",
      provider: { kind: "custom", apiUrl: "https://user:pass@gateway.example.test", apiKey: "sk-ant-test" },
      model: { kind: "preset", id: "sonnet" },
    },
  });

  assert.equal(validateRuntimeConfig(config), "runtimeConfig.provider.apiUrl must not contain credentials");
});

test("rejects custom Claude provider without an API key", () => {
  const config = {
    version: 1 as const,
    runtime: "claude",
    provider: { kind: "custom" as const, apiUrl: "https://gateway.example.test", apiKey: "" },
    model: { kind: "preset" as const, id: "sonnet" },
    mode: { kind: "default" as const },
    reasoningEffort: null,
    envVars: null,
  };

  assert.equal(validateRuntimeConfig(config), "runtimeConfig.provider.apiKey is required");
});

test("strips runtime-owned env keys from user env vars", () => {
  assert.deepEqual(stripControlledRuntimeEnvVars("claude", {
    ANTHROPIC_BASE_URL: "https://gateway.example.test",
    ANTHROPIC_API_KEY: "sk-ant-test",
    ANTHROPIC_CUSTOM_MODEL_OPTION: "opus",
    SAFE_FLAG: "1",
  }), { SAFE_FLAG: "1" });
});
