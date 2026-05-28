import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("message header reserves the top-right bookmark/action area", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /className="flex min-w-0 items-center gap-2 overflow-hidden pr-24"/,
  );
  assert.match(
    source,
    /className={`absolute top-1 right-1 flex items-center justify-center size-6/,
  );
  assert.match(
    source,
    /className="absolute top-1 right-8 hidden group-hover:flex items-center gap-0\.5"[\s\S]*?data-message-affordance="reaction"/,
  );
  assert.match(
    source,
    /className="absolute top-1 right-\[3\.75rem\] hidden group-hover:flex items-center gap-0\.5"[\s\S]*?data-message-affordance="thread"/,
  );
});

test("message header prioritizes time, name, then subtitle truncation", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/message/MessageItem.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /className="shrink-0 text-xs text-black\/40 font-mono whitespace-nowrap">\{time\}<\/span>/,
  );
  assert.match(
    source,
    /className="min-w-0 shrink-0 truncate text-sm font-bold text-black"/,
  );
  assert.match(
    source,
    /className="min-w-0 truncate text-xs text-black\/40 font-mono" title=\{senderSubtitle\}/,
  );
  assert.doesNotMatch(source, /font-mono truncate max-w-\[200px\]/);
});
