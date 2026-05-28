import assert from "node:assert/strict";
import test from "node:test";
import {
  formatProviderKeyHint,
  normalizeProviderEndpoint,
  testProviderConnection,
} from "./providerClient";

test("normalizeProviderEndpoint fills built-in provider defaults", () => {
  assert.equal(normalizeProviderEndpoint("openai", null), "https://api.openai.com/v1");
  assert.equal(normalizeProviderEndpoint("anthropic", ""), "https://api.anthropic.com");
  assert.equal(normalizeProviderEndpoint("custom", null), null);
  assert.equal(
    normalizeProviderEndpoint("custom", "localhost:11434/v1"),
    "https://localhost:11434/v1",
  );
});

test("formatProviderKeyHint masks the saved key", () => {
  assert.equal(formatProviderKeyHint("sk-openai-1234"), "saved locally · ••••1234");
});

test("testProviderConnection uses OpenAI-compatible models endpoint", async () => {
  let calledUrl = "";
  let authHeader = "";
  const result = await testProviderConnection(
    {
      kind: "custom",
      apiKey: "sk-custom-test",
      endpoint: "https://example.com/v1",
    },
    async (input, init) => {
      calledUrl = typeof input === "string" ? input : input.toString();
      authHeader = String((init?.headers as Record<string, string> | undefined)?.Authorization ?? "");
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    },
  );

  assert.equal(calledUrl, "https://example.com/v1/models");
  assert.equal(authHeader, "Bearer sk-custom-test");
  assert.match(result.usage, /example.com/);
});

test("testProviderConnection uses Anthropic headers", async () => {
  let calledUrl = "";
  let apiKeyHeader = "";
  const result = await testProviderConnection(
    {
      kind: "anthropic",
      apiKey: "sk-ant-test",
    },
    async (input, init) => {
      calledUrl = typeof input === "string" ? input : input.toString();
      apiKeyHeader = String((init?.headers as Record<string, string> | undefined)?.["x-api-key"] ?? "");
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    },
  );

  assert.equal(calledUrl, "https://api.anthropic.com/v1/models");
  assert.equal(apiKeyHeader, "sk-ant-test");
  assert.match(result.usage, /api.anthropic.com/);
});

test("testProviderConnection turns auth failures into a friendly error", async () => {
  await assert.rejects(
    () =>
      testProviderConnection(
        {
          kind: "openai",
          apiKey: "sk-bad",
        },
        async () => new Response(JSON.stringify({ error: "nope" }), { status: 401 }),
      ),
    /rejected the saved credentials/i,
  );
});
