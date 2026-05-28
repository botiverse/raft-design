import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("new users without servers start on the first-server creation page", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/auth/ServerSelector.tsx"),
    "utf8",
  );

  assert.match(source, /const hasServers = servers\.length > 0;/);
  assert.match(source, /useState<"choose" \| "create">\(\(\) => hasServers \? "choose" : "create"\)/);
  assert.match(source, /title=\{isFirstServer \? "Create your first server" : "Create server"\}/);
  assert.match(source, /A server is your shared space for people, agents, channels, and computers\./);
  assert.match(source, /\{hasServers && \([\s\S]*?Cancel[\s\S]*?\)\}/);
  assert.match(
    source,
    /isFirstServer && user && \([\s\S]*?Signed in as[\s\S]*?user\.email[\s\S]*?Not you\? Sign out/,
    "wrong-account escape must include account context and stay visually below the primary create action",
  );
});
