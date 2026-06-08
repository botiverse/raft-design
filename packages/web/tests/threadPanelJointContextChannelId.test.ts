import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const threadPanel = readFileSync(
  resolve(repoRoot, "src/components/message/ThreadPanel.tsx"),
  "utf8",
);

// Regression guard for the joint-channel thread "No replies yet" bug.
//
// Repro: in a joint channel, when a thread has unread replies (e.g. the other
// workspace just replied), opening the thread focuses the first-unread reply
// and loads it via `GET /messages/context/:id`. Without a `channelId` query
// param the server cannot resolve the joint thread projection to its canonical
// store and returns 404; the load effect's catch then left the panel blank,
// rendering "No replies yet" despite a non-zero reply count.
//
// The server route IS joint-aware, but ONLY when `channelId` is supplied
// (routes/messages.ts: type==="thread" -> getJointThreadProjectionByLocalThread,
// type==="joint" -> resolveChannelAccess). These two callers must therefore
// always pass channelId, matching messageStore.ts's context callers.

test("ThreadPanel focus-load passes channelId so joint thread replies resolve", () => {
  // The focused reply lives in the thread channel.
  assert.match(
    threadPanel,
    /api\.get\(`\/messages\/context\/\$\{initialFocusId\}`,\s*\{\s*params:\s*\{\s*channelId:\s*threadChannelId\s*\}\s*\}\)/,
    "focus-load /messages/context call must pass { params: { channelId: threadChannelId } }",
  );
});

test("ThreadPanel parent-load passes channelId so joint parents resolve", () => {
  // The parent message lives in the parent (joint) channel.
  assert.match(
    threadPanel,
    /api\.get\(`\/messages\/context\/\$\{parentMessageId\}`,\s*\{\s*params:\s*\{\s*channelId:\s*parentChannelId\s*\}\s*\}\)/,
    "parent-load /messages/context call must pass { params: { channelId: parentChannelId } }",
  );
});

test("ThreadPanel focus-load failure falls back to loading latest thread messages", () => {
  // A failed focused-context load must degrade to the thread's latest messages
  // instead of leaving the panel blank ("No replies yet"). The load-effect's
  // catch is the one that opens with `if (cancelled) return;` (inner fallback
  // catches open with `if (!cancelled)`), so anchor on that to target it.
  assert.match(
    threadPanel,
    /\.catch\(\(\)\s*=>\s*\{\s*if\s*\(cancelled\)\s*return;[\s\S]*?if\s*\(initialFocusId\)\s*\{\s*void\s+loadLatestThreadMessages\(threadChannelId\)/,
    "load-effect catch must fall back to loadLatestThreadMessages(threadChannelId) on focused-context failure",
  );
});
