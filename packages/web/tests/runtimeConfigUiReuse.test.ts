import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const createAgentSource = readFileSync(
  new URL("../src/components/agent/CreateAgentDialog.tsx", import.meta.url),
  "utf8",
);
const agentDetailSource = readFileSync(
  new URL("../src/components/agent/AgentDetailPanel.tsx", import.meta.url),
  "utf8",
);
const runtimeConfigFieldsSource = readFileSync(
  new URL("../src/components/agent/RuntimeConfigFields.tsx", import.meta.url),
  "utf8",
);

test("create and edit agent flows share the runtime config field component", () => {
  assert.match(createAgentSource, /<RuntimeConfigFields[\s\S]*envVarsMode="advanced"/);
  assert.match(agentDetailSource, /<RuntimeConfigFields[\s\S]*envVarsMode="advanced"/);
  assert.match(createAgentSource, /providerApiKey=\{providerApiKey\}/);
  assert.match(agentDetailSource, /providerApiKey=\{draftProviderApiKey\}/);
});

test("edit runtime choices follow daemon-detected availability like create agent", () => {
  assert.match(agentDetailSource, /const availableRuntimes = agentMachine\?\.runtimes \|\| \[\];/);
  assert.match(agentDetailSource, /const available = availableRuntimes\.includes\(r\.id\);/);
  assert.match(agentDetailSource, /disabled: !selectable,/);
  assert.doesNotMatch(agentDetailSource, /Array\.from\(new Set\(\[\s*agent\.runtime/);
});

test("runtime config fields keep the create-agent model rescan layout", () => {
  assert.match(runtimeConfigFieldsSource, /<label className="block text-sm font-bold text-black uppercase tracking-wide">\s*Model\s*<\/label>/);
  assert.match(runtimeConfigFieldsSource, /className="ml-auto text-black\/40 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"/);
  assert.doesNotMatch(runtimeConfigFieldsSource, /<FormField label="Model">/);
});

test("custom provider API key stays in the shared provider field surface", () => {
  assert.match(runtimeConfigFieldsSource, /label="API Key" required/);
  assert.match(runtimeConfigFieldsSource, /type="password"/);
  assert.match(runtimeConfigFieldsSource, /ANTHROPIC_BASE_URL and ANTHROPIC_API_KEY/);
});

test("reasoning effort keeps omitted Claude Code effort as Default, not implicit medium", () => {
  assert.match(createAgentSource, /useState<ReasoningEffort \| null>\(null\)/);
  assert.match(runtimeConfigFieldsSource, /label: "Default"/);
  assert.match(runtimeConfigFieldsSource, /value === DEFAULT_REASONING_EFFORT_SELECT_VALUE\s*\?\s*null\s*:\s*value as ReasoningEffort/);
  assert.doesNotMatch(runtimeConfigFieldsSource, /value=\{reasoningEffort \|\| "medium"\}/);
  assert.match(agentDetailSource, /\{agent\.reasoningEffort \|\| "Default"\}/);
});
