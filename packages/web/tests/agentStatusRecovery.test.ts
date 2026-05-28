import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import api from "../src/api/client.js";
import { selectAgentDisplayState, useAgentStore, type Agent } from "../src/store/agentStore.js";
import { useServerStore, type Server } from "../src/store/serverStore.js";

const originalGet = api.get.bind(api);

function makeServer(): Server {
  return {
    id: "server-1",
    name: "Server 1",
    slug: "server-1",
    ownerId: "human-1",
    onboardingAgentId: null,
    plan: "free",
    planDowngradedAt: null,
    role: "owner",
    createdAt: new Date(0).toISOString(),
  };
}

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent-1",
    name: "agent-one",
    displayName: "Agent One",
    avatarUrl: null,
    description: null,
    status: "active",
    model: "sonnet",
    runtime: "claude",
    reasoningEffort: null,
    executionMode: "byoc",
    envVars: null,
    machineId: "machine-1",
    runtimeProfile: null,
    creatorType: "user",
    creatorId: "human-1",
    creator: null,
    createdAgents: [],
    deletedAt: null,
    createdAt: new Date(0).toISOString(),
    ...overrides,
  };
}

function resetStores() {
  useServerStore.setState({
    current: makeServer(),
    serverEpoch: 1,
  });
  useAgentStore.setState({
    agents: [],
    agentActivities: {},
    agentActivityObservedAt: {},
    agentActivityVersions: {},
    agentActivitySeq: {},
    loading: false,
    activityLogs: {},
    trajectoryLogs: {},
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

afterEach(() => {
  api.get = originalGet;
  resetStores();
});

test("in-flight REST agent snapshot does not clobber newer socket activity", async () => {
  resetStores();
  const response = deferred<{ data: Array<Agent & { activity?: string; activityDetail?: string }> }>();
  api.get = (async (url: string) => {
    assert.equal(url, "/agents");
    return response.promise;
  }) as typeof api.get;

  const loadPromise = useAgentStore.getState().loadAgents();

  // This push represents the daemon moving from idle online to real work
  // while the reconnect snapshot is still in flight.
  useAgentStore.getState().updateActivity("agent-1", "working", "Compiling prompt", 1);

  response.resolve({
    data: [
      {
        ...makeAgent(),
        activity: "online",
        activityDetail: "",
      },
    ],
  });
  await loadPromise;

  assert.deepEqual(useAgentStore.getState().agentActivities["agent-1"], {
    activity: "working",
    activityDetail: "Compiling prompt",
  });
});

test("REST agent snapshot seeds activity when no newer local push arrived", async () => {
  resetStores();
  api.get = (async (url: string) => {
    assert.equal(url, "/agents");
    return {
      data: [
        {
          ...makeAgent(),
          activity: "thinking",
          activityDetail: "Reading context",
        },
      ],
    };
  }) as typeof api.get;

  await useAgentStore.getState().loadAgents();

  assert.deepEqual(useAgentStore.getState().agentActivities["agent-1"], {
    activity: "thinking",
    activityDetail: "Reading context",
  });
});

test("invalid partial agent activity push is ignored instead of mapped to offline", () => {
  resetStores();
  useAgentStore.setState({
    agents: [makeAgent()],
    agentActivities: {
      "agent-1": { activity: "working", activityDetail: "Running tests" },
    },
    agentActivityVersions: { "agent-1": 1 },
  });

  useAgentStore.getState().updateActivity("agent-1", undefined as unknown as string, "", 2);

  assert.deepEqual(useAgentStore.getState().agentActivities["agent-1"], {
    activity: "working",
    activityDetail: "Running tests",
  });
  assert.equal(useAgentStore.getState().agentActivitySeq["agent-1"], undefined);
});

test("deterministic reconnect order fuzz keeps final activity at latest valid push", async () => {
  resetStores();

  const cases: Array<{
    name: string;
    run: () => Promise<void>;
  }> = [
    {
      name: "snapshot then push",
      run: async () => {
        api.get = (async () => ({
          data: [{ ...makeAgent(), activity: "online", activityDetail: "" }],
        })) as typeof api.get;
        await useAgentStore.getState().loadAgents();
        useAgentStore.getState().updateActivity("agent-1", "working", "After snapshot", 1);
      },
    },
    {
      name: "push while snapshot in flight",
      run: async () => {
        const response = deferred<{ data: Array<Agent & { activity?: string; activityDetail?: string }> }>();
        api.get = (async () => response.promise) as typeof api.get;
        const loadPromise = useAgentStore.getState().loadAgents();
        useAgentStore.getState().updateActivity("agent-1", "working", "During snapshot", 1);
        response.resolve({ data: [{ ...makeAgent(), activity: "online", activityDetail: "" }] });
        await loadPromise;
      },
    },
  ];

  for (const scenario of cases) {
    resetStores();
    await scenario.run();
    assert.equal(
      useAgentStore.getState().agentActivities["agent-1"]?.activity,
      "working",
      scenario.name,
    );
  }
});

test("trajectory tool_start updates the live status badge state", () => {
  resetStores();
  useAgentStore.setState({
    agents: [makeAgent()],
    agentActivities: {
      "agent-1": { activity: "online", activityDetail: "" },
    },
    agentActivityObservedAt: { "agent-1": 100 },
    agentActivityVersions: { "agent-1": 1 },
  });

  useAgentStore.getState().appendTrajectory(
    "agent-1",
    [{ kind: "tool_start", toolName: "shell", toolInput: "pnpm test" }],
    200,
  );

  assert.deepEqual(useAgentStore.getState().agentActivities["agent-1"], {
    activity: "working",
    activityDetail: "Running command…",
  });
  assert.deepEqual(selectAgentDisplayState(useAgentStore.getState(), "agent-1"), {
    activity: "working",
    activityDetail: "Running command…",
    activityText: "Running command…",
    isOnline: true,
  });
});

test("older trajectory replay does not clobber a newer non-idle activity", () => {
  resetStores();
  useAgentStore.setState({
    agents: [makeAgent()],
    agentActivities: {
      "agent-1": { activity: "thinking", activityDetail: "Planning fix" },
    },
    agentActivityObservedAt: { "agent-1": 300 },
    agentActivityVersions: { "agent-1": 1 },
  });

  useAgentStore.getState().appendTrajectory(
    "agent-1",
    [{ kind: "status", activity: "online", detail: "" }],
    200,
  );

  assert.deepEqual(useAgentStore.getState().agentActivities["agent-1"], {
    activity: "thinking",
    activityDetail: "Planning fix",
  });
});

test("durable trajectory reload repairs stale idle badge state", async () => {
  resetStores();
  useAgentStore.setState({
    agents: [makeAgent()],
    agentActivities: {
      "agent-1": { activity: "online", activityDetail: "" },
    },
    agentActivityObservedAt: { "agent-1": 300 },
    agentActivityVersions: { "agent-1": 1 },
  });
  api.get = (async (url: string) => {
    assert.equal(url, "/agents/agent-1/activity-log");
    return {
      data: [
        {
          timestamp: 200,
          entry: { kind: "tool_start", toolName: "Bash", toolInput: "pnpm test" },
        },
      ],
    };
  }) as typeof api.get;

  await useAgentStore.getState().loadTrajectoryLog("agent-1");

  assert.deepEqual(useAgentStore.getState().agentActivities["agent-1"], {
    activity: "working",
    activityDetail: "Running command…",
  });
  assert.deepEqual(selectAgentDisplayState(useAgentStore.getState(), "agent-1"), {
    activity: "working",
    activityDetail: "Running command…",
    activityText: "Running command…",
    isOnline: true,
  });
});

test("agent display state falls back to database status when activity is not seeded", () => {
  resetStores();
  useAgentStore.setState({
    agents: [
      makeAgent({ id: "active-agent", status: "active" }),
      makeAgent({ id: "stopped-agent", status: "stopped" }),
    ],
  });

  assert.deepEqual(selectAgentDisplayState(useAgentStore.getState(), "active-agent"), {
    activity: "online",
    activityDetail: "",
    activityText: "Online",
    isOnline: true,
  });
  assert.deepEqual(selectAgentDisplayState(useAgentStore.getState(), "stopped-agent"), {
    activity: "offline",
    activityDetail: "Stopped",
    activityText: "Stopped — won't receive messages until restarted",
    isOnline: false,
  });
});
