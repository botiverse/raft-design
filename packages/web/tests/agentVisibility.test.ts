import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canViewAgentPrivateSurfaces } from "../src/utils/agentVisibility";

test("agent private surfaces are visible to server agent managers", () => {
  assert.equal(
    canViewAgentPrivateSurfaces({ creatorType: null, creatorId: null }, undefined, true),
    true,
  );
});

test("agent private surfaces are visible to the human creator", () => {
  assert.equal(
    canViewAgentPrivateSurfaces({ creatorType: "user", creatorId: "user-1" }, "user-1", false),
    true,
  );
});

test("agent private surfaces are hidden from non-creator members", () => {
  assert.equal(
    canViewAgentPrivateSurfaces({ creatorType: "user", creatorId: "user-1" }, "user-2", false),
    false,
  );
  assert.equal(
    canViewAgentPrivateSurfaces({ creatorType: "agent", creatorId: "agent-1" }, "user-1", false),
    false,
  );
});

test("agent detail status badge only renders activity detail for private-surface viewers", () => {
  const source = readFileSync(new URL("../src/components/agent/AgentDetailPanel.tsx", import.meta.url), "utf8");

  assert.match(
    source,
    /function AgentStatusBadge\(\{ agentId, showDetail, fallbackStatus \}: \{ agentId: string; showDetail: boolean; fallbackStatus\?: Agent\["status"\] \}\)/,
  );
  assert.match(source, /const activityText = showDetail\s*\?\s*displayState\.activityText\s*:\s*getActivityText\(displayState\.activity, ""\);/);
  assert.match(
    source,
    /<AgentStatusBadge agentId=\{agent\.id\} fallbackStatus=\{agent\.status\} showDetail=\{canViewPrivateAgentSurfaces\} \/>/,
  );
});

test("agent profile header renders status beside display name and handle below", () => {
  const source = readFileSync(new URL("../src/components/agent/AgentDetailPanel.tsx", import.meta.url), "utf8");

  assert.match(
    source,
    /<div className="flex min-w-0 items-center gap-2">\s*<div className="min-w-0 truncate text-lg font-bold leading-tight text-black" title=\{agent\.displayName \|\| agent\.name\}>\{agent\.displayName \|\| agent\.name\}<\/div>\s*\{!agent\.deletedAt && <AgentStatusBadge agentId=\{agent\.id\} fallbackStatus=\{agent\.status\} showDetail=\{canViewPrivateAgentSurfaces\} \/>}\s*<\/div>\s*<div className="truncate text-sm text-black\/50 font-mono" title=\{`@\$\{agent\.name\}`\}>@\{agent\.name\}<\/div>/,
  );
});

test("agent diagnostic copy entry is gated to private-surface viewers", () => {
  const source = readFileSync(new URL("../src/components/agent/AgentDetailPanel.tsx", import.meta.url), "utf8");

  assert.match(source, /\{canViewPrivateAgentSurfaces && \(/);
  assert.match(source, /onClick=\{handleCopyDiagnosticInfo\}/);
});

test("remote joint agent profiles stay in member-view mode", () => {
  const source = readFileSync(new URL("../src/components/agent/AgentDetailPanel.tsx", import.meta.url), "utf8");

  assert.match(source, /const isRemoteJointAgent = Boolean\(currentServer\?\.id && agent\.serverId && agent\.serverId !== currentServer\.id\);/);
  assert.match(source, /const canManageAgent = !isRemoteJointAgent && capabilities\.manageAgents;/);
  assert.match(source, /const canManageServer = !isRemoteJointAgent && capabilities\.manageServer;/);
  assert.match(source, /canMessageAgent=\{!isRemoteJointAgent\}/);
  assert.match(source, /showOperationalInfo=\{!isRemoteJointAgent\}/);
  assert.match(source, /const sourceServerLabel =\s*currentServerId && agent\.serverId && agent\.serverId !== currentServerId\s*\?\s*agent\.serverName \|\| agent\.serverSlug \|\| null\s*:\s*null;/);
  assert.doesNotMatch(source, /AgentSourceServerBadge/);
  assert.match(source, /\{isRemoteJointAgent && \(agent\.serverName \|\| agent\.serverSlug\) && \(/);
  assert.match(source, /<SectionEyebrow as="div" className="mb-1">\s*From\s*<\/SectionEyebrow>\s*<div className="text-sm font-bold text-black">\{agent\.serverName \|\| agent\.serverSlug\}<\/div>/);
  assert.doesNotMatch(source, /"connected server"/);
});
