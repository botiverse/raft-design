import assert from "node:assert/strict";
import test from "node:test";
import { daemonApiBasesMatch, normalizeServerOrigin, resolveDaemonApiBaseUrl } from "./serverBaseUrl";

test("normalizeServerOrigin keeps only the origin", () => {
  assert.equal(normalizeServerOrigin("https://app.slock.ai/settings/server"), "https://app.slock.ai");
});

test("resolveDaemonApiBaseUrl maps production web URLs to the backend api domain", () => {
  assert.equal(resolveDaemonApiBaseUrl("https://app.slock.ai"), "https://api.slock.ai");
});

test("resolveDaemonApiBaseUrl maps staging web URLs to the backend fly domain", () => {
  assert.equal(
    resolveDaemonApiBaseUrl("https://slock-app-staging.botiverse.dev"),
    "https://slock-server-staging.fly.dev",
  );
});

test("resolveDaemonApiBaseUrl maps local vite dev URLs to the local backend port", () => {
  assert.equal(resolveDaemonApiBaseUrl("http://localhost:5173"), "http://localhost:3001");
  assert.equal(resolveDaemonApiBaseUrl("http://127.0.0.1:5173"), "http://127.0.0.1:3001");
});

test("daemonApiBasesMatch treats equivalent web and backend URLs as the same environment", () => {
  assert.equal(daemonApiBasesMatch("https://app.slock.ai", "https://api.slock.ai"), true);
  assert.equal(
    daemonApiBasesMatch("https://slock-app-staging.botiverse.dev", "https://slock-server-staging.fly.dev"),
    true,
  );
  assert.equal(daemonApiBasesMatch("https://app.slock.ai", "https://example.com"), false);
});
