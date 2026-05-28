import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("tasks view mode persists across channel route changes", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/task/TasksPanel.tsx"),
    "utf8",
  );

  assert.match(source, /const TASK_VIEW_MODE_STORAGE_KEY = "slock\.tasks\.viewMode";/);
  assert.match(source, /function parseTaskViewMode\(value: string \| null\): ViewMode \| null \{/);
  assert.match(source, /value === "board" \|\| value === "list" \? value : null/);
  assert.match(source, /function readStoredTaskViewMode\(\): ViewMode \| null \{/);
  assert.match(source, /window\.localStorage\.getItem\(TASK_VIEW_MODE_STORAGE_KEY\)/);
  assert.match(source, /function writeStoredTaskViewMode\(nextView: ViewMode\): void \{/);
  assert.match(source, /window\.localStorage\.setItem\(TASK_VIEW_MODE_STORAGE_KEY, nextView\)/);
  assert.match(source, /const \[storedViewMode, setStoredViewMode\] = useState<ViewMode \| null>\(\(\) => readStoredTaskViewMode\(\)\);/);
  assert.match(source, /if \(param\) return param;\s+if \(storedViewMode\) return storedViewMode;\s+return isMobile \? "list" : "board";/);
  assert.match(source, /setStoredViewMode\(nextView\);\s+writeStoredTaskViewMode\(nextView\);/);
});
