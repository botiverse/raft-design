import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("Sidebar sortable sections support both pointer and touch dragging", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/Sidebar.tsx"),
    "utf8",
  );

  assert.match(source, /PointerSensor,/);
  assert.match(source, /TouchSensor,/);
  assert.match(
    source,
    /const dndSensors = useSensors\(\s*useSensor\(PointerSensor, \{ activationConstraint: \{ distance: 6 \} \}\),\s*useSensor\(TouchSensor, \{ activationConstraint: \{ delay: 500, tolerance: 10 \} \}\),\s*\);/,
  );
  assert.equal(source.split("sensors={dndSensors}").length - 1, 4);
});
