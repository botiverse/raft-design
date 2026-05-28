import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const source = readFileSync(resolve(import.meta.dirname, "channelService.ts"), "utf8");

test("user-DM peer payloads expose uploaded avatars with Gravatar fallback", () => {
  assert.match(
    source,
    /peerAvatarUrl:\s*peer\.avatarUrl,\s*peerGravatarHash:\s*createHash\("sha256"\)\.update\(peer\.email\.trim\(\)\.toLowerCase\(\)\)\.digest\("hex"\)/,
    "find-or-create user DM response should return uploaded avatar URL plus Gravatar fallback hash",
  );
});
