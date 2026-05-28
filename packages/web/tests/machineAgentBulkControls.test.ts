import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("machine detail agents section has select-all and bulk lifecycle controls", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/machine/MachineDetailPanel.tsx"),
    "utf8",
  );
  const surfaceListItemSource = readFileSync(
    resolve(repoRoot, "src/components/ui/SurfaceListItem.tsx"),
    "utf8",
  );
  const checkMarkerSource = readFileSync(
    resolve(repoRoot, "src/components/ui/CheckMarker.tsx"),
    "utf8",
  );

  assert.match(source, /Select All/);
  assert.match(source, /Clear All/);
  assert.match(source, /Cancel/);
  assert.match(source, /selectionMode/);
  assert.match(source, /Select/);
  assert.match(source, /selectedAgentIds/);
  assert.match(source, /import SurfaceListItem from "\.\.\/ui\/SurfaceListItem"/);
  assert.match(source, /import CheckMarker from "\.\.\/ui\/CheckMarker"/);
  assert.match(source, /<SurfaceListItem[\s\S]*selected=\{canManageMachines && selected\}/);
  assert.match(source, /<CheckMarker[\s\S]*checked=\{selected\}[\s\S]*size="lg"[\s\S]*tone="yellow-fill"/);
  assert.match(source, /selectionMode \? \(/);
  assert.match(source, /canManageMachines && !selectionMode &&/);
  assert.match(source, /onClick=\{\(\) => toggleAgentSelection\(agent\.id\)\}/);
  assert.match(source, /runBulkAction\("start"\)/);
  assert.match(source, /setShowStopConfirm\(true\)/);
  assert.match(source, /runBulkAction\("stop"\)/);
  assert.match(source, /runBulkAction\(bulkResetMode\)/);
  assert.match(source, /resetAgent\(agent\.id, action\)/);
  assert.match(source, /Restart \/ Reset/);
  assert.match(source, /Stop Agents/);
  assert.match(source, /label: "Restart"/);
  assert.match(source, /Reset Session & Restart/);
  assert.match(source, /Full Reset & Restart/);
  assert.match(surfaceListItemSource, /hover:shadow-brutal-sm/);
  assert.match(surfaceListItemSource, /selected/);
  assert.match(checkMarkerSource, /bg-brutal-yellow text-black/);
  assert.match(checkMarkerSource, /group-hover:text-black\/20/);
  assert.doesNotMatch(source, /<AgentListRow/);
  assert.doesNotMatch(source, />\\s*Done\\s*</);
});
