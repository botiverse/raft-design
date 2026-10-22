import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { expect, test } from "vite-plus/test";

/**
 * Explicit-style rules that place a `:has()` on one element and style something
 * else through it are a document-wide invalidation trap.
 *
 * When a rule styles a descendant/child/sibling off an ancestor's `:has()`
 * (Tailwind's `group-has-*` variants, `has-[...]:*:` / `has-…:**:` chains,
 * `[&:not(:has(...))]>…`), Chromium cannot bound the style invalidation: any
 * unrelated mutation — e.g. replacing the composer's text node — recalculates
 * the styles of the entire page. Measured on the desktop build (300-message
 * channel, ~13.8k elements) a single such rule costs >5ms per change; all 29
 * rules at or above that threshold are replaced (#386). `:has()` that
 * styles the element it sits on (e.g. `has-data-popup-open:bg-…`) does not
 * trigger the trap and is fine.
 *
 * The supported replacements:
 * - mirror the state into a custom property on the `:has()` element and let
 *   the styled parts read it (`[--card-text-col:2]` + `var(--card-text-col)`),
 *   or
 * - use a sibling selector from the composed parts (`title ~ description ~ &`).
 *
 * This guard is a ratchet:
 * - the exact patterns fixed for #386 are banned outright,
 * - the number of `has-…`-family tokens is frozen per file (any new shape,
 *   renamed or not, trips it — regenerate the map for an intentional add),
 * - the compiled CSS may not gain sub-element-styling `:has()` rules,
 * - `src/**` `.css` files stay free of raw `:has()`.
 *
 * The raft (Raft Design System) recipes use self-subject tokens only — a
 * root styled from its own children (`has-[>svg]:grid-cols-…`, a row reading
 * its checkbox's state); dropping the brutal and elegant branches took the
 * compiled sub-element shape count to zero.
 *
 * Baseline caveat, deliberately recorded: the remaining entries below are NOT
 * individually cleared. The #386 sweep found the 29 rules above; everything
 * else sits under its 5ms single-rule threshold (their combined residual was
 * ~4.4ms). Treat these as “frozen pending further measurement”, not “safe”.
 */

const THIS_FILE = "no-ancestor-has.test.ts";
const SRC_DIR = fileURLToPath(new URL(".", import.meta.url));
const DOC_SRC_DIR = fileURLToPath(new URL("../../../apps/doc/src", import.meta.url));

function sourceFiles(dir: string, extensions: RegExp): string[] {
  const files: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current)) {
      if (entry === "node_modules" || entry === "dist") continue;
      const path = join(current, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (extensions.test(path)) files.push(path);
    }
  };
  walk(dir);
  return files;
}

const LITERAL = /"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`/g;
const HAS_TOKEN = /has-\[|has-data-\[|:has\(/;

function collectHasTokens(source: string): Set<string> {
  const tokens = new Set<string>();
  for (const match of source.matchAll(LITERAL)) {
    for (const token of match[0].slice(1, -1).split(/\s+/)) {
      if (HAS_TOKEN.test(token)) tokens.add(token);
    }
  }
  return tokens;
}

/** Exact class-string patterns removed in #386; any of them coming back is the bug. */
const BANNED_REGRESSIONS = [
  "group-has-data-panel-open/section-header",
  "group-has-data-popup-open/section-header",
  "group-has-data-popup-open/message",
  "group-has-[[data-slot=input-group-control]",
  "group-has-[>svg]/banner",
  "group-has-[>[data-slot=status]]/banner",
  "group-has-[>[data-slot=banner-title]]/banner",
  "group-has-[>[data-slot=card-leading]]/card-header",
  "group-has-[>[data-slot=tabs-background]]/tabs-list",
  "*:data-[slot=banner-action]:row-span-2",
  "[&:not(:has([data-slot=toast-description]))>[data-slot=toast-body]:only-child]",
  "[&:has([data-slot=toast-description])_[data-slot=toast-body]]",
  "has-data-[slot=composer-attachment-image]:**:data-[slot=composer-attachment-failed-overlay]",
  "has-[>[data-slot=panel-meta]]:*:data-[slot=panel-header-icon]",
  "has-[>[data-slot=panel-header-icon]]:*:data-[slot=panel-",
  "has-[>[data-slot=sidebar-item-subtitle]]:*:data-[slot=sidebar-item-title]",
  "has-[[data-input-group-trim=inline-end]]:[&_[data-slot=input-group-control]]",
  "has-[>[data-slot=textarea-counter]]:[&>[data-slot=textarea]]",
  "has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-header-icon]]",
];

/**
 * `has-…`-family tokens per shipped source file (test files assert on these
 * strings, so they are not counted). Regenerate a number only for an
 * intentional addition; the message says so when a file drops below baseline.
 */
const BASELINE_TOKENS: Record<string, number> = {
  "components/banner/banner.tsx": 11,
  "components/button/button.tsx": 4,
  "components/card/card.recipe.ts": 7,
  "components/composer/composer-attachment.recipe.ts": 7,
  "components/files/files.recipe.ts": 7,
  "components/inbox-item/inbox-item.recipe.ts": 14,
  "components/input-group/input-group.tsx": 7,
  // A plain row with a description moves its leading block onto the title's
  // line: two custom properties set on the row itself (self-subject).
  "components/list-row/list-row.recipe.ts": 2,
  "components/message-attachment/message-image-gallery.recipe.ts": 1,
  // The row sets its jumped-to / selected fill as --mi-row-fill on itself
  // (self-subject, 4), and with a "sent by" label the header aligns on the
  // baseline and floors the owner (3), and the label caps at 45% only when
  // it holds a name (4).
  "components/message-item/message-item.recipe.ts": 10,
  "components/message-item/message-reaction.recipe.ts": 1,
  "components/message-item/message-reference.recipe.ts": 5,
  // The header wraps when it holds "(sent by …)" (self-subject).
  "components/message-quoted-preview/message-quoted-preview.recipe.ts": 1,
  "components/message-replies/message-replies.recipe.ts": 1,
  "components/notification-center/notification-center.tsx": 1,
  "components/panel/panel-header.recipe.ts": 0,
  "components/picker-trigger-button/picker-trigger-button.tsx": 2,
  "components/sidebar/sidebar-item.recipe.ts": 2,
  "components/sidebar/sidebar-section.recipe.ts": 3,
  "components/sidebar/sidebar.recipe.ts": 2,
  "components/task-card/task-card-status.recipe.ts": 1,
  "components/toast/toast.tsx": 2,
  "components/tooltip/tooltip.tsx": 2,
};

/**
 * Compiled-CSS shape counts, name-independent: a rule matches when its selector
 * contains `:has()` but the element the rule styles is not the element carrying
 * the condition. `grouped` = Tailwind group variants (`:is(:where(…:has(…) *)`);
 * `subElement` = the class' condition styling a child/sibling, detected with a
 * light heuristic (pseudo arguments masked, then compounds after a combinator
 * checked). Both are counts, not bans, and both are zero: `grouped` since the
 * #386 batch, `subElement` since the brutal and elegant branches (the banner
 * action-button family and its svg passthroughs) were removed. Keep them there.
 */
const BASELINE_COMPILED_SHAPES = { grouped: 0, subElement: 0 } as const;

function maskPseudoArguments(selector: string): string {
  return selector.replace(/:\w[\w-]*\((?:[^()]|\([^()]*\))*\)/g, ":p").replace(/\\./g, "_");
}

function stylesSubElement(selector: string): boolean {
  if (/[>+~]\s*\*/.test(selector)) return true;
  const masked = maskPseudoArguments(selector);
  const parts = masked
    .split(/((?:[>+~]\s*)|(?:\s+))/)
    .filter((part) => part && !/^\s*$/.test(part));
  for (let i = 1; i < parts.length; i += 2) {
    const next = parts[i + 1];
    if (next && !next.startsWith(":")) return true;
  }
  return false;
}

test("the fixed ancestor-:has() patterns do not come back", () => {
  for (const dir of [SRC_DIR, DOC_SRC_DIR]) {
    for (const file of sourceFiles(dir, /\.(ts|tsx)$/)) {
      if (file.endsWith(THIS_FILE)) continue;
      const source = readFileSync(file, "utf8");
      for (const banned of BANNED_REGRESSIONS) {
        const count = source.split(banned).length - 1;
        expect(count, `${relative(SRC_DIR, file)} reintroduced ${banned}`).toBe(0);
      }
    }
  }
});

test("has-…-family tokens do not grow per file", () => {
  for (const file of sourceFiles(SRC_DIR, /\.(ts|tsx)$/)) {
    const rel = relative(SRC_DIR, file);
    if (rel.endsWith(THIS_FILE) || /\.test\./.test(rel)) continue;
    const count = collectHasTokens(readFileSync(file, "utf8")).size;
    const baseline = BASELINE_TOKENS[rel] ?? 0;
    expect(
      count,
      `${rel} has ${count} has-…-family tokens (baseline ${baseline}); preferring the ` +
        "data-attribute / sibling-selector shapes keeps `:has()` self-subject only",
    ).toBeLessThanOrEqual(baseline);
    expect(baseline - count, `${rel} improved below its baseline; regenerate BASELINE_TOKENS`).toBe(
      0,
    );
  }
});

test("compiled CSS gains no sub-element-styling :has() rules", async () => {
  const tokens = new Set<string>();
  for (const file of sourceFiles(SRC_DIR, /\.(ts|tsx)$/)) {
    const rel = relative(SRC_DIR, file);
    if (rel.endsWith(THIS_FILE) || /\.test\./.test(rel)) continue;
    for (const token of collectHasTokens(readFileSync(file, "utf8"))) tokens.add(token);
  }

  const compiler = await compile("@tailwind utilities;");
  const css = compiler
    .build([...tokens])
    .split("\n")
    .filter((line) => !/^\s*@(media|layer|supports|container|starting-style|keyframes)/.test(line))
    .join("\n");

  const grouped: string[] = [];
  const subElement: string[] = [];
  for (const segment of css.split("}")) {
    const brace = segment.indexOf("{");
    if (brace < 0) continue;
    const selector = segment.slice(0, brace).trim();
    if (!selector || selector.startsWith("@") || selector.startsWith("/*")) continue;
    if (!selector.includes(":has(")) continue;
    if (selector.includes(":is(:where(")) grouped.push(selector);
    else if (stylesSubElement(selector)) subElement.push(selector);
  }

  expect(
    grouped.length,
    `group-has-* shapes are banned (#386); found:\n${grouped.slice(0, 5).join("\n")}`,
  ).toBeLessThanOrEqual(BASELINE_COMPILED_SHAPES.grouped);
  expect(
    subElement.length,
    `sub-element-styling :has() rules grew (baseline ${BASELINE_COMPILED_SHAPES.subElement}):\n${subElement
      .slice(0, 5)
      .join("\n")}`,
  ).toBeLessThanOrEqual(BASELINE_COMPILED_SHAPES.subElement);
  expect(
    BASELINE_COMPILED_SHAPES.subElement - subElement.length,
    "sub-element-styling :has() rules dropped; regenerate BASELINE_COMPILED_SHAPES",
  ).toBe(0);
});

test("src CSS files stay free of raw :has()", () => {
  for (const file of sourceFiles(SRC_DIR, /\.css$/)) {
    const source = readFileSync(file, "utf8");
    const count = source.split(":has(").length - 1;
    expect(count, `${relative(SRC_DIR, file)} uses raw :has() in CSS; use a data attribute`).toBe(
      0,
    );
  }
});
