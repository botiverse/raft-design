import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("agent:create action cards pass structured computer placement into create dialog", () => {
  const actionCard = readFileSync(resolve(repoRoot, "src/components/actions/ActionCard.tsx"), "utf8");
  const dialog = readFileSync(resolve(repoRoot, "src/components/agent/CreateAgentDialog.tsx"), "utf8");

  assert.match(actionCard, /prefilledMachineId=\{action\.requiredComputer \?\? action\.suggestedComputer\}/);
  assert.match(actionCard, /prefilledMachineMode=\{action\.requiredComputer \? "required" : action\.suggestedComputer \? "preferred" : undefined\}/);
  assert.match(actionCard, /Required computer:/);
  assert.match(actionCard, /Suggested computer:/);

  assert.match(dialog, /prefilledMachineMode === "required" && selectedMachineId !== prefilledMachineId/);
  assert.match(dialog, /This action card requires the specified computer/);
  assert.match(dialog, /The suggested computer is unavailable\. Pick a computer to continue\./);
});
