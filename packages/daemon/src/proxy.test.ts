import assert from "node:assert/strict";
import test from "node:test";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ProxyAgent } from "undici";
import { buildFetchDispatcher, buildWebSocketOptions } from "./proxy.js";

test("buildWebSocketOptions returns a proxy agent when wss proxy env is configured", () => {
  const options = buildWebSocketOptions("wss://api.slock.ai/daemon/connect?key=test", {
    HTTPS_PROXY: "http://proxy.internal:8080",
  });

  assert.ok(options);
  assert.ok(options.agent instanceof HttpsProxyAgent);
});

test("buildWebSocketOptions honors NO_PROXY for localhost and internal domains", () => {
  assert.equal(
    buildWebSocketOptions("ws://localhost:3001/daemon/connect?key=test", {
      HTTP_PROXY: "http://proxy.internal:8080",
      NO_PROXY: "localhost,.internal",
    }),
    undefined,
  );

  assert.equal(
    buildWebSocketOptions("wss://api.corp.internal/daemon/connect?key=test", {
      HTTPS_PROXY: "http://proxy.internal:8080",
      NO_PROXY: "localhost,.internal",
    }),
    undefined,
  );
});

test("buildFetchDispatcher returns a proxy dispatcher when https proxy env is configured", () => {
  const dispatcher = buildFetchDispatcher("https://api.slock.ai/internal/agent/123/receive", {
    HTTPS_PROXY: "http://proxy.internal:8080",
  });

  assert.ok(dispatcher instanceof ProxyAgent);
});

test("buildFetchDispatcher honors NO_PROXY for localhost and internal domains", () => {
  assert.equal(
    buildFetchDispatcher("http://localhost:3001/internal/agent/123/receive", {
      HTTP_PROXY: "http://proxy.internal:8080",
      NO_PROXY: "localhost,.internal",
    }),
    undefined,
  );

  assert.equal(
    buildFetchDispatcher("https://api.corp.internal/internal/agent/123/receive", {
      HTTPS_PROXY: "http://proxy.internal:8080",
      NO_PROXY: "localhost,.internal",
    }),
    undefined,
  );
});
