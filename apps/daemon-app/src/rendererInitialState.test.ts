import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_DAEMON_APP_STATE } from "./model";
import { parseRequestedViewState, resolveInitialRendererState } from "./rendererInitialState";

test("parseRequestedViewState returns null when no explicit state query is present", () => {
  assert.equal(parseRequestedViewState(""), null);
  assert.equal(parseRequestedViewState("?capture=123"), null);
});

test("parseRequestedViewState returns supported view query overrides", () => {
  assert.equal(parseRequestedViewState("?state=login"), "login");
  assert.equal(parseRequestedViewState("?state=setup"), "setup");
  assert.equal(parseRequestedViewState("?state=dashboard"), "dashboard");
  assert.equal(parseRequestedViewState("?state=providers"), "providers");
  assert.equal(parseRequestedViewState("?state=unknown"), null);
});

test("resolveInitialRendererState preserves the persisted view when no override is requested", () => {
  const persistedState = {
    ...DEFAULT_DAEMON_APP_STATE,
    currentView: "dashboard" as const,
    currentServerId: "server-1",
    connectedServers: [
      {
        id: "server-1",
        name: "Slock Cloud",
        url: "https://app.slock.ai",
        status: "connected" as const,
        accountLabel: "Signed in",
        userLabel: "dayu@slock.ai",
        remoteServerId: null,
        remoteServerSlug: null,
        remoteServerName: null,
        remoteServers: [],
      },
    ],
  };

  assert.equal(resolveInitialRendererState(persistedState, null), persistedState);
});

test("resolveInitialRendererState applies an explicit view override without mutating persisted state", () => {
  const persistedState = {
    ...DEFAULT_DAEMON_APP_STATE,
    currentView: "dashboard" as const,
    currentServerId: "server-1",
    connectedServers: [
      {
        id: "server-1",
        name: "Slock Cloud",
        url: "https://app.slock.ai",
        status: "connected" as const,
        accountLabel: "Signed in",
        userLabel: "dayu@slock.ai",
        remoteServerId: null,
        remoteServerSlug: null,
        remoteServerName: null,
        remoteServers: [],
      },
    ],
  };

  const resolved = resolveInitialRendererState(persistedState, "setup");
  assert.notEqual(resolved, persistedState);
  assert.equal(resolved.currentView, "setup");
  assert.equal(persistedState.currentView, "dashboard");
  assert.equal(resolved.currentServerId, persistedState.currentServerId);
});

test("resolveInitialRendererState is a no-op when the requested view already matches persisted state", () => {
  const persistedState = {
    ...DEFAULT_DAEMON_APP_STATE,
    currentView: "providers" as const,
  };

  assert.equal(resolveInitialRendererState(persistedState, "providers"), persistedState);
});
