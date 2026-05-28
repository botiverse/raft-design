import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("human avatar surfaces use the avatar itself as upload entry without extra remove button", () => {
  const settings = readFileSync(resolve(repoRoot, "src/components/settings/SettingsPanel.tsx"), "utf8");
  const humanProfile = readFileSync(resolve(repoRoot, "src/components/member/HumanDetailPanel.tsx"), "utf8");

  for (const [label, source] of [
    ["Account settings", settings],
    ["Human profile", humanProfile],
  ] as const) {
    assert.match(
      source,
      /title=\{avatarSaving \? "Uploading avatar" : "Upload image"\}/,
      `${label} should keep the avatar itself as the upload entry`,
    );
    assert.doesNotMatch(
      source,
      /Remove custom image|Failed to clear avatar|handle(?:RemoveCustom|ClearUploaded)Avatar/,
      `${label} should not add a visible remove-custom-image action after upload`,
    );
  }
});
