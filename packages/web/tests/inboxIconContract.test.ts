import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("activity sidebar entry uses the same icon as the activity panel header", () => {
  const sidebar = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");
  const inbox = readFileSync(resolve(repoRoot, "src/components/thread/ThreadsInbox.tsx"), "utf8");

  assert.match(inbox, /import \{[^}]*\bActivity\b[^}]*\} from "lucide-react";/s);
  assert.match(sidebar, /import \{[^}]*\bActivity\b[^}]*\} from "lucide-react";/s);
  assert.match(inbox, /<Activity size=\{18\} \/>/);
  assert.match(sidebar, /<Activity size=\{14\} className="shrink-0" \/>/);
  assert.doesNotMatch(sidebar, /<MessageSquareText size=\{14\} className="shrink-0" \/>/);
});
