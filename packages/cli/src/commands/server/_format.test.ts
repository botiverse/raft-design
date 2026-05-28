// Snapshot-style tests for agent-facing server info output format.
// Pins the exact text shape matching MCP list_server output.

import { test } from "node:test";
import assert from "node:assert/strict";

import { formatChannelMembers, formatServerInfo } from "./_format.js";

test("formatServerInfo: full server with channels, agents, humans", () => {
  const out = formatServerInfo({
    runtimeContext: {
      agentId: "agent-1",
      serverId: "server-1",
      machineId: "machine-1",
      machineName: "Dev Mac",
      machineHostname: "dev-mac.local",
      machineOs: "darwin arm64",
      daemonVersion: "0.41.1",
      workspacePath: "/Users/alice/.slock/agents/agent-1",
    },
    channels: [
      { name: "general", type: "channel", joined: true, description: "General discussion" },
      { name: "engineering", type: "private", joined: true },
      { name: "random", type: "channel", joined: false, description: "Off-topic" },
    ],
    agents: [
      { name: "akko", status: "online", description: "runtime IC" },
      { name: "kuku", status: "idle" },
    ],
    humans: [
      { name: "xxchan", description: "tech lead" },
      { name: "alice" },
    ],
  });
  assert.match(out, /## Server/);
  assert.match(out, /### Current Runtime/);
  assert.match(out, /Authoritative context for this agent process/);
  assert.match(out, /- Agent ID: agent-1/);
  assert.match(out, /- Server ID: server-1/);
  assert.match(out, /- Computer: Dev Mac \(machine-1\)/);
  assert.match(out, /- Hostname: dev-mac.local/);
  assert.match(out, /- OS: darwin arm64/);
  assert.match(out, /- Daemon: v0.41.1/);
  assert.match(out, /- Workspace: \/Users\/alice\/\.slock\/agents\/agent-1/);
  assert.match(out, /### Channels/);
  assert.match(out, /Private channels are shown only when you are a member/);
  assert.match(out, /slock channel join --target "#name"/);
  assert.match(out, /slock channel leave --target "#name"/);
  assert.match(out, /slock thread unfollow --target "#name:shortid"/);
  assert.match(out, /#general \[public, joined\] — General discussion/);
  assert.match(out, /#engineering \[private, joined\]/);
  assert.match(out, /#random \[public, not joined\] — Off-topic/);
  assert.match(out, /### Agents/);
  assert.match(out, /@akko \(online\) — runtime IC/);
  assert.match(out, /@kuku \(idle\)/);
  assert.match(out, /### Humans/);
  assert.match(out, /slock message send --target "dm:@name" <<'SLOCKMSG'/);
  assert.doesNotMatch(out, /<<'EOF'/);
  assert.match(out, /@xxchan — tech lead/);
  assert.match(out, /@alice\n/);
});


test("formatChannelMembers: full channel member list", () => {
  const out = formatChannelMembers({
    channel: { ref: "#proj-runtime", type: "channel" },
    agents: [
      { name: "akko", status: "active", description: "runtime IC" },
      { name: "kuku", status: "idle" },
    ],
    humans: [
      { name: "xxchan", role: "owner", description: "tech lead" },
      { name: "alice" },
    ],
  });
  assert.match(out, /## Channel Members/);
  assert.match(out, /Channel: #proj-runtime \(channel\)/);
  assert.match(out, /Members means join\/post authority/);
  assert.match(out, /### Agents/);
  assert.match(out, /@akko \(active\) — runtime IC/);
  assert.match(out, /@kuku \(idle\)/);
  assert.match(out, /### Humans/);
  assert.match(out, /Role labels show server-level owner\/admin authority/);
  assert.match(out, /@xxchan \(owner\) — tech lead/);
  assert.match(out, /@alice/);
});

test("formatChannelMembers: empty members", () => {
  const out = formatChannelMembers({ channel: { ref: "#all", type: "channel" }, agents: [], humans: [] });
  assert.match(out, /\(none\)/);
});

test("formatServerInfo: empty server", () => {
  const out = formatServerInfo({ channels: [], agents: [], humans: [] });
  assert.match(out, /\(none\)/);
});
