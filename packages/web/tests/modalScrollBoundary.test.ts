import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("shared Modal keeps tall dialogs scrollable from the top", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/Modal.tsx"), "utf8");

  assert.match(source, /className=\{`fixed inset-0 \$\{zClass\} overflow-y-auto bg-black\/60`\}/);
  assert.match(source, /className="flex min-h-full w-full p-4"/);
  assert.match(source, /className="m-auto flex w-full justify-center"/);
  assert.doesNotMatch(source, /fixed inset-0 \$\{zClass\} flex items-center justify-center/);
});
