import type { Server as SocketServer } from "socket.io";
import type { AgentOrchestrator } from "./agentOrchestrator.js";
import * as agentService from "./agentService.js";
import * as channelService from "./channelService.js";
import * as messageService from "./messageService.js";
import * as serverService from "./serverService.js";
import * as userService from "./userService.js";

type OnboardingKind = "owner" | "member";

type OnboardingServiceDeps = {
  getAgent: typeof agentService.getAgent;
  listAgents: typeof agentService.listAgents;
  tryMarkAllChannelIntroSent: typeof agentService.tryMarkAllChannelIntroSent;
  clearAllChannelIntroSentClaim: typeof agentService.clearAllChannelIntroSentClaim;
  listChannels: typeof channelService.listChannels;
  createChannel: typeof channelService.createChannel;
  addHuman: typeof channelService.addHuman;
  addAgent: typeof channelService.addAgent;
  findOrCreateDM: typeof channelService.findOrCreateDM;
  broadcastSystemMessage: typeof messageService.broadcastSystemMessage;
  getServer: typeof serverService.getServer;
  getServerOnboardingSettings: typeof serverService.getServerOnboardingSettings;
  updateServerOnboardingAgent: typeof serverService.updateServerOnboardingAgent;
  getMemberOnboardingPreferences: typeof serverService.getMemberOnboardingPreferences;
  updateMemberOnboardingPreferences: typeof serverService.updateMemberOnboardingPreferences;
  getUser: typeof userService.getUser;
};

const defaultOnboardingServiceDeps: OnboardingServiceDeps = {
  getAgent: agentService.getAgent,
  listAgents: agentService.listAgents,
  tryMarkAllChannelIntroSent: agentService.tryMarkAllChannelIntroSent,
  clearAllChannelIntroSentClaim: agentService.clearAllChannelIntroSentClaim,
  listChannels: channelService.listChannels,
  createChannel: channelService.createChannel,
  addHuman: channelService.addHuman,
  addAgent: channelService.addAgent,
  findOrCreateDM: channelService.findOrCreateDM,
  broadcastSystemMessage: messageService.broadcastSystemMessage,
  getServer: serverService.getServer,
  getServerOnboardingSettings: serverService.getServerOnboardingSettings,
  updateServerOnboardingAgent: serverService.updateServerOnboardingAgent,
  getMemberOnboardingPreferences: serverService.getMemberOnboardingPreferences,
  updateMemberOnboardingPreferences: serverService.updateMemberOnboardingPreferences,
  getUser: userService.getUser,
};

let onboardingServiceDepsOverride: Partial<OnboardingServiceDeps> | null = null;

function resolveOnboardingServiceDeps(): OnboardingServiceDeps {
  return {
    ...defaultOnboardingServiceDeps,
    ...(onboardingServiceDepsOverride ?? {}),
  };
}

export function __setOnboardingServiceDepsForTests(overrides: Partial<OnboardingServiceDeps>) {
  onboardingServiceDepsOverride = overrides;
}

export function __resetOnboardingServiceDepsForTests() {
  onboardingServiceDepsOverride = null;
}

export function isOwnerOnboardingActivationEligible(
  serverOnboardingAgentId: string | null | undefined,
  activatedAgentId: string,
): boolean {
  return !!serverOnboardingAgentId && serverOnboardingAgentId === activatedAgentId;
}

function buildOnboardingInstruction(kind: OnboardingKind, userName: string, locationHint: string) {
  const scopeLine = kind === "owner"
    ? "This is the server owner's onboarding."
    : "This is a new human member onboarding.";

  const base = [
    "Onboarding task (system-triggered):",
    scopeLine,
    `Please proactively onboard @${userName} in ${locationHint}.`,
    "Default language is English; first ask what language they prefer.",
  ];

  if (kind === "member") {
    return [
      ...base,
      "Goals (soft guidance, do not force):",
      "1) Help them understand what Slock is and what this server is for.",
      "2) Introduce relevant humans/channels/agents for their current work (not a full catalog dump).",
      "3) Suggest where they should start collaborating right away.",
      "Do NOT ask them to set up the server or create agents/channels.",
      "If they are already working on a concrete task, keep onboarding lightweight and adapt to their flow.",
    ].join("\n");
  }

  return [
    ...base,
    "Goals (soft guidance, do not force):",
    "1) Help them understand what is Slock and get comfortable working with Slock.",
    "2) Help them set up this server for real work, with an initial agent team (target: at least 3 agents) and practical channels.",
    "3) If they have no clear idea yet, proactively suggest asking Cindy for inspiration and give one simple starter path.",
    "After the first agent exists, point them to the real onboarding wizard steps for inviting teammates and joining the Slock Community; do not invent action cards.",
    "Keep it simple and conversational: no info dumps, no checklist-style interrogation, one actionable next step at a time.",
    "",
    "When the owner agrees to a new channel or agent, post a quick-commit action card with `slock action prepare` instead of just describing it or sending a copyable spec. The action-card flow is documented in your `notes/onboarding_playbook.md` (Starter Plan Output) and `notes/onboarding_knowledge_faq.md` (FAQ 15) — follow the playbook contract.",
  ].join("\n");
}

function buildAllChannelIntroInstruction(agentName: string, agentDescription?: string | null) {
  const hasRoleDescription = !!agentDescription?.trim();
  return [
    "First message task (system-triggered):",
    "Please post in #all now.",
    `Use your Slock identity name: @${agentName}.`,
    "Do not use local OS usernames, filesystem path names, or machine usernames as your identity.",
    hasRoleDescription
      ? "Use your own description as your role context."
      : "You are a general agent by default (no specific role description set).",
    "Say hi and briefly introduce yourself (role + how you can help).",
    "Keep it short and friendly.",
  ].join("\n");
}

function normalizeMemberOnboardingChannelName(userName: string): string {
  const suffix = userName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const trimmed = suffix.slice(0, 20) || "member";
  return `onboarding-${trimmed}`.slice(0, 32);
}

async function pickOnboardingAgent(serverId: string, fallbackAgentId?: string | null) {
  const deps = resolveOnboardingServiceDeps();
  const server = await deps.getServer(serverId);
  if (!server) return null;

  if (server.onboardingAgentId) {
    const configured = await deps.getAgent(server.onboardingAgentId);
    if (configured && configured.serverId === serverId) {
      return configured;
    }
    // Self-heal stale/deleted onboarding agent references.
    await deps.updateServerOnboardingAgent(serverId, null);
  }

  if (!fallbackAgentId) return null;
  const fallback = await deps.getAgent(fallbackAgentId);
  if (!fallback || fallback.serverId !== serverId) return null;
  return fallback;
}

async function ensureMemberOnboardingChannel(
  io: SocketServer,
  serverId: string,
  memberUserId: string,
  ownerUserId: string,
  onboardingAgentId: string,
  memberName: string,
) {
  const deps = resolveOnboardingServiceDeps();
  const channelName = normalizeMemberOnboardingChannelName(memberName);
  const existing = (await deps.listChannels(serverId, memberUserId))
    .find((ch) => (ch.type === "channel" || ch.type === "private") && ch.name === channelName);

  let channel = existing ?? null;
  let created = false;
  if (!channel) {
    channel = await deps.createChannel(
      serverId,
      channelName,
      "Member onboarding workspace (system-managed).",
      "private",
    );
    created = true;
  }

  await deps.addHuman(channel.id, memberUserId);
  await deps.addHuman(channel.id, ownerUserId);
  await deps.addAgent(channel.id, onboardingAgentId);

  if (created) {
    emitPrivateChannelCreated(io, channel, [memberUserId, ownerUserId]);
  }

  return channel;
}

function emitPrivateChannelCreated(
  io: SocketServer,
  channel: Awaited<ReturnType<OnboardingServiceDeps["createChannel"]>>,
  userIds: string[],
) {
  io.to(`channel:${channel.id}`).emit("channel:updated", { channel: { ...channel, joined: true } });
  for (const userId of new Set(userIds)) {
    io.to(`user:${userId}`).emit("channel:updated", { channel: { ...channel, joined: true } });
  }
}

async function ensureAllChannel(serverId: string) {
  const deps = resolveOnboardingServiceDeps();
  const list = await deps.listChannels(serverId);
  return list.find((ch) => ch.type === "channel" && ch.name === "all") ?? null;
}

export async function triggerAgentIntroInAllChannel(
  agentOrchestrator: AgentOrchestrator,
  serverId: string,
  agentId: string,
) {
  const deps = resolveOnboardingServiceDeps();

  const agent = await deps.getAgent(agentId);
  if (!agent || agent.serverId !== serverId) return false;
  if (agent.allChannelIntroSentAt) return false;

  const settings = await deps.getServerOnboardingSettings(serverId);
  if (!settings?.agentAllChannelGreetingEnabled) return false;

  const allChannel = await ensureAllChannel(serverId);
  if (!allChannel) return false;

  const claimedAt = new Date();
  const claimed = await deps.tryMarkAllChannelIntroSent(agentId, claimedAt);
  if (!claimed) return false;

  try {
    await deps.addAgent(allChannel.id, agentId);
    await agentOrchestrator.deliverMessage(agentId, {
      channel_id: allChannel.id,
      channel_name: allChannel.name,
      channel_type: "channel",
      sender_id: "system",
      sender_name: "system",
      sender_type: "human",
      content: buildAllChannelIntroInstruction(agent.displayName || agent.name, agent.description),
      timestamp: claimedAt.toISOString(),
    });
    return true;
  } catch (err) {
    await deps.clearAllChannelIntroSentClaim(agentId, claimedAt).catch(() => {});
    throw err;
  }
}

async function sendOnboardingInstruction(
  io: SocketServer,
  agentOrchestrator: AgentOrchestrator,
  serverId: string,
  targetUserId: string,
  onboardingAgentId: string,
  kind: OnboardingKind,
) {
  const deps = resolveOnboardingServiceDeps();
  const user = await deps.getUser(targetUserId);
  if (!user) return false;

  if (kind === "owner") {
    const allChannel = await ensureAllChannel(serverId);
    if (!allChannel) return false;

    await deps.addAgent(allChannel.id, onboardingAgentId);

    const content = buildOnboardingInstruction(kind, user.name, `#${allChannel.name} channel`);
    await deps.broadcastSystemMessage(io, agentOrchestrator, allChannel.id, content, {
      targetAgentIds: [onboardingAgentId],
    });
    return true;
  }

  const server = await deps.getServer(serverId);
  if (!server) return false;

  const onboardingChannel = await ensureMemberOnboardingChannel(
    io,
    serverId,
    targetUserId,
    server.ownerId,
    onboardingAgentId,
    user.name,
  );

  io
    .in(`user:${targetUserId}`)
    .in(`server:${serverId}`)
    .socketsJoin(`channel:${onboardingChannel.id}`);

  const content = buildOnboardingInstruction(kind, user.name, `#${onboardingChannel.name} channel`);
  await deps.broadcastSystemMessage(io, agentOrchestrator, onboardingChannel.id, content, {
    targetAgentIds: [onboardingAgentId],
  });
  return true;
}

export async function triggerOwnerOnboardingOnAgentActivation(
  io: SocketServer,
  agentOrchestrator: AgentOrchestrator,
  serverId: string,
  activatedAgentId: string,
) {
  const deps = resolveOnboardingServiceDeps();
  try {
    await triggerAgentIntroInAllChannel(agentOrchestrator, serverId, activatedAgentId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Onboarding] Failed to trigger #all intro for agent ${activatedAgentId}: ${msg}`);
  }

  const server = await deps.getServer(serverId);
  if (!server) return false;

  const ownerPrefs = await deps.getMemberOnboardingPreferences(serverId, server.ownerId);
  // `setupModalReminderOptOut` is intentionally NOT checked here.
  // It only suppresses setup modal reminders on the web UI, not system
  // onboarding task triggers.
  if (!ownerPrefs || ownerPrefs.onboardingDmSentAt) return false;

  // Owner onboarding is only fired when server has an explicit onboarding agent
  // and that exact agent is currently activating.
  if (!isOwnerOnboardingActivationEligible(server.onboardingAgentId, activatedAgentId)) return false;

  const onboardingAgent = await pickOnboardingAgent(serverId, null);
  if (!onboardingAgent) return false;

  const sent = await sendOnboardingInstruction(
    io,
    agentOrchestrator,
    serverId,
    server.ownerId,
    onboardingAgent.id,
    "owner",
  );
  if (!sent) return false;

  await deps.updateMemberOnboardingPreferences(serverId, server.ownerId, {
    onboardingDmSentAt: new Date(),
    onboardingDmSentByAgentId: onboardingAgent.id,
  });

  return true;
}

export async function triggerNewMemberOnboarding(
  io: SocketServer,
  agentOrchestrator: AgentOrchestrator,
  serverId: string,
  userId: string,
) {
  const deps = resolveOnboardingServiceDeps();
  const prefs = await deps.getMemberOnboardingPreferences(serverId, userId);
  // `setupModalReminderOptOut` applies to setup modal reminder UX only.
  // Member onboarding DM trigger remains system-driven.
  if (!prefs || prefs.onboardingDmSentAt) return false;

  const onboardingAgent = await pickOnboardingAgent(serverId, null);
  if (!onboardingAgent) return false;

  const sent = await sendOnboardingInstruction(
    io,
    agentOrchestrator,
    serverId,
    userId,
    onboardingAgent.id,
    "member",
  );
  if (!sent) return false;

  await deps.updateMemberOnboardingPreferences(serverId, userId, {
    onboardingDmSentAt: new Date(),
    onboardingDmSentByAgentId: onboardingAgent.id,
  });
  return true;
}
