import assert from "node:assert/strict";
import test from "node:test";
import { ProxyAgent } from "undici";
import { withDaemonFetchProxy } from "./daemonFetch.js";

test("withDaemonFetchProxy attaches an undici proxy dispatcher from HTTPS_PROXY", () => {
  const init = withDaemonFetchProxy("https://api.slock.ai/internal/computer/runners/agent-1/credentials", {
    method: "POST",
  }, {
    HTTPS_PROXY: "http://proxy.internal:8080",
  });

  assert.equal(init.method, "POST");
  assert.ok(init.dispatcher instanceof ProxyAgent);
});

test("withDaemonFetchProxy honors NO_PROXY bypasses", () => {
  const init = withDaemonFetchProxy("https://api.corp.internal/internal/computer/runners/agent-1/credentials", {
    method: "POST",
  }, {
    HTTPS_PROXY: "http://proxy.internal:8080",
    NO_PROXY: ".internal",
  });

  assert.equal(init.method, "POST");
  assert.equal(init.dispatcher, undefined);
});
