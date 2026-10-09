import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * Ancestor-`:has()` styles are a document-wide invalidation trap.
 *
 * When a rule styles a descendant off an ancestor's `:has()` — Tailwind's
 * `group-has-*` variants, `has-[...]:*:data-*` chains, `[&:not(:has(...))]>...` —
 * Chromium cannot bound the style invalidation: any unrelated mutation, e.g.
 * replacing the composer's text node, recalculates the styles of the entire
 * page. Measured on the desktop build (300-message channel, ~13.8k elements):
 * ~55ms per text-node change, dropping to <=0.1ms once the last such rule is
 * gone (#133). Two rules fixed here were exactly this shape; see the sidebar
 * section recipe, toast content and banner action for the supported replacements:
 *
 * - mirror render-time state into a data attribute and key the variant off it
 *   (`group-data-[open]/section`, `data-has-description`), or
 * - use a sibling selector from the composed parts (`title ~ description ~ &`).
 *
 * This guard is a ratchet. The exact patterns that were fixed are banned
 * outright; beyond that, ancestor-`:has()` variants must not grow per file.
 * When a count drops below its baseline, regenerate the numbers — editing this
 * table is the review point for an intentional new use.
 */

const THIS_FILE = "no-ancestor-has.test.ts";
const SRC_DIR = fileURLToPath(new URL(".", import.meta.url));
const DOC_SRC_DIR = fileURLToPath(new URL("../../../apps/doc/src", import.meta.url));

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      yield* sourceFiles(path);
    } else if (/\.(ts|tsx)$/.test(path)) {
      yield path;
    }
  }
}

function occurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

/** Exact class-string patterns removed in this change; any of them coming back is the bug. */
const BANNED_REGRESSIONS = [
  "group-has-data-panel-open/section-header",
  "group-has-data-popup-open/section-header",
  "*:data-[slot=banner-action]:row-span-2",
  "[&:not(:has([data-slot=toast-description]))>[data-slot=toast-body]:only-child]",
  "[&:has([data-slot=toast-description])_[data-slot=toast-body]]",
];

/**
 * Post-fix `group-has-` counts per file. These are the shapes still awaiting a
 * measurement verdict or replacements of their own — they did not reproduce the
 * whole-page recalculation in the #133 measurements, but they are the same
 * family, so additions are what this table blocks.
 */
const GROUP_HAS_BASELINE: Record<string, number> = {
  "components/banner/banner.tsx": 18,
  "components/card/card.recipe.ts": 3,
  "components/input-group/input-group.tsx": 4,
  "components/message-item/message-item.recipe.ts": 4,
  "components/tabs/tabs.tsx": 2,
};

test("the fixed ancestor-:has() patterns do not come back", () => {
  for (const dir of [SRC_DIR, DOC_SRC_DIR]) {
    for (const file of sourceFiles(dir)) {
      if (file.endsWith(THIS_FILE)) continue;
      const source = readFileSync(file, "utf8");
      for (const banned of BANNED_REGRESSIONS) {
        expect(
          occurrences(source, banned),
          `${relative(SRC_DIR, file)} reintroduced ${banned}`,
        ).toBe(0);
      }
    }
  }
});

test("group-has-* variants do not grow per file", () => {
  for (const file of sourceFiles(SRC_DIR)) {
    if (file.endsWith(THIS_FILE)) continue;
    const rel = relative(SRC_DIR, file);
    const count = occurrences(readFileSync(file, "utf8"), "group-has-");
    const baseline = GROUP_HAS_BASELINE[rel] ?? 0;
    expect(
      count,
      `${rel} has ${count} ancestor-:has() variants (baseline ${baseline}); ` +
        "prefer data attributes or sibling selectors over group-has-*",
    ).toBeLessThanOrEqual(baseline);
    expect(
      baseline - count,
      `${rel} improved below its baseline; regenerate GROUP_HAS_BASELINE`,
    ).toBe(0);
  }
});
