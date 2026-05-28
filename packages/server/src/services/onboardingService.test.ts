import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  __resetOnboardingServiceDepsForTests,
  __setOnboardingServiceDepsForTests,
  triggerAgentIntroInAllChannel,
  triggerNewMemberOnboarding,
  triggerOwnerOnboardingOnAgentActivation,
} from "./onboardingService.js";

afterEach(() => {
  __resetOnboardingServiceDepsForTests();
});

function makeAgent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "agent-1",
    serverId: "server-1",
    name: "peng",
    displayName: "Peng",
    avatarUrl: null,
    description: "Runtime engineer",
    allChannelIntroSentAt: null,
    status: "inactive",
    sessionId: null,
    model: "sonnet",
    runtime: "claude",
    reasoningEffort: null,
    executionMode: "byoc",
    envVars: null,
    machineId: null,
    deletedAt: null,
    createdAt: new Date("2026-04-21T09:00:00.000Z"),
    updatedAt: new Date("2026-04-21T09:00:00.000Z"),
    ...overrides,
  };
}

function makeDeps(overrides: Record<string, unknown> = {}): any {
  return {
    getAgent: async () => makeAgent(),
    listAgents: async () => [],
    tryMarkAllChannelIntroSent: async () => true,
    clearAllChannelIntroSentClaim: async () => {},
    listChannels: async () => [{ id: "channel-all", name: "all", type: "channel" }],
    createChannel: async () => ({ id: "channel-1", name: "onboarding-owner", type: "channel" }),
    addHuman: async () => {},
    addAgent: async () => {},
    findOrCreateDM: async () => null,
    broadcastSystemMessage: async () => {},
    getServer: async () => null,
    getServerOnboardingSettings: async () => ({
      onboardingAgentId: null,
      agentAllChannelGreetingEnabled: true,
    }),
    updateServerOnboardingAgent: async () => null,
    getMemberOnboardingPreferences: async () => null,
    updateMemberOnboardingPreferences: async () => null,
    getUser: async () => null,
    ...overrides,
  };
}

function makeIo(events: Array<{ room: string; event: string; payload: any }> = [], joins: Array<{ rooms: string[]; channelRoom: string }> = []) {
  return {
    to(room: string) {
      return {
        emit(event: string, payload: any) {
          events.push({ room, event, payload });
        },
      };
    },
    in(room: string) {
      const rooms = [room];
      const chain = {
        in(nextRoom: string) {
          rooms.push(nextRoom);
          return chain;
        },
        socketsJoin(channelRoom: string) {
          joins.push({ rooms: [...rooms], channelRoom });
        },
      };
      return chain;
    },
  } as any;
}

function makeServer(overrides: Record<string, unknown> = {}) {
  return {
    id: "server-1",
    ownerId: "owner-1",
    onboardingAgentId: "agent-1",
    ...overrides,
  };
}

test("triggerAgentIntroInAllChannel skips agents that already sent their #all intro", async () => {
  let markAttempts = 0;
  let delivered = false;

  __setOnboardingServiceDepsForTests(makeDeps({
    getAgent: async () => makeAgent({ allChannelIntroSentAt: new Date("2026-04-21T09:00:00.000Z") }),
    tryMarkAllChannelIntroSent: async () => {
      markAttempts += 1;
      return true;
    },
  }) as any);

  const agentOrchestrator = {
    async deliverMessage() {
      delivered = true;
    },
  } as any;

  const sent = await triggerAgentIntroInAllChannel(agentOrchestrator, "server-1", "agent-1");

  assert.equal(sent, false);
  assert.equal(markAttempts, 0);
  assert.equal(delivered, false);
});

test("triggerAgentIntroInAllChannel skips when server disables #all greetings", async () => {
  let markAttempts = 0;
  let delivered = false;

  __setOnboardingServiceDepsForTests(makeDeps({
    getServerOnboardingSettings: async () => ({
      onboardingAgentId: null,
      agentAllChannelGreetingEnabled: false,
    }),
    tryMarkAllChannelIntroSent: async () => {
      markAttempts += 1;
      return true;
    },
  }) as any);

  const agentOrchestrator = {
    async deliverMessage() {
      delivered = true;
    },
  } as any;

  const sent = await triggerAgentIntroInAllChannel(agentOrchestrator, "server-1", "agent-1");

  assert.equal(sent, false);
  assert.equal(markAttempts, 0);
  assert.equal(delivered, false);
});

test("triggerAgentIntroInAllChannel persists a claim before delivering the intro", async () => {
  let addedToAll = 0;
  let markAttempts = 0;
  let deliveredMessage: any = null;

  __setOnboardingServiceDepsForTests(makeDeps({
    tryMarkAllChannelIntroSent: async () => {
      markAttempts += 1;
      return true;
    },
    addAgent: async () => {
      addedToAll += 1;
    },
  }) as any);

  const agentOrchestrator = {
    async deliverMessage(_agentId: string, message: Record<string, unknown>) {
      deliveredMessage = message;
    },
  } as any;

  const sent = await triggerAgentIntroInAllChannel(agentOrchestrator, "server-1", "agent-1");

  assert.equal(sent, true);
  assert.equal(markAttempts, 1);
  assert.equal(addedToAll, 1);
  assert.equal(deliveredMessage?.channel_name, "all");
  assert.match(String(deliveredMessage?.content), /First message task \(system-triggered\):/);
  assert.match(String(deliveredMessage?.content), /Use your Slock identity name: @Peng\./);
  assert.match(String(deliveredMessage?.content), /Do not use local OS usernames/);
});

test("triggerAgentIntroInAllChannel rolls back the claim when delivery fails", async () => {
  let rollbackCalledWith: any = null;

  __setOnboardingServiceDepsForTests(makeDeps({
    clearAllChannelIntroSentClaim: async (agentId: string, claimedAt: Date) => {
      rollbackCalledWith = { agentId, claimedAt };
    },
  }) as any);

  const agentOrchestrator = {
    async deliverMessage() {
      throw new Error("daemon offline");
    },
  } as any;

  await assert.rejects(
    triggerAgentIntroInAllChannel(agentOrchestrator, "server-1", "agent-1"),
    /daemon offline/,
  );

  assert.equal(rollbackCalledWith?.agentId, "agent-1");
  assert.ok(rollbackCalledWith?.claimedAt instanceof Date);
});

test("triggerOwnerOnboardingOnAgentActivation routes the owner onboarding instruction into #all", async () => {
  // Per cindyz directive 2026-05-27 (#proj-onboarding:3e24c78f, task #42):
  // owner onboarding must happen in the main #all channel — no extra private
  // `onboarding-<owner>` channel is created. Owner is already in #all and the
  // onboarding agent is added to #all by `triggerAgentIntroInAllChannel`
  // (fired right above), so the instruction broadcast can target #all directly.
  const broadcasts: Array<{ channelId: string; content: string; targetAgentIds?: string[] }> = [];
  const createCalls: any[] = [];
  const addedAgentChannels: string[] = [];

  __setOnboardingServiceDepsForTests(makeDeps({
    getServer: async () => makeServer(),
    getMemberOnboardingPreferences: async () => ({ onboardingDmSentAt: null }),
    getAgent: async () => makeAgent({
      id: "agent-1",
      serverId: "server-1",
      name: "Cindy",
      description: "Onboarding Assistant",
    }),
    tryMarkAllChannelIntroSent: async () => true,
    getUser: async () => ({ id: "owner-1", name: "Cindy Zhao" }),
    listChannels: async () => [{ id: "channel-all", name: "all", type: "channel" }],
    createChannel: async (...args: any[]) => {
      createCalls.push(args);
      return { id: "should-not-be-created", name: args[1], type: args[3] };
    },
    addAgent: async (channelId: string) => {
      addedAgentChannels.push(channelId);
    },
    broadcastSystemMessage: async (
      _io: any,
      _agentOrchestrator: any,
      channelId: string,
      content: string,
      opts?: { targetAgentIds?: string[] },
    ) => {
      broadcasts.push({ channelId, content, targetAgentIds: opts?.targetAgentIds });
    },
    updateMemberOnboardingPreferences: async () => {},
  }) as any);

  const fired = await triggerOwnerOnboardingOnAgentActivation(makeIo(), {} as any, "server-1", "agent-1");
  assert.equal(fired, true);

  // No private `onboarding-<owner>` channel should have been created.
  assert.equal(
    createCalls.some((args) => typeof args[1] === "string" && args[1].startsWith("onboarding-")),
    false,
    "owner onboarding must not create an extra onboarding-<owner> channel",
  );

  // The owner onboarding instruction must broadcast into #all.
  const ownerBroadcast = broadcasts.find((b) => b.channelId === "channel-all");
  assert.ok(ownerBroadcast, "owner onboarding broadcast must target #all");
  assert.match(ownerBroadcast.content, /in #all channel/);
  assert.deepEqual(ownerBroadcast.targetAgentIds, ["agent-1"]);

  // Cindy is added to #all so she can act on the instruction. (Note:
  // `triggerAgentIntroInAllChannel` already adds her; the owner path calls
  // `addAgent(allChannel.id, agentId)` again as an idempotent guard.)
  assert.ok(addedAgentChannels.includes("channel-all"), "onboarding agent must be in #all");

  // Action-card regression guard (#proj-permission msg=f398b0d8, xxchan
  // 2026-05-10): instruction must point Cindy at the action-card playbook.
  assert.match(ownerBroadcast.content, /slock action prepare/);
  assert.match(ownerBroadcast.content, /onboarding_playbook\.md/);
  assert.match(ownerBroadcast.content, /onboarding_knowledge_faq\.md/);
});

test("triggerNewMemberOnboarding does not instruct the agent to use action cards", async () => {
  // Member onboarding explicitly tells Cindy NOT to set up server / create
  // agents/channels for the new member. The action-card guidance must stay
  // owner-only so we do not accidentally encourage Cindy to prepare cards
  // for non-owner users (who likely lack permission anyway).
  const broadcasts: Array<{ channelId: string; content: string }> = [];

  __setOnboardingServiceDepsForTests(makeDeps({
    getServer: async () => makeServer(),
    getMemberOnboardingPreferences: async () => ({ onboardingDmSentAt: null }),
    getAgent: async () => makeAgent({
      id: "agent-1",
      serverId: "server-1",
      name: "Cindy",
      description: "Onboarding Assistant",
    }),
    getUser: async () => ({ id: "member-1", name: "New Member" }),
    listChannels: async () => [{ id: "channel-all", name: "all", type: "channel" }],
    createChannel: async (...args: any[]) => ({
      id: "member-onboarding",
      name: args[1],
      type: args[3],
    }),
    addHuman: async () => {},
    addAgent: async () => {},
    broadcastSystemMessage: async (
      _io: any,
      _agentOrchestrator: any,
      channelId: string,
      content: string,
    ) => {
      broadcasts.push({ channelId, content });
    },
    updateMemberOnboardingPreferences: async () => {},
  }) as any);

  await triggerNewMemberOnboarding(makeIo(), {} as any, "server-1", "member-1");

  const memberBroadcast = broadcasts.find((b) => b.channelId === "member-onboarding");
  assert.ok(memberBroadcast, "member onboarding broadcast must be sent");
  assert.doesNotMatch(memberBroadcast.content, /slock action prepare/);
  assert.match(memberBroadcast.content, /Do NOT ask them to set up the server/);
});

test("triggerNewMemberOnboarding creates a private member onboarding channel that includes the server owner", async () => {
  const events: Array<{ room: string; event: string; payload: any }> = [];
  const joins: Array<{ rooms: string[]; channelRoom: string }> = [];
  const io = makeIo(events, joins);
  const createCalls: any[] = [];
  const listCalls: any[] = [];
  const addedHumans: string[] = [];
  const deliveredChannels: string[] = [];
  let prefsUpdated = false;

  __setOnboardingServiceDepsForTests(makeDeps({
    getServer: async () => makeServer(),
    getMemberOnboardingPreferences: async () => ({ onboardingDmSentAt: null }),
    getAgent: async () => makeAgent({
      id: "agent-1",
      serverId: "server-1",
      name: "Cindy",
      description: "Onboarding Assistant",
    }),
    getUser: async () => ({ id: "member-1", name: "New Member" }),
    listChannels: async (...args: any[]) => {
      listCalls.push(args);
      return [{ id: "channel-all", name: "all", type: "channel" }];
    },
    createChannel: async (...args: any[]) => {
      createCalls.push(args);
      return { id: "member-onboarding", name: args[1], type: args[3] };
    },
    addHuman: async (_channelId: string, userId: string) => {
      addedHumans.push(userId);
    },
    addAgent: async () => {},
    broadcastSystemMessage: async (_io: any, _agentOrchestrator: any, channelId: string) => {
      deliveredChannels.push(channelId);
    },
    updateMemberOnboardingPreferences: async () => {
      prefsUpdated = true;
    },
  }) as any);

  const sent = await triggerNewMemberOnboarding(io, {} as any, "server-1", "member-1");

  assert.equal(sent, true);
  assert.deepEqual(listCalls[0], ["server-1", "member-1"]);
  assert.equal(createCalls[0][3], "private");
  assert.deepEqual(addedHumans, ["member-1", "owner-1"]);
  assert.deepEqual(deliveredChannels, ["member-onboarding"]);
  assert.equal(prefsUpdated, true);
  assert.equal(events.some((event) => event.room === "server:server-1"), false);
  assert.ok(events.some((event) => event.room === "user:member-1" && event.event === "channel:updated"));
  assert.ok(events.some((event) => event.room === "user:owner-1" && event.event === "channel:updated"));
  assert.deepEqual(joins, [{ rooms: ["user:member-1", "server:server-1"], channelRoom: "channel:member-onboarding" }]);
});

test("triggerNewMemberOnboarding reuses an existing private onboarding channel", async () => {
  const channelName = "onboarding-new-member";
  let createAttempts = 0;

  __setOnboardingServiceDepsForTests(makeDeps({
    getServer: async () => makeServer(),
    getMemberOnboardingPreferences: async () => ({ onboardingDmSentAt: null }),
    getAgent: async () => makeAgent({
      id: "agent-1",
      serverId: "server-1",
      name: "Cindy",
      description: "Onboarding Assistant",
    }),
    getUser: async () => ({ id: "member-1", name: "New Member" }),
    listChannels: async (_serverId: string, userId?: string) => {
      assert.equal(userId, "member-1");
      return [{ id: "existing-private", name: channelName, type: "private" }];
    },
    createChannel: async () => {
      createAttempts += 1;
      throw new Error("should not create");
    },
    addHuman: async () => {},
    addAgent: async () => {},
    broadcastSystemMessage: async () => {},
    updateMemberOnboardingPreferences: async () => {},
  }) as any);

  const sent = await triggerNewMemberOnboarding(makeIo(), {} as any, "server-1", "member-1");

  assert.equal(sent, true);
  assert.equal(createAttempts, 0);
});

test("triggerNewMemberOnboarding uses onboarding-{name} channel naming without id suffix", async () => {
  let createdChannelName = "";

  __setOnboardingServiceDepsForTests(makeDeps({
    getServer: async () => ({
      id: "server-1",
      ownerId: "owner-1",
      onboardingAgentId: "agent-1",
    }),
    getAgent: async () => makeAgent({ id: "agent-1" }),
    getMemberOnboardingPreferences: async () => ({
      onboardingDmSentAt: null,
      onboardingDmSentByAgentId: null,
      setupModalReminderOptOut: false,
    }),
    getUser: async () => ({
      id: "member-1",
      name: "Alice Example",
    }),
    listChannels: async () => [],
    createChannel: async (_serverId: string, name: string, _description?: string, type?: string) => {
      createdChannelName = name;
      return { id: "channel-1", name, type };
    },
    addHuman: async () => {},
    addAgent: async () => {},
    broadcastSystemMessage: async () => {},
    updateMemberOnboardingPreferences: async () => {},
  }) as any);

  const io = {
    to() {
      return {
        emit() {},
      };
    },
    in() {
      return this;
    },
    socketsJoin() {},
  } as any;

  const sent = await triggerNewMemberOnboarding(io, {} as any, "server-1", "member-1");
  assert.equal(sent, true);
  assert.equal(createdChannelName, "onboarding-alice-example");
  assert.equal(/-[0-9a-f]{8}$/.test(createdChannelName), false);
});
