import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("Members agent context menu uses the panel header confirmation flows", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/Sidebar.tsx"),
    "utf8",
  );

  const memberAgentMenu = source.match(
    /\{ctxMenu\.type === "member-agent"[\s\S]*?\{ctxMenu\.type === "agent"/,
  )?.[0] ?? "";

  assert.match(source, /import ResetAgentDialog from "\.\.\/agent\/ResetAgentDialog";/);
  assert.match(source, /const \[stopAgentConfirm, setStopAgentConfirm\]/);
  assert.match(source, /const \[resetAgentTarget, setResetAgentTarget\]/);
  assert.match(source, /<ConfirmDialog[\s\S]*title="Stop Agent"[\s\S]*confirmLabel="Stop Agent"[\s\S]*confirmColor="bg-brutal-orange"/);
  assert.match(source, /<ResetAgentDialog[\s\S]*agentId=\{resetAgentTarget\.id\}[\s\S]*agentName=\{resetAgentTarget\.name\}/);

  assert.match(memberAgentMenu, /MessageSquare[\s\S]*Message/);
  assert.match(memberAgentMenu, /<ContextMenuDivider \/>/);
  assert.match(memberAgentMenu, /setStopAgentConfirm\(\{ id: agent\.id, name: agentName \}\)/);
  assert.match(memberAgentMenu, /setResetAgentTarget\(\{ id: agent\.id, name: agentName \}\)/);
  assert.match(memberAgentMenu, /Restart \/ Reset/);
  assert.doesNotMatch(memberAgentMenu, /resetAgent\(agent\.id, "session"\)/);
});
