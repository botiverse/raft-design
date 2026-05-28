import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const CHAT_BRIDGE_PATH = path.join(TEST_DIR, "chat-bridge.ts");

test("chat-bridge only exposes runtime control MCP tools", async () => {
  const source = await readFile(CHAT_BRIDGE_PATH, "utf8");
  const uncommented = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  assert.match(source, /Visible chat\/task\/channel\/reminder communication has migrated to\s+\/\/ CLI across all supported runtimes\./);
  assert.match(source, /RUNTIME_PROFILE_MIGRATION_DONE_TOOL_NAME = "runtime_profile_migration_done"/);
  assert.match(uncommented, /server\.tool\(\s*RUNTIME_PROFILE_MIGRATION_DONE_TOOL_NAME,/);
  assert.doesNotMatch(uncommented, /server\.tool\(\s*"send_message"/);
  assert.doesNotMatch(uncommented, /server\.tool\(\s*"check_messages"/);
  assert.doesNotMatch(uncommented, /server\.tool\(\s*"read_history"/);
  assert.doesNotMatch(uncommented, /server\.tool\(\s*"search_messages"/);
  assert.doesNotMatch(uncommented, /server\.tool\(\s*"list_tasks"/);
  assert.doesNotMatch(uncommented, /server\.tool\(\s*"claim_tasks"/);
  assert.doesNotMatch(uncommented, /server\.tool\(\s*"update_task_status"/);
  assert.doesNotMatch(source, /deprecatedMcpShim/);
  assert.doesNotMatch(source, /--deprecated-shim/);
  assert.doesNotMatch(source, /--runtime-actions-only/);
});
