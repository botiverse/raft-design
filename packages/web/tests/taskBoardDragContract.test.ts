import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("task board draggable cards apply dnd-kit transform while dragging", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/task/TasksPanel.tsx"),
    "utf8",
  );

  assert.match(source, /import \{ CSS \} from "@dnd-kit\/utilities";/);
  assert.match(source, /const \{ attributes, listeners, setNodeRef, transform, isDragging \} = useDraggable\(\{ id: task\.id \}\);/);
  assert.match(source, /transform: CSS\.Translate\.toString\(transform\)/);
  assert.doesNotMatch(source, /transform: CSS\.Transform\.toString\(transform\)/);
  assert.match(source, /data-testid="task-board-draggable-card"/);
  assert.match(source, /style=\{dragStyle\}/);
  assert.match(source, /touch-none will-change-transform/);
});
