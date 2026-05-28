import assert from "node:assert/strict";
import test from "node:test";
import { DaemonRuntimeSupervisor } from "./runtimeSupervisor";
import type { ConnectedServer } from "./model";
import type { DaemonCoreOptions } from "@slock-ai/daemon/core";

const server: ConnectedServer = {
  id: "server-1",
  name: "Slock Cloud",
  url: "https://app.slock.ai",
  status: "needs_login",
  accountLabel: "Browser auth pending",
  userLabel: null,
  remoteServerId: null,
  remoteServerSlug: null,
  remoteServerName: null,
  remoteServers: [],
};

const secondServer: ConnectedServer = {
  id: "server-2",
  name: "Second Workspace",
  url: "https://second.slock.ai",
  status: "needs_login",
  accountLabel: "Browser auth pending",
  userLabel: null,
  remoteServerId: null,
  remoteServerSlug: null,
  remoteServerName: null,
  remoteServers: [],
};

test("start without a saved machine key stays stopped with a helpful message", async () => {
  const supervisor = new DaemonRuntimeSupervisor({
    dataDirRoot: "/tmp/daemon-app-runtime",
    getMachineApiKey: async () => null,
  });

  await supervisor.start(server);
  const states = await supervisor.getRuntimeStates([server], async () => false);
  assert.equal(states[0]?.phase, "stopped");
  assert.match(states[0]?.message ?? "", /machine API key/i);
});

test("start and stop transitions follow lifecycle hooks", async () => {
  let capturedOptions: DaemonCoreOptions | null = null;
  let stopCalls = 0;

  const supervisor = new DaemonRuntimeSupervisor({
    dataDirRoot: "/tmp/daemon-app-runtime",
    getMachineApiKey: async () => "sk_machine_test",
    createCore: (options) => {
      capturedOptions = options;
      return {
        start() {},
        async stop() {
          stopCalls += 1;
        },
      };
    },
  });

  await supervisor.start(server);
  assert.equal(supervisor.getActiveServerId(), server.id);

  let states = await supervisor.getRuntimeStates([server], async () => true);
  assert.equal(states[0]?.phase, "starting");

  assert.ok(capturedOptions);
  const options = capturedOptions as DaemonCoreOptions;
  assert.equal(options.serverUrl, "https://api.slock.ai");
  const defaultEnvVars = await options.defaultAgentEnvVarsProvider?.({
    runtime: "claude",
    model: "sonnet",
    envVars: null,
  });
  assert.equal(defaultEnvVars, undefined);
  options.lifecycleHooks?.onConnect?.();
  states = await supervisor.getRuntimeStates([server], async () => true);
  assert.equal(states[0]?.phase, "running");

  options.lifecycleHooks?.onDisconnect?.();
  states = await supervisor.getRuntimeStates([server], async () => true);
  assert.equal(states[0]?.phase, "reconnecting");

  await supervisor.stop(server.id);
  states = await supervisor.getRuntimeStates([server], async () => true);
  assert.equal(states[0]?.phase, "stopped");
  assert.equal(stopCalls, 1);
  assert.equal(supervisor.getActiveServerId(), null);
});

test("forwards machine-level default agent env providers into DaemonCore options", async () => {
  const capturedOptions: DaemonCoreOptions[] = [];

  const supervisor = new DaemonRuntimeSupervisor({
    dataDirRoot: "/tmp/daemon-app-runtime",
    getMachineApiKey: async () => "sk_machine_test",
    getDefaultAgentEnvVars: async (config) => {
      if (config.runtime === "codex") {
        return { OPENAI_API_KEY: "sk-machine-openai" };
      }
      return null;
    },
    createCore: (options) => {
      capturedOptions.push(options);
      return {
        start() {},
        async stop() {},
      };
    },
  });

  await supervisor.start(server);
  const options = capturedOptions[0];
  if (!options) {
    throw new Error("expected DaemonCore options to be captured");
  }
  assert.ok(options.defaultAgentEnvVarsProvider);
  const envVars = await options.defaultAgentEnvVarsProvider!({
    runtime: "codex",
    model: "gpt-5.4",
    envVars: null,
  });
  assert.deepEqual(envVars, { OPENAI_API_KEY: "sk-machine-openai" });
});

test("starting a different server stops the previous embedded runtime first", async () => {
  const stopCalls: string[] = [];
  const supervisor = new DaemonRuntimeSupervisor({
    dataDirRoot: "/tmp/daemon-app-runtime",
    getMachineApiKey: async () => "sk_machine_test",
    createCore: (options) => ({
      start() {
        options.lifecycleHooks?.onConnect?.();
      },
      async stop() {
        stopCalls.push(options.serverUrl);
      },
    }),
  });

  await supervisor.start(server);
  await supervisor.start(secondServer);

  const states = await supervisor.getRuntimeStates([server, secondServer], async () => true);
  assert.equal(stopCalls.length, 1);
  assert.equal(stopCalls[0], "https://api.slock.ai");
  assert.equal(states.find((state) => state.serverId === server.id)?.phase, "stopped");
  assert.equal(states.find((state) => state.serverId === secondServer.id)?.phase, "running");
  assert.equal(supervisor.getActiveServerId(), secondServer.id);
});

test("forwards daemon log lines for the active runtime and unsubscribes on stop", async () => {
  const logEvents: Array<{ serverId: string; level: string; line: string }> = [];
  const listeners = new Set<(event: { level: "INFO" | "WARN" | "ERROR"; line: string; message: string }) => void>();

  const supervisor = new DaemonRuntimeSupervisor({
    dataDirRoot: "/tmp/daemon-app-runtime",
    getMachineApiKey: async () => "sk_machine_test",
    onLog: (event) => {
      logEvents.push(event);
    },
    subscribeToLogs: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    createCore: () => ({
      start() {
        for (const listener of listeners) {
          listener({
            level: "INFO",
            line: "2026-04-09 23:50:43 [INFO] embedded daemon hello",
            message: "embedded daemon hello",
          });
        }
      },
      async stop() {},
    }),
  });

  await supervisor.start(server);
  assert.equal(logEvents.length, 1);
  assert.equal(logEvents[0]?.serverId, server.id);
  assert.equal(logEvents[0]?.level, "INFO");
  assert.match(logEvents[0]?.line ?? "", /embedded daemon hello/);

  await supervisor.stop(server.id);
  for (const listener of listeners) {
    listener({
      level: "INFO",
      line: "2026-04-09 23:50:44 [INFO] should not be forwarded after stop",
      message: "should not be forwarded after stop",
    });
  }
  assert.equal(logEvents.length, 1);
});
