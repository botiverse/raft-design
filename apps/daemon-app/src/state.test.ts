import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { DaemonAppStateStore } from "./state";

function fixedNow() {
  return new Date("2026-04-09T12:34:00Z");
}

test("connectServer normalizes the URL and enters setup flow", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-state-"));
  const store = new DaemonAppStateStore(path.join(tempDir, "state.json"), fixedNow);

  try {
    const state = await store.connectServer("app.slock.ai");
    assert.equal(state.currentView, "setup");
    assert.equal(state.serverUrlDraft, "https://app.slock.ai");
    assert.equal(state.connectedServers.length, 1);
    assert.equal(state.connectedServers[0]?.url, "https://app.slock.ai");
    assert.equal(state.connectedServers[0]?.status, "needs_login");
    assert.equal(state.connectedServers[0]?.accountLabel, "Machine setup required");
    assert.equal(state.currentServerId, state.connectedServers[0]?.id);
    assert.match(state.activityLog[0]?.action ?? "", /Saved Slock Cloud/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("server connection labels can move between setup required and connected", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-state-"));
  const store = new DaemonAppStateStore(path.join(tempDir, "state.json"), fixedNow);

  try {
    const connected = await store.connectServer("https://app.slock.ai");
    const serverId = connected.connectedServers[0]!.id;

    const hydrated = await store.updateServerConnection(serverId, {
      status: "connected",
      accountLabel: "Machine Botiverse",
    });
    assert.equal(hydrated.connectedServers[0]?.status, "connected");
    assert.equal(hydrated.connectedServers[0]?.accountLabel, "Machine Botiverse");

    const cleared = await store.updateServerConnection(serverId, {
      status: "needs_login",
      accountLabel: "Machine setup required",
    });
    assert.equal(cleared.connectedServers[0]?.status, "needs_login");
    assert.equal(cleared.connectedServers[0]?.accountLabel, "Machine setup required");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("provider lifecycle moves between setup and dashboard", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-state-"));
  const store = new DaemonAppStateStore(path.join(tempDir, "state.json"), fixedNow);

  try {
    await store.connectServer("https://app.slock.ai");
    const withProvider = await store.addProvider("anthropic");
    assert.equal(withProvider.currentView, "providers");
    assert.equal(withProvider.providers.length, 1);
    assert.equal(withProvider.providers[0]?.kind, "anthropic");

    const withoutProvider = await store.removeProvider(withProvider.providers[0]!.id);
    assert.equal(withoutProvider.currentView, "setup");
    assert.equal(withoutProvider.providers.length, 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("saved pending providers do not skip setup until a local key exists", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-state-"));
  const statePath = path.join(tempDir, "state.json");
  const store = new DaemonAppStateStore(statePath, fixedNow);

  try {
    await writeFile(
      statePath,
      JSON.stringify({
        currentView: "providers",
        currentServerId: null,
        serverUrlDraft: "https://app.slock.ai",
        connectedServers: [],
        providers: [
          {
            id: "provider-1",
            kind: "openai",
            credentialSource: "app-managed",
            name: "OpenAI",
            model: "GPT-4o",
            status: "pending",
            hasLocalKey: false,
            keyHint: "not configured",
            usage: "Local credentials required",
            endpoint: null,
          },
        ],
        systemProviders: [],
        activityLog: [],
      }),
      "utf-8",
    );

    const state = await store.connectServer("https://app.slock.ai");
    assert.equal(state.currentView, "setup");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("ready system providers let connectServer skip directly to dashboard", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-state-"));
  const statePath = path.join(tempDir, "state.json");
  const store = new DaemonAppStateStore(statePath, fixedNow);

  try {
    await writeFile(
      statePath,
      JSON.stringify({
        currentView: "setup",
        currentServerId: null,
        serverUrlDraft: "https://app.slock.ai",
        connectedServers: [],
        providers: [],
        systemProviders: [
          {
            id: "system:claude",
            kind: "anthropic",
            credentialSource: "system",
            name: "Claude Code (system)",
            model: "Claude Sonnet 4",
            status: "connected",
            hasLocalKey: false,
            keyHint: "system login",
            usage: "Ready via existing Claude Code login on this machine.",
            endpoint: null,
          },
        ],
        activityLog: [],
      }),
      "utf-8",
    );

    const state = await store.connectServer("https://app.slock.ai");
    assert.equal(state.currentView, "dashboard");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("removing the last server returns the shell to login", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-state-"));
  const store = new DaemonAppStateStore(path.join(tempDir, "state.json"), fixedNow);

  try {
    const connected = await store.connectServer("https://app.slock.ai");
    const cleared = await store.removeServer(connected.connectedServers[0]!.id);
    assert.equal(cleared.currentView, "login");
    assert.equal(cleared.currentServerId, null);
    assert.equal(cleared.connectedServers.length, 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("concurrent updates are serialized instead of dropping each other", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-state-"));
  const store = new DaemonAppStateStore(path.join(tempDir, "state.json"), fixedNow);

  try {
    await Promise.all([
      store.connectServer("https://app.slock.ai"),
      store.addProvider("anthropic"),
    ]);

    const state = await store.getState();
    assert.equal(state.connectedServers.length, 1);
    assert.equal(state.providers.length, 1);
    assert.equal(state.currentServerId, state.connectedServers[0]?.id);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("appendActivity supports non-shell sources for runtime timeline updates", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-state-"));
  const store = new DaemonAppStateStore(path.join(tempDir, "state.json"), fixedNow);

  try {
    const state = await store.appendActivity("Daemon", "Slock Cloud: Embedded daemon connected.");
    assert.equal(state.activityLog[0]?.source, "Daemon");
    assert.match(state.activityLog[0]?.action ?? "", /Embedded daemon connected/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("legacy provider state backfills hasLocalKey from the saved key hint", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-state-"));
  const statePath = path.join(tempDir, "state.json");
  const store = new DaemonAppStateStore(statePath, fixedNow);

  try {
    await writeFile(
      statePath,
      JSON.stringify({
        currentView: "providers",
        currentServerId: null,
        serverUrlDraft: "https://app.slock.ai",
        connectedServers: [],
        providers: [
          {
            id: "provider-1",
            kind: "openai",
            credentialSource: "app-managed",
            name: "OpenAI",
            model: "GPT-4o",
            status: "connected",
            keyHint: "saved locally · ••••1234",
            usage: "Connectivity verified",
            endpoint: "https://api.openai.com/v1",
          },
        ],
        systemProviders: [],
        activityLog: [],
      }),
      "utf-8",
    );

    const state = await store.getState();
    assert.equal(state.providers[0]?.hasLocalKey, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
