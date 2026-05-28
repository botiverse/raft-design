import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("human profile shows Created Agents above bottom Actions", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/member/HumanDetailPanel.tsx"),
    "utf8",
  );

  const createdAgentsIndex = source.indexOf("Created Agents");
  const canRemoveActionsIndex = source.indexOf("Actions", source.indexOf("{canRemove &&"));

  assert.notEqual(createdAgentsIndex, -1, "HumanDetailPanel should render Created Agents");
  assert.notEqual(canRemoveActionsIndex, -1, "HumanDetailPanel should render removable member Actions");
  assert.ok(
    createdAgentsIndex < canRemoveActionsIndex,
    "Created Agents is profile content and must appear above bottom Actions",
  );
});

test("remote joint human profile shows source server and hides local-only info", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/member/HumanDetailPanel.tsx"),
    "utf8",
  );

  assert.match(source, /const isRemoteJointHuman = Boolean\(currentServerId && human\.serverId && human\.serverId !== currentServerId\);/);
  assert.match(source, /const sourceServerLabel = isRemoteJointHuman \? human\.serverName \|\| human\.serverSlug \|\| null : null;/);
  assert.doesNotMatch(source, /titleSuffix=\{[\s\S]*sourceServerLabel/);
  assert.match(source, /\{sourceServerLabel && \(\s*<div className="border-b border-black\/10 px-5 py-3">[\s\S]*<SectionEyebrow as="div" className="mb-1">\s*From\s*<\/SectionEyebrow>[\s\S]*<div className="text-sm font-bold text-black">\{sourceServerLabel\}<\/div>/);
  assert.match(source, /\{!isRemoteJointHuman && \(\s*<div className="px-5 py-4 border-t border-black\/10">[\s\S]*Info/);
  assert.match(source, /\{!isRemoteJointHuman && \(\s*<div className="px-5 py-4 border-t border-black\/10">[\s\S]*Created Agents/);
  assert.match(source, /const canEditRole =[\s\S]*human\.membershipStatus === "active" &&[\s\S]*!isRemoteJointHuman &&[\s\S]*capabilities\.changeMemberRoles/);
  assert.match(source, /const canRemove =[\s\S]*human\.membershipStatus === "active" &&[\s\S]*!isRemoteJointHuman &&[\s\S]*capabilities\.manageMembers/);
});

test("agent profile keeps profile content above bottom Actions", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/agent/AgentDetailPanel.tsx"),
    "utf8",
  );

  const profileInfoIndex = source.indexOf("<AgentProfileInfo");
  const actionsIndex = source.indexOf("{/* Actions */}");

  assert.notEqual(profileInfoIndex, -1, "AgentDetailPanel should render profile content");
  assert.notEqual(actionsIndex, -1, "AgentDetailPanel should render bottom Actions");
  assert.ok(
    profileInfoIndex < actionsIndex,
    "Agent profile content must appear above bottom Actions",
  );
});
