import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

const readSource = (path: string) => readFileSync(resolve(repoRoot, path), "utf8");

test("add computer dialog shows separate Computer experimental setup command under the daemon command", () => {
  const source = readSource("src/components/machine/AddMachineDialog.tsx");

  assert.match(source, /npx @slock-ai\/daemon@\$\{daemonDistTag\}/);
  assert.match(source, /const serverSlug = useServerStore\(\(s\) => s\.current\?\.slug\)/);
  assert.match(source, /getComputerSetupCommand\(serverSlug, import\.meta\.env\.VITE_DEPLOYMENT_ENV, serverUrl, \{/);
  assert.match(source, /legacyApiKey: apiKey/);
  assert.match(source, />\s*Computer\s*</);
  assert.match(source, /<ExperimentalBadge\b/);
  assert.match(source, /type CommandCopyTarget = "daemon" \| "computer"/);
  assert.match(source, /handleCopy\("daemon", runCommand\)/);
  assert.match(source, /handleCopy\("computer", computerSetupCommand\)/);
  assert.doesNotMatch(source, /Keep the terminal window open|Keep this process running/);
});

test("machine detail connect command keeps daemon and Computer experimental copy buttons separate", () => {
  const source = readSource("src/components/machine/MachineDetailPanel.tsx");

  assert.match(source, /npx @slock-ai\/daemon@latest/);
  assert.match(source, /getComputerSetupCommand\(serverSlug, import\.meta\.env\.VITE_DEPLOYMENT_ENV, serverUrl, \{/);
  assert.match(source, /legacyApiKey: isKeyValid \? savedKey : null/);
  assert.match(source, />\s*Computer\s*</);
  assert.match(source, /<ExperimentalBadge\b/);
  assert.match(source, /type CommandCopyTarget = "daemon" \| "computer"/);
  assert.match(source, /handleCopy\("daemon", connectCommand\)/);
  assert.match(source, /handleCopy\("computer", computerSetupCommand\)/);
  assert.match(source, /copiedCommand === "daemon"/);
  assert.match(source, /copiedCommand === "computer"/);
  assert.doesNotMatch(source, /Keep this process running/);
});

test("ExperimentalBadge primitive carries the canonical lime tone via Badge", () => {
  const source = readSource("src/components/ui/ExperimentalBadge.tsx");
  // Lime tone now flows through the Badge primitive via tone="lime";
  // uppercase + tracking-wide are baked into Badge itself (brutal theme's
  // visual contract) so the wrapper doesn't repeat them.
  assert.match(source, /tone="lime"/);
  assert.match(source, /Experimental\s*<\/Badge>/);
  assert.doesNotMatch(source, /bg-brutal-lime/);
  assert.doesNotMatch(source, /\buppercase\b/);
  // Reject the old `eyebrow` prop (now baked into Badge) — but allow
  // narrative text in comments that mentions it for context.
  assert.doesNotMatch(source, /eyebrow={true}|\beyebrow\s*=/);
  assert.doesNotMatch(source, /<Badge[^>]*\beyebrow\b/);
});
