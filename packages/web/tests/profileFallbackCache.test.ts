import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import {
  getCachedAgentProfile,
  getCachedHumanProfile,
  primeHumanProfileFromChannelMember,
  setCachedAgentProfile,
} from "../src/components/profile/profileFallbackCache";
import type { Agent } from "../src/store/agentStore";

const repoRoot = resolve(import.meta.dirname, "..");

function makeAgent(): Agent {
  return {
    id: "agent-peer-1",
    serverId: "peer-server",
    serverName: "Peer Server",
    serverSlug: "peer",
    name: "peer-agent",
    displayName: "Peer Agent",
    avatarUrl: null,
    description: "remote peer",
    status: "active",
    model: "gpt-5.2",
    runtime: "codex",
    reasoningEffort: null,
    executionMode: "cloud",
    envVars: null,
    machineId: null,
    creatorType: null,
    creatorId: null,
    creator: null,
    createdAgents: [],
    deletedAt: null,
    createdAt: new Date(0).toISOString(),
  };
}

test("profile fallback cache stores peer agent and human summaries for instant panel open", () => {
  const agent = makeAgent();
  setCachedAgentProfile(agent);
  assert.deepEqual(getCachedAgentProfile(agent.id), agent);

  primeHumanProfileFromChannelMember("host-server", {
    id: "human-peer-1",
    serverId: "peer-server",
    serverName: "Peer Server",
    serverSlug: "peer",
    name: "peer-human",
    displayName: "Peer Human",
    description: "remote person",
    avatarUrl: null,
    gravatarHash: "",
  });
  assert.deepEqual(getCachedHumanProfile("host-server", "human-peer-1"), {
    userId: "human-peer-1",
    serverId: "peer-server",
    serverName: "Peer Server",
    serverSlug: "peer",
    email: null,
    gravatarHash: "",
    name: "peer-human",
    displayName: "Peer Human",
    description: "remote person",
    avatarUrl: null,
    role: null,
    joinedAt: null,
    membershipStatus: "active",
    createdAgents: [],
  });
});

test("channel member clicks prime the profile fallback cache before opening profile", () => {
  const channelMembers = readFileSync(
    resolve(repoRoot, "src/components/agent/ChannelMembers.tsx"),
    "utf8",
  );
  const profilePanel = readFileSync(
    resolve(repoRoot, "src/components/profile/ProfilePanel.tsx"),
    "utf8",
  );

  assert.match(channelMembers, /setCachedAgentProfile\(agent\);[\s\S]*openProfile\("agent", agent\.id\);/);
  assert.match(channelMembers, /primeHumanProfileFromChannelMember\(currentChannel\.serverId, human\);[\s\S]*openProfile\("human", human\.id\);/);
  assert.match(profilePanel, /setFallbackAgent\(getCachedAgentProfile\(profileId\)\);[\s\S]*api\.get\(`\/agents\/\$\{profileId\}`\)/);
  assert.match(profilePanel, /setFallbackHuman\(getCachedHumanProfile\(currentServerId, profileId\)\);[\s\S]*api\.get\(`\/servers\/\$\{currentServerId\}\/members\/\$\{profileId\}\/profile`\)/);
});
