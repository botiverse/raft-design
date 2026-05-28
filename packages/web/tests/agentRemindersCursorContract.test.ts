import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

function readSource(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

test("reminder message refs keep the app-chrome arrow cursor", () => {
  const source = readSource("src/components/agent/AgentRemindersSection.tsx");

  assert.match(source, /href=\{reminder\.msgPermalink\}/);
  assert.match(
    source,
    /href=\{reminder\.msgPermalink\}[\s\S]*?className="[^"]*cursor-default[^"]*"/,
  );
  assert.doesNotMatch(source, /cursor-pointer/);
});
