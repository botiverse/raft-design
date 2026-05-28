import { readFile } from "node:fs/promises";

type RuntimeId = "claude" | "codex" | "kimi" | "copilot" | "cursor" | "gemini" | "antigravity";

interface SeedData {
  user: {
    email: string;
    password: string;
  };
  server: {
    id: string;
  };
  machine: {
    id: string;
    apiKey: string;
  };
}

interface LoginResponse {
  accessToken: string;
}

interface MachineSelfResponse {
  runtimes: string[];
}

interface AgentRow {
  id: string;
  name: string;
  status: string;
  activity?: string;
  activityDetail?: string;
}

interface ChannelRow {
  id: string;
  name: string;
  type: "channel" | "dm" | "thread";
  joined?: boolean;
  peerId?: string;
}

interface MachineListResponse {
  machines: Array<{
    id: string;
    status: "online" | "offline";
    runtimes: string[];
  }>;
}

interface MessageRow {
  id: string;
  seq: number;
  senderId: string;
  senderType: string;
  content: string;
}

interface ChannelMessagesResponse {
  messages: MessageRow[];
}

interface ThreadResponse {
  threadChannelId: string;
}

interface ScriptOptions {
  serverUrl: string;
  seedFile: string;
  runtimes: RuntimeId[];
  timeoutMs: number;
  keepOnFailure: boolean;
}

interface ScriptResult {
  runtime: RuntimeId;
  ok: boolean;
  agentIds?: string[];
  channelIds?: string[];
  threadChannelId?: string;
  completedSteps?: string[];
  error?: string;
}

interface RuntimeFixture {
  alpha: AgentRow;
  beta: AgentRow;
  alphaDm: ChannelRow;
  betaDm: ChannelRow;
  coordChannel: ChannelRow;
  sideChannel: ChannelRow;
}

function runtimeTimeoutMs(runtime: RuntimeId, baseTimeoutMs: number): number {
  return runtime === "copilot" ? baseTimeoutMs * 3 : baseTimeoutMs;
}

function runtimeNamePrefix(runtime: RuntimeId): string {
  return runtime === "antigravity" ? "agv" : runtime;
}

const KNOWN_RUNTIMES: readonly RuntimeId[] = [
  "claude",
  "codex",
  "kimi",
  "copilot",
  "cursor",
  "gemini",
  "antigravity",
];

function usage(): never {
  console.error(
    "Usage: ./slockdev script smoke-runtime --env <name> [--matrix runtime=claude,codex] [--timeout-ms 120000] [--keep-on-failure]",
  );
  process.exit(1);
}

function parseRuntimeList(value: string): RuntimeId[] {
  const [key, rawList] = value.split("=", 2);
  if (key !== "runtime" || !rawList) {
    throw new Error(`Unsupported matrix selector: ${value}`);
  }
  const runtimes = rawList
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (runtimes.length === 0) {
    throw new Error("Runtime matrix cannot be empty");
  }
  const invalid = runtimes.filter((runtime) => !KNOWN_RUNTIMES.includes(runtime as RuntimeId));
  if (invalid.length > 0) {
    throw new Error(`Unknown runtime(s): ${invalid.join(", ")}`);
  }
  return runtimes as RuntimeId[];
}

function parseArgs(argv: string[]): ScriptOptions {
  let serverUrl = "";
  let seedFile = "";
  let timeoutMs = 120_000;
  let runtimes: RuntimeId[] = [...KNOWN_RUNTIMES];
  let keepOnFailure = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--server-url":
        serverUrl = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--seed-file":
        seedFile = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--matrix":
        runtimes = parseRuntimeList(argv[index + 1] ?? "");
        index += 1;
        break;
      case "--timeout-ms":
        timeoutMs = Number(argv[index + 1] ?? "");
        index += 1;
        break;
      case "--keep-on-failure":
        keepOnFailure = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!serverUrl || !seedFile || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    usage();
  }

  return { serverUrl, seedFile, runtimes, timeoutMs, keepOnFailure };
}

async function readSeedFile(seedFile: string): Promise<SeedData> {
  const raw = await readFile(seedFile, "utf8");
  return JSON.parse(raw) as SeedData;
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function buildUserHeaders(token: string, serverId: string, includeJson = false): HeadersInit {
  return {
    authorization: `Bearer ${token}`,
    "x-server-id": serverId,
    ...(includeJson ? { "content-type": "application/json" } : {}),
  };
}

async function login(serverUrl: string, seed: SeedData): Promise<string> {
  const response = await fetch(`${serverUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: seed.user.email,
      password: seed.user.password,
    }),
  });
  if (!response.ok) {
    throw new Error(`Login failed with ${response.status}`);
  }
  const data = await parseJson<LoginResponse>(response);
  return data.accessToken;
}

async function getMachineRuntimes(serverUrl: string, machineApiKey: string): Promise<string[]> {
  const response = await fetch(`${serverUrl}/internal/machine/self`, {
    headers: {
      authorization: `Bearer ${machineApiKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to load machine runtimes (${response.status})`);
  }
  const data = await parseJson<MachineSelfResponse>(response);
  return data.runtimes;
}

async function waitForMachineOnline(
  options: ScriptOptions,
  token: string,
  serverId: string,
  machineId: string,
): Promise<void> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const response = await fetch(`${options.serverUrl}/api/servers/${serverId}/machines`, {
      headers: buildUserHeaders(token, serverId),
    });
    if (response.ok) {
      const data = await parseJson<MachineListResponse>(response);
      const machine = data.machines.find((entry) => entry.id === machineId);
      if (machine && machine.status === "online" && machine.runtimes.length > 0) {
        return;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Machine ${machineId} did not become online with detected runtimes`);
}

async function fetchJson<T>(
  url: string,
  init: RequestInit,
  errorPrefix: string,
): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${errorPrefix} (${response.status}): ${body}`);
  }
  return parseJson<T>(response);
}

async function createAgent(
  serverUrl: string,
  token: string,
  serverId: string,
  machineId: string,
  name: string,
  runtime: RuntimeId,
): Promise<AgentRow> {
  return fetchJson<AgentRow>(
    `${serverUrl}/api/agents`,
    {
      method: "POST",
      headers: buildUserHeaders(token, serverId, true),
      body: JSON.stringify({
        name,
        runtime,
        machineId,
      }),
    },
    "Agent create failed",
  );
}

async function createChannel(
  serverUrl: string,
  token: string,
  serverId: string,
  name: string,
): Promise<ChannelRow> {
  return fetchJson<ChannelRow>(
    `${serverUrl}/api/channels`,
    {
      method: "POST",
      headers: buildUserHeaders(token, serverId, true),
      body: JSON.stringify({ name }),
    },
    "Channel create failed",
  );
}

async function listChannels(
  serverUrl: string,
  token: string,
  serverId: string,
): Promise<ChannelRow[]> {
  return fetchJson<ChannelRow[]>(
    `${serverUrl}/api/channels`,
    {
      headers: buildUserHeaders(token, serverId),
    },
    "List channels failed",
  );
}

async function addAgentToChannel(
  serverUrl: string,
  token: string,
  serverId: string,
  channelId: string,
  agentId: string,
): Promise<void> {
  await fetchJson<{ ok: true }>(
    `${serverUrl}/api/channels/${channelId}/agents`,
    {
      method: "POST",
      headers: buildUserHeaders(token, serverId, true),
      body: JSON.stringify({ agentId }),
    },
    "Add agent to channel failed",
  );
}

async function openAgentDm(
  serverUrl: string,
  token: string,
  serverId: string,
  agentId: string,
): Promise<ChannelRow> {
  return fetchJson<ChannelRow>(
    `${serverUrl}/api/channels/dm`,
    {
      method: "POST",
      headers: buildUserHeaders(token, serverId, true),
      body: JSON.stringify({ agentId }),
    },
    "Open DM failed",
  );
}

async function listMessages(
  serverUrl: string,
  token: string,
  serverId: string,
  channelId: string,
  afterSeq?: number,
): Promise<MessageRow[]> {
  const query = afterSeq ? `?after=${afterSeq}` : "?limit=20";
  const response = await fetch(`${serverUrl}/api/messages/channel/${channelId}${query}`, {
    headers: buildUserHeaders(token, serverId),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`List messages failed (${response.status}): ${body}`);
  }
  const data = await parseJson<ChannelMessagesResponse>(response);
  return data.messages;
}

async function sendUserMessage(
  serverUrl: string,
  token: string,
  serverId: string,
  channelId: string,
  content: string,
): Promise<MessageRow> {
  return fetchJson<MessageRow>(
    `${serverUrl}/api/messages`,
    {
      method: "POST",
      headers: buildUserHeaders(token, serverId, true),
      body: JSON.stringify({
        channelId,
        content,
      }),
    },
    "Send prompt failed",
  );
}

async function createThread(
  serverUrl: string,
  token: string,
  serverId: string,
  parentChannelId: string,
  parentMessageId: string,
  content: string,
): Promise<ThreadResponse> {
  return fetchJson<ThreadResponse>(
    `${serverUrl}/api/channels/${parentChannelId}/threads`,
    {
      method: "POST",
      headers: buildUserHeaders(token, serverId, true),
      body: JSON.stringify({
        parentMessageId,
        content,
      }),
    },
    "Create thread failed",
  );
}

async function deleteAgent(
  serverUrl: string,
  token: string,
  serverId: string,
  agentId: string,
): Promise<void> {
  await fetchJson<{ ok: true }>(
    `${serverUrl}/api/agents/${agentId}`,
    {
      method: "DELETE",
      headers: buildUserHeaders(token, serverId),
    },
    "Delete agent failed",
  );
}

async function deleteChannel(
  serverUrl: string,
  token: string,
  serverId: string,
  channelId: string,
): Promise<void> {
  await fetchJson<{ ok: true }>(
    `${serverUrl}/api/channels/${channelId}`,
    {
      method: "DELETE",
      headers: buildUserHeaders(token, serverId),
    },
    "Delete channel failed",
  );
}

async function loadAgent(
  serverUrl: string,
  token: string,
  serverId: string,
  agentId: string,
): Promise<AgentRow | undefined> {
  const response = await fetch(`${serverUrl}/api/agents`, {
    headers: buildUserHeaders(token, serverId),
  });
  if (!response.ok) {
    return undefined;
  }
  const data = await parseJson<AgentRow[]>(response);
  return data.find((agent) => agent.id === agentId);
}

async function listAgents(
  serverUrl: string,
  token: string,
  serverId: string,
): Promise<AgentRow[]> {
  const response = await fetch(`${serverUrl}/api/agents`, {
    headers: buildUserHeaders(token, serverId),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`List agents failed (${response.status}): ${body}`);
  }
  return parseJson<AgentRow[]>(response);
}

async function cleanupLingeringE2eResources(
  options: ScriptOptions,
  token: string,
  serverId: string,
): Promise<void> {
  const [agents, channels] = await Promise.all([
    listAgents(options.serverUrl, token, serverId),
    listChannels(options.serverUrl, token, serverId),
  ]);

  for (const agent of agents.filter((entry) => entry.name.startsWith("e2e-"))) {
    try {
      await deleteAgent(options.serverUrl, token, serverId, agent.id);
    } catch {
      // Best-effort cleanup only. A stubborn stale agent should not block a new run.
    }
  }

  for (const channel of channels.filter((entry) => entry.name.startsWith("e2e-"))) {
    try {
      await deleteChannel(options.serverUrl, token, serverId, channel.id);
    } catch {
      // Best-effort cleanup only. Threads will be cleaned up with their parent channels.
    }
  }
}

function isIdleAgent(agent: AgentRow | undefined): boolean {
  if (!agent || agent.status !== "active") return false;
  const activity = agent.activity?.toLowerCase() ?? "";
  const detail = agent.activityDetail?.toLowerCase() ?? "";
  return (
    activity === "online" ||
    activity === "idle" ||
    detail === "idle" ||
    detail.includes("idle")
  );
}

async function waitForAgentsIdle(
  timeoutMs: number,
  options: ScriptOptions,
  token: string,
  serverId: string,
  agentIds: string[],
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let stablePasses = 0;
  while (Date.now() < deadline) {
    const agents = await Promise.all(
      agentIds.map((agentId) => loadAgent(options.serverUrl, token, serverId, agentId)),
    );
    if (agents.every(isIdleAgent)) {
      stablePasses += 1;
      if (stablePasses >= 2) {
        return;
      }
    } else {
      stablePasses = 0;
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
}

function latestSeq(messages: MessageRow[]): number {
  return Math.max(0, ...messages.map((message) => message.seq));
}

async function waitForExactReply(
  timeoutMs: number,
  options: ScriptOptions,
  token: string,
  serverId: string,
  channelId: string,
  agentId: string,
  exactToken: string,
  afterSeq: number,
): Promise<MessageRow> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    const messages = await listMessages(options.serverUrl, token, serverId, channelId, afterSeq);
    const reply = messages.find(
      (message) =>
        message.senderType === "agent" &&
        message.senderId === agentId &&
        message.content.includes(exactToken),
    );
    if (reply) {
      return reply;
    }
  }
  const latestAgentState = await loadAgent(options.serverUrl, token, serverId, agentId);
  throw new Error(
    `Timed out waiting for exact reply from agent ${agentId}. status=${latestAgentState?.status ?? "unknown"} activity=${latestAgentState?.activity ?? "unknown"} detail=${latestAgentState?.activityDetail ?? ""}`,
  );
}

async function sendAndExpectExactReply(
  timeoutMs: number,
  options: ScriptOptions,
  token: string,
  serverId: string,
  channelId: string,
  agentId: string,
  prompt: string,
  exactToken: string,
): Promise<MessageRow> {
  const baseline = latestSeq(await listMessages(options.serverUrl, token, serverId, channelId));
  await sendUserMessage(options.serverUrl, token, serverId, channelId, prompt);
  return waitForExactReply(timeoutMs, options, token, serverId, channelId, agentId, exactToken, baseline);
}

async function provisionRuntimeFixture(
  options: ScriptOptions,
  seed: SeedData,
  token: string,
  runtime: RuntimeId,
): Promise<RuntimeFixture> {
  const uniqueSuffix = `${runtimeNamePrefix(runtime)}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6)}`;
  const coordChannel = await createChannel(options.serverUrl, token, seed.server.id, `e2e-coord-${uniqueSuffix}`);
  const sideChannel = await createChannel(options.serverUrl, token, seed.server.id, `e2e-side-${uniqueSuffix}`);

  const alpha = await createAgent(
    options.serverUrl,
    token,
    seed.server.id,
    seed.machine.id,
    `e2e-${uniqueSuffix}-alpha`,
    runtime,
  );
  const beta = await createAgent(
    options.serverUrl,
    token,
    seed.server.id,
    seed.machine.id,
    `e2e-${uniqueSuffix}-beta`,
    runtime,
  );

  await addAgentToChannel(options.serverUrl, token, seed.server.id, coordChannel.id, alpha.id);
  await addAgentToChannel(options.serverUrl, token, seed.server.id, coordChannel.id, beta.id);
  await addAgentToChannel(options.serverUrl, token, seed.server.id, sideChannel.id, alpha.id);

  const alphaDm = await openAgentDm(options.serverUrl, token, seed.server.id, alpha.id);
  const betaDm = await openAgentDm(options.serverUrl, token, seed.server.id, beta.id);

  return { alpha, beta, alphaDm, betaDm, coordChannel, sideChannel };
}

async function cleanupRuntimeFixture(
  options: ScriptOptions,
  seed: SeedData,
  token: string,
  fixture: RuntimeFixture,
  threadChannelId?: string,
): Promise<void> {
  const cleanupSteps: Array<() => Promise<void>> = [];
  if (threadChannelId) {
    cleanupSteps.push(() => deleteChannel(options.serverUrl, token, seed.server.id, threadChannelId));
  }
  cleanupSteps.push(() => deleteChannel(options.serverUrl, token, seed.server.id, fixture.sideChannel.id));
  cleanupSteps.push(() => deleteChannel(options.serverUrl, token, seed.server.id, fixture.coordChannel.id));
  cleanupSteps.push(() => deleteAgent(options.serverUrl, token, seed.server.id, fixture.alpha.id));
  cleanupSteps.push(() => deleteAgent(options.serverUrl, token, seed.server.id, fixture.beta.id));

  for (const step of cleanupSteps) {
    try {
      await step();
    } catch {
      // Best-effort cleanup only. The scenario result should still surface the
      // runtime behavior even if teardown leaves residual objects behind.
    }
  }
}

async function runSingleRuntime(
  options: ScriptOptions,
  seed: SeedData,
  token: string,
  runtime: RuntimeId,
): Promise<ScriptResult> {
  let fixture: RuntimeFixture | null = null;
  let threadChannelId: string | undefined;
  let failed = true;
  try {
    const stepTimeoutMs = runtimeTimeoutMs(runtime, options.timeoutMs);
    fixture = await provisionRuntimeFixture(options, seed, token, runtime);
    await waitForAgentsIdle(stepTimeoutMs, options, token, seed.server.id, [
      fixture.alpha.id,
      fixture.beta.id,
    ]);
    const steps: string[] = [];
    const stamp = Date.now();

    const alphaDmToken1 = `E2E_${runtime.toUpperCase()}_ALPHA_DM1_${stamp}`;
    await sendAndExpectExactReply(
      stepTimeoutMs,
      options,
      token,
      seed.server.id,
      fixture.alphaDm.id,
      fixture.alpha.id,
      `Reply with exactly ${alphaDmToken1}`,
      alphaDmToken1,
    );
    steps.push("alpha-dm-round-1");

    const alphaDmToken2 = `E2E_${runtime.toUpperCase()}_ALPHA_DM2_${stamp}`;
    await sendAndExpectExactReply(
      stepTimeoutMs,
      options,
      token,
      seed.server.id,
      fixture.alphaDm.id,
      fixture.alpha.id,
      `Reply with exactly ${alphaDmToken2}`,
      alphaDmToken2,
    );
    steps.push("alpha-dm-round-2");

    const betaDmToken = `E2E_${runtime.toUpperCase()}_BETA_DM_${stamp}`;
    await sendAndExpectExactReply(
      stepTimeoutMs,
      options,
      token,
      seed.server.id,
      fixture.betaDm.id,
      fixture.beta.id,
      `Reply with exactly ${betaDmToken}`,
      betaDmToken,
    );
    steps.push("beta-dm-round-1");

    const coordBaseline = latestSeq(
      await listMessages(options.serverUrl, token, seed.server.id, fixture.coordChannel.id),
    );
    const alphaCoordToken = `E2E_${runtime.toUpperCase()}_ALPHA_COORD_${stamp}`;
    const betaCoordToken = `E2E_${runtime.toUpperCase()}_BETA_COORD_${stamp}`;
    const coordParent = await sendUserMessage(
      options.serverUrl,
      token,
      seed.server.id,
      fixture.coordChannel.id,
      `@${fixture.alpha.name} reply with exactly ${alphaCoordToken}. @${fixture.beta.name} reply with exactly ${betaCoordToken}.`,
    );
    await waitForExactReply(
      stepTimeoutMs,
      options,
      token,
      seed.server.id,
      fixture.coordChannel.id,
      fixture.alpha.id,
      alphaCoordToken,
      coordBaseline,
    );
    await waitForExactReply(
      stepTimeoutMs,
      options,
      token,
      seed.server.id,
      fixture.coordChannel.id,
      fixture.beta.id,
      betaCoordToken,
      coordBaseline,
    );
    steps.push("coord-channel-dual-reply");

    const sideToken = `E2E_${runtime.toUpperCase()}_SIDE_${stamp}`;
    await sendAndExpectExactReply(
      stepTimeoutMs,
      options,
      token,
      seed.server.id,
      fixture.sideChannel.id,
      fixture.alpha.id,
      `@${fixture.alpha.name} reply with exactly ${sideToken}`,
      sideToken,
    );
    steps.push("side-channel-reply");

    const betaThreadToken = `E2E_${runtime.toUpperCase()}_BETA_THREAD_${stamp}`;
    const thread = await createThread(
      options.serverUrl,
      token,
      seed.server.id,
      fixture.coordChannel.id,
      coordParent.id,
      `@${fixture.beta.name} reply with exactly ${betaThreadToken}`,
    );
    threadChannelId = thread.threadChannelId;
    await waitForExactReply(
      stepTimeoutMs,
      options,
      token,
      seed.server.id,
      thread.threadChannelId,
      fixture.beta.id,
      betaThreadToken,
      0,
    );
    steps.push("thread-beta-reply");

    const alphaThreadToken = `E2E_${runtime.toUpperCase()}_ALPHA_THREAD_${stamp}`;
    await sendAndExpectExactReply(
      stepTimeoutMs,
      options,
      token,
      seed.server.id,
      thread.threadChannelId,
      fixture.alpha.id,
      `@${fixture.alpha.name} reply with exactly ${alphaThreadToken}`,
      alphaThreadToken,
    );
    steps.push("thread-alpha-follow-up");

    failed = false;
    return {
      runtime,
      ok: true,
      agentIds: [fixture.alpha.id, fixture.beta.id],
      channelIds: [fixture.coordChannel.id, fixture.sideChannel.id, fixture.alphaDm.id, fixture.betaDm.id],
      threadChannelId: thread.threadChannelId,
      completedSteps: steps,
    };
  } finally {
    if (fixture) {
      if (failed && options.keepOnFailure) {
        console.log(
          JSON.stringify(
            {
              runtime,
              preservedFixture: {
                agentIds: [fixture.alpha.id, fixture.beta.id],
                channelIds: [
                  fixture.coordChannel.id,
                  fixture.sideChannel.id,
                  fixture.alphaDm.id,
                  fixture.betaDm.id,
                ],
                threadChannelId,
              },
            },
            null,
            2,
          ),
        );
      } else {
        await cleanupRuntimeFixture(options, seed, token, fixture, threadChannelId);
      }
    }
  }
}

async function main(): Promise<void> {
  try {
    const options = parseArgs(process.argv.slice(2));
    const seed = await readSeedFile(options.seedFile);
    const token = await login(options.serverUrl, seed);
    await waitForMachineOnline(options, token, seed.server.id, seed.machine.id);
    await cleanupLingeringE2eResources(options, token, seed.server.id);
    const availableRuntimes = new Set(await getMachineRuntimes(options.serverUrl, seed.machine.apiKey));
    const requestedRuntimes = options.runtimes.filter((runtime) => availableRuntimes.has(runtime));
    const skippedRuntimes = options.runtimes.filter((runtime) => !availableRuntimes.has(runtime));

    console.log(
      JSON.stringify(
        {
          serverUrl: options.serverUrl,
          seedFile: options.seedFile,
          availableRuntimes: [...availableRuntimes].sort(),
          requestedRuntimes,
          skippedRuntimes,
          timeoutMs: options.timeoutMs,
          keepOnFailure: options.keepOnFailure,
          scenario:
            "two agents, two channels, repeated DMs, shared channel fan-out, thread creation, and thread follow-up",
        },
        null,
        2,
      ),
    );

    const results: ScriptResult[] = [];
    for (const runtime of requestedRuntimes) {
      console.log(`\n=== smoke-runtime ${runtime} ===`);
      try {
        const result = await runSingleRuntime(options, seed, token, runtime);
        results.push(result);
        console.log(`PASS ${runtime} steps=${result.completedSteps?.join(",") ?? ""}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.push({ runtime, ok: false, error: message });
        console.log(`FAIL ${runtime} ${message}`);
      }
    }

    const summary = {
      ok: results.every((result) => result.ok),
      requestedRuntimes,
      skippedRuntimes,
      results,
    };
    console.log(`\nRESULTS\n${JSON.stringify(summary, null, 2)}`);

    if (!summary.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.stack || error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
}

void main();
