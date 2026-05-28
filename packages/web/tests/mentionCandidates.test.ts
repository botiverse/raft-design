import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildMentionCandidateGroups,
  getMentionCandidateDescription,
  getMentionCandidateServerLabel,
  type MentionCandidate,
} from "../src/components/message/mentionCandidates.js";
import type { Message } from "../src/store/messageStore.js";

const candidates: MentionCandidate[] = [
  { id: "member-idle", name: "alice", displayName: "Alice", type: "user", avatarUrl: null },
  { id: "outsider-recent", name: "zoe", displayName: "Zoe", type: "user", avatarUrl: null },
  { id: "member-recent", name: "bob", displayName: "Bob", type: "agent", avatarUrl: null, description: "Builds frontend flows" },
  { id: "outsider-idle", name: "maya", displayName: "Maya", type: "agent", avatarUrl: null, description: "Research\nand synthesis" },
];

function makeMessage(senderId: string, createdAt: string): Message {
  return {
    id: `${senderId}-${createdAt}`,
    channelId: "thread-1",
    senderType: "user",
    senderId,
    content: "hi",
    createdAt,
  };
}

test("channel thread keeps channel members ahead of non-members", () => {
  const groups = buildMentionCandidateGroups({
    candidates,
    query: "",
    channelMemberIds: new Set(["member-idle", "member-recent"]),
    prioritizeThreadParticipants: true,
    threadMessages: [
      makeMessage("member-recent", "2026-04-21T19:00:00.000Z"),
      makeMessage("outsider-recent", "2026-04-21T19:05:00.000Z"),
    ],
  });

  assert.deepEqual(groups.inChannel.map((candidate) => candidate.id), ["member-recent", "member-idle"]);
  assert.deepEqual(groups.notInChannel.map((candidate) => candidate.id), ["outsider-recent", "outsider-idle"]);
  assert.deepEqual(groups.flat.map((candidate) => candidate.id), [
    "member-recent",
    "member-idle",
    "outsider-recent",
    "outsider-idle",
  ]);
});

test("thread recency only reorders candidates within each membership bucket", () => {
  const groups = buildMentionCandidateGroups({
    candidates,
    query: "",
    channelMemberIds: new Set(["member-idle", "member-recent"]),
    prioritizeThreadParticipants: true,
    threadMessages: [
      makeMessage("member-idle", "2026-04-21T19:00:00.000Z"),
      makeMessage("member-recent", "2026-04-21T19:10:00.000Z"),
      makeMessage("outsider-idle", "2026-04-21T19:15:00.000Z"),
      makeMessage("outsider-recent", "2026-04-21T19:20:00.000Z"),
    ],
  });

  assert.deepEqual(groups.inChannel.map((candidate) => candidate.id), ["member-recent", "member-idle"]);
  assert.deepEqual(groups.notInChannel.map((candidate) => candidate.id), ["outsider-recent", "outsider-idle"]);
});

test("non-thread mode preserves original candidate order inside each bucket", () => {
  const groups = buildMentionCandidateGroups({
    candidates,
    query: "a",
    channelMemberIds: new Set(["member-idle", "member-recent"]),
  });

  assert.deepEqual(groups.inChannel.map((candidate) => candidate.id), ["member-idle"]);
  assert.deepEqual(groups.notInChannel.map((candidate) => candidate.id), ["outsider-idle"]);
  assert.deepEqual(groups.flat.map((candidate) => candidate.id), ["member-idle", "outsider-idle"]);
});

test("agent mention descriptions are normalized for compact dropdown display", () => {
  assert.equal(getMentionCandidateDescription(candidates[2]!), "Builds frontend flows");
  assert.equal(getMentionCandidateDescription(candidates[3]!), "Research and synthesis");
  assert.equal(getMentionCandidateDescription(candidates[0]!), null);
});

test("joint mention candidates preserve peer server labels", () => {
  assert.equal(
    getMentionCandidateServerLabel({
      id: "peer-agent",
      serverId: "peer-server",
      serverName: "Isolation",
      serverSlug: "isolation",
      name: "orphan-agent",
      displayName: "Orphan Agent",
      type: "agent",
      avatarUrl: null,
      description: null,
    }),
    "Isolation",
  );
  assert.equal(
    getMentionCandidateServerLabel({
      id: "peer-user",
      serverId: "peer-server",
      serverName: null,
      serverSlug: "isolation",
      name: "isolation-admin",
      displayName: "Isolation Admin",
      type: "user",
      avatarUrl: null,
    }),
    "isolation",
  );
});

test("MessageInput builds @mention candidates from aggregated channel membership", () => {
  const source = readFileSync(new URL("../src/components/message/MessageInput.tsx", import.meta.url), "utf8");

  assert.match(source, /const memberScopedMentions = mentionScopeChannel\?\.type === "private" \|\| mentionScopeChannel\?\.type === "joint";/);
  assert.match(source, /if \(!memberScopedMentions && currentUser\)/);
  assert.match(source, /if \(!memberScopedMentions\) \{/);
  assert.match(source, /for \(const human of channelHumans\)/);
  assert.match(source, /for \(const agent of channelAgents\)/);
  assert.match(source, /const isRemoteHuman = Boolean\(currentServer\?\.id && human\.serverId && human\.serverId !== currentServer\.id\);/);
  assert.match(source, /const isRemoteAgent = Boolean\(currentServer\?\.id && agent\.serverId && agent\.serverId !== currentServer\.id\);/);
  assert.match(source, /c\.type === "channel" \|\| c\.type === "private" \|\| c\.type === "joint"/);
  assert.match(source, /Source server: \$\{serverLabel\}/);
  assert.match(source, /\{serverLabel\}/);
  assert.doesNotMatch(source, /Joint · \{serverLabel\}/);
});
