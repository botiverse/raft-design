import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

// Locks the fix for task #291 (iPad Safari tall message bubble).
//
// QuotedMessageCard's Root is conditionally a <button> when onClick is provided. A bare
// <button> defaults to display: inline-block, and when its internal layout wraps to
// multiple lines (long quoted parent triggering line-clamp + header row wrap), its
// outer baseline lands at the last-line baseline. The parent block reserves descender
// space below that baseline, leaving ~180px of empty space below the card inside the
// bubble — the "tall message bubble" reported on iPad Safari.
//
// Forcing display: block on the Root collapses the parent to the card's actual height.
// Both className strings (normal + unavailable variant) must include `block`.
test("QuotedMessageCard Root carries `block` class so the button variant does not strut the parent bubble", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/ui/cards/QuotedMessageCard.tsx"),
    "utf8",
  );

  const classNameStrings = Array.from(source.matchAll(/className="([^"]*)"/g)).map((m) => m[1]);
  const rootClassNames = classNameStrings.filter((cls) => cls.includes("quoted-message-card"));

  // We don't have data-testid on the className itself; instead find each Root by the
  // surrounding data-testid attribute. Pull the className that sits next to a Root
  // attribute block.
  const rootBlocks = Array.from(
    source.matchAll(/data-testid="quoted-message-card"\s+className="([^"]*)"/g),
  ).map((m) => m[1]);

  assert.equal(
    rootBlocks.length,
    2,
    "expected exactly two Root className blocks (normal + unavailable variant); update test if structure changed",
  );

  for (const cls of rootBlocks) {
    assert.match(
      cls,
      /(^|\s)block(\s|$)/,
      `Root className "${cls}" must include the \`block\` utility — task #291 regresses if Root is left inline-block`,
    );
  }
});
