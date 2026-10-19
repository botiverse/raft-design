import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { expect, test } from "vite-plus/test";

/**
 * No rule may end in a structural pseudo-class that nothing anchors: a
 * rightmost compound like `:not(:last-child)`, `> :last-child` or
 * `* :first-child`, with no class, attribute or tag beside it.
 *
 * WebKit (every iOS browser) evaluates such a compound against every element,
 * and doing so marks every parent as depending on which child is first or
 * last. Appending or removing a child at the end of any container then
 * restyles the previous last child's whole subtree. Measured in WebKit on a
 * 315-message channel: 180-430ms each time the chat's bottom controls mounted
 * after the 10k-element timeline. Chromium does not pay this, so it only shows
 * on iOS.
 *
 * The usual source is Tailwind v4's `space-*` and `divide-*`, which compile to
 * `:where(.x > :not(:last-child))`. Use the owl-based `stack-y-*` /
 * `stack-x-*` and `rule-y` / `rule-x` / `rule-<colour>` from styles.css, or
 * put the structural variant on the element it styles (`last:mb-0` compiles
 * to `.last\:mb-0:last-child`, anchored by its own class).
 */

const THIS_FILE = "no-unanchored-structural.test.ts";
const SRC_DIR = fileURLToPath(new URL(".", import.meta.url));
const DOC_SRC_DIR = fileURLToPath(new URL("../../../apps/doc/src", import.meta.url));
const styles = readFileSync(join(SRC_DIR, "styles.css"), "utf8");

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

function classTokens(source: string): string[] {
  const tokens: string[] = [];
  for (const match of source.matchAll(LITERAL)) {
    for (const token of match[0].slice(1, -1).split(/\s+/)) if (token) tokens.push(token);
  }
  return tokens;
}

function packageSources(): { rel: string; source: string }[] {
  return [SRC_DIR, DOC_SRC_DIR].flatMap((dir) =>
    sourceFiles(dir, /\.(ts|tsx)$/)
      .filter(
        (file) =>
          !file.endsWith(THIS_FILE) && !/\.test\./.test(file) && !file.endsWith("routeTree.gen.ts"),
      )
      .map((file) => ({
        rel: relative(join(SRC_DIR, "../../.."), file),
        source: readFileSync(file, "utf8"),
      })),
  );
}

/** The stack-* and rule-* utilities, lifted out of styles.css so they compile without its imports. */
function spacingUtilities(): string {
  const blocks = styles.match(/@utility -?(?:stack|rule)-[^{]*\{(?:[^{}]*\{[^{}]*\})+\s*\}/g) ?? [];
  expect(
    blocks.length,
    "styles.css defines the stack-* and rule-* utilities",
  ).toBeGreaterThanOrEqual(7);
  return blocks.join("\n");
}

const STRUCTURAL =
  /:(?:first-child|last-child|only-child|first-of-type|last-of-type|only-of-type|nth-(?:child|last-child|of-type|last-of-type)\b)/;

/** The rightmost compound of a selector, outside any parentheses. */
function rightmostCompound(selector: string): string {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const ch = selector[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    else if (depth === 0 && (ch === " " || ch === ">" || ch === "+" || ch === "~")) start = i + 1;
  }
  return selector.slice(start).trim();
}

function unanchoredStructural(selector: string): boolean {
  let inner = selector.trim();
  while (/^:where\((.*)\)$/s.test(inner)) inner = inner.replace(/^:where\((.*)\)$/s, "$1").trim();
  return inner.split(",").some((part) => {
    const compound = rightmostCompound(part.trim());
    if (!STRUCTURAL.test(compound)) return false;
    // Anchored if the compound itself carries a class, id, attribute or tag.
    const withoutPseudos = compound.replace(/:[\w-]+(\((?:[^()]|\([^()]*\))*\))?/g, "");
    return !/[.#[]|^[a-z]/i.test(withoutPseudos);
  });
}

test("sources use stack-* and rule-*, never space-* or divide-*", () => {
  const offenders: string[] = [];
  for (const { rel, source } of packageSources()) {
    for (const token of classTokens(source)) {
      const utility = token.split(":").at(-1) ?? "";
      if (/^-?(?:space-[xy]-|divide(?:-[xy])?(?:-|$))/.test(utility))
        offenders.push(`${rel}: ${token}`);
    }
  }
  expect(offenders).toEqual([]);
});

test("compiled CSS has no rule ending in an unanchored structural pseudo-class", async () => {
  const tokens = new Set<string>();
  for (const { source } of packageSources())
    for (const token of classTokens(source)) tokens.add(token);
  // A theme with spacing and a colour, so space-*/divide-* would compile if anything still used them.
  const compiler = await compile(
    `@theme { --spacing: 0.25rem; --color-line-hairline: #ddd; }\n${spacingUtilities()}\n@tailwind utilities;`,
  );
  const css = compiler.build([...tokens]);
  const offenders: string[] = [];
  for (const segment of css.split("}")) {
    const brace = segment.indexOf("{");
    if (brace < 0) continue;
    const selector = segment.slice(0, brace).trim();
    if (!selector || selector.startsWith("@") || selector.startsWith("/*")) continue;
    if (unanchoredStructural(selector)) offenders.push(selector);
  }
  expect(offenders).toEqual([]);
});

test("stack-* and rule-* compile to zero-specificity owl selectors", async () => {
  const compiler = await compile(
    `@theme { --spacing: 0.25rem; --color-line-hairline: #ddd; }\n${spacingUtilities()}\n@tailwind utilities;`,
  );
  const css = compiler.build([
    "stack-y-2",
    "stack-y-1.5",
    "stack-y-px",
    "stack-x-[-5px]",
    "-stack-x-[5px]",
    "rule-y",
    "rule-x",
    "rule-line-hairline",
  ]);
  for (const cls of [
    "stack-y-2",
    "stack-y-1\\.5",
    "stack-y-px",
    "stack-x-\\[-5px\\]",
    "-stack-x-\\[5px\\]",
    "rule-y",
    "rule-x",
    "rule-line-hairline",
  ]) {
    expect(css, cls).toContain(`:where(.${cls} > * + *)`);
  }
  expect(css).toMatch(
    /:where\(\.stack-y-2 > \* \+ \*\) \{\s*margin-block-start: calc\(var\(--spacing\) \* 2\);/,
  );
  expect(css).toMatch(
    /:where\(\.-stack-x-\\\[5px\\\] > \* \+ \*\) \{\s*margin-inline-start: calc\(5px \* -1\);/,
  );
  expect(css).toMatch(
    /:where\(\.rule-y > \* \+ \*\) \{\s*border-block-start-width: 1px;\s*border-block-start-style: solid;/,
  );
  expect(css).not.toMatch(/:not\(:last-child\)/);
  // The guard itself must catch the shape it exists for.
  expect(unanchoredStructural(":where(.space-y-2 > :not(:last-child))")).toBe(true);
  expect(unanchoredStructural(".group\\/message[data-followed-by] .body > :last-child")).toBe(true);
  expect(unanchoredStructural(".last\\:mb-0:last-child")).toBe(false);
  expect(unanchoredStructural(":where(.stack-y-2 > * + *)")).toBe(false);
});
