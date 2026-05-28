import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("slug input renders a fixed slash prefix before the editable slug", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/ui/SlugInput.tsx"), "utf8");

  assert.match(source, /aria-hidden="true"/);
  assert.match(source, />\s*\/\s*<\/span>/);
  assert.match(source, /<input[\s\S]*\{\.\.\.props\}/);
});

test("server creation uses the fixed slash slug input", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/auth/ServerSelector.tsx"), "utf8");

  assert.match(source, /import SlugInput from "\.\.\/ui\/SlugInput"/);
  assert.match(source, /<FormField label="URL slug"[\s\S]*?<SlugInput[\s\S]*?placeholder="my-team"/);
  assert.doesNotMatch(source, /label="URL slug"[\s\S]{0,200}<input/);
});

test("joint channel creation uses the fixed slash server-slug input", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/channel/CreateJointChannelDialog.tsx"), "utf8");

  assert.match(source, /import SlugInput from "\.\.\/ui\/SlugInput"/);
  assert.match(source, /<FormField label="Invite server slug" required>[\s\S]*?<SlugInput[\s\S]*?placeholder="partner-workspace"/);
  assert.doesNotMatch(source, /label="Invite server slug"[\s\S]{0,240}<input/);
});

test("server delete slug confirmation keeps the same slash mental model", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/settings/SettingsPanel.tsx"), "utf8");

  assert.match(source, /import SlugInput from "\.\.\/ui\/SlugInput"/);
  assert.match(source, /<SlugInput[\s\S]*?data-testid="server-delete-slug-input"[\s\S]*?placeholder=\{server\.slug\}/);
  assert.doesNotMatch(source, /data-testid="server-delete-slug-input"[\s\S]{0,120}<input/);
});
