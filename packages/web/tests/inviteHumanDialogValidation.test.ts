import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("InviteHumanDialog validates and trims email inputs before posting invites", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/member/InviteHumanDialog.tsx"), "utf8");

  assert.match(
    source,
    /const targets = emails\.map\(\(email\) => email\.trim\(\)\)\.filter\(Boolean\);[\s\S]*?for \(const target of targets\) \{[\s\S]*?const emailError = validateEmailAddress\(target\);[\s\S]*?if \(emailError\) \{[\s\S]*?setError\(emailError\);[\s\S]*?return;[\s\S]*?Promise\.all\(targets\.map\(\(email\) => api\.post\(`\/servers\/\$\{server\.id\}\/invites`, \{ email \}\)\)\)/s,
    "invalid invite emails should be blocked locally and only trimmed valid emails should reach the API",
  );
});
