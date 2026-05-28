import assert from "node:assert/strict";
import test from "node:test";
import { buildSearchEntityResults } from "../src/components/search/searchEntities.js";

test("ranks exact/prefix entity matches ahead of substring matches", () => {
  const results = buildSearchEntityResults({
    query: "gen",
    channels: [
      { id: "c1", name: "general", description: null, type: "channel", createdAt: "" },
      { id: "c2", name: "eng-general", description: null, type: "channel", createdAt: "" },
    ],
    members: [],
    agents: [],
    currentUser: null,
    dmChannels: [],
  });

  assert.deepEqual(
    results.map((result) => result.key),
    ["channel:c1", "channel:c2"]
  );
});

test("includes agents and humans as DM targets even if no DM channel exists yet", () => {
  const results = buildSearchEntityResults({
    query: "ray",
    channels: [],
    members: [
      {
        userId: "u1",
        email: "ray@slock.ai",
        name: "ray",
        displayName: "Ray",
        avatarUrl: null,
        role: "member",
        joinedAt: "",
      },
    ],
    agents: [
      {
        id: "a1",
        name: "ray-agent",
        displayName: "Ray Agent",
        avatarUrl: null,
        description: null,
        status: "active",
        model: "gpt-5",
        runtime: "codex",
        reasoningEffort: null,
        executionMode: "cloud",
        envVars: null,
        machineId: null,
        deletedAt: null,
        createdAt: "",
      },
    ],
    currentUser: null,
    dmChannels: [],
  });

  assert.equal(results.length, 2);
  assert.deepEqual(
    new Set(results.map((result) => `${result.key}:${String(result.channelId)}`)),
    new Set(["agent:a1:null", "human:u1:null"])
  );
});

test("includes the current user as a self DM entity match", () => {
  const results = buildSearchEntityResults({
    query: "dev",
    channels: [],
    agents: [],
    currentUser: {
      id: "user-self",
      email: "dev@slock.ai",
      name: "Developer",
      displayName: null,
      avatarUrl: null,
      emailVerified: true,
    },
    members: [{
      userId: "user-self",
      email: "dev@slock.ai",
      gravatarHash: "hash",
      name: "Developer",
      displayName: null,
      description: null,
      avatarUrl: null,
      role: "owner",
      joinedAt: new Date().toISOString(),
    }],
    dmChannels: [{
      id: "dm-self",
      name: "Developer",
      description: null,
      type: "dm",
      createdAt: new Date().toISOString(),
      peerType: "user",
      peerId: "user-self",
      peerName: "Developer",
      peerDisplayName: null,
      peerDescription: null,
      peerGravatarHash: "hash",
      peerAvatarUrl: null,
    }],
  });

  assert.equal(results.length, 1);
  assert.equal(results[0].type, "humanDm");
  assert.equal(results[0].channelId, "dm-self");
  assert.equal(results[0].title, "Developer");
  assert.equal(results[0].subtitle, "Self DM");
});
