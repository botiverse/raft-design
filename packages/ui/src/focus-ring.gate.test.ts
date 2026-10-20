import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * Focus indicators show only after keyboard navigation
 * (design/foundations/states.md#focus). installInputModality puts
 * `data-input-modality` on the root; styles.css empties `--focus-ring` while it
 * says "pointer", and the `keyboard:` variant gates indicators drawn without
 * the token. With no attribute at all every ring shows.
 *
 * Asserted on the source, so it runs in CI; the browser tests next to Input,
 * InputGroup and Composer check the rendered result.
 */

const read = (file: string) =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
const STYLES = read("./styles.css");
const FOUNDATION = read("./foundation.css");
const GATE = '[data-input-modality="pointer"]';

/** The selectors of every rule that declares `property`. */
function scopesDeclaring(css: string, property: string): string[][] {
  const scopes: string[][] = [];
  for (let at = css.indexOf(`${property}:`); at >= 0; at = css.indexOf(`${property}:`, at + 1)) {
    const open = css.lastIndexOf("{", at);
    const start = Math.max(css.lastIndexOf("}", open), css.lastIndexOf("{", open - 1)) + 1;
    const selector = css.slice(start, open).trim();
    scopes.push(selector.split(/,(?![^(]*\))/).map((part) => part.trim()));
  }
  return scopes;
}

/** [ids, classes/attributes/pseudo-classes, types] for one complex selector. */
function specificity(selector: string): [number, number, number] {
  let rest = selector;
  const total: [number, number, number] = [0, 0, 0];
  const add = (s: [number, number, number]) => s.forEach((n, i) => (total[i] += n));
  const pseudo = /:(where|is|not)\(((?:[^()]|\([^()]*\))*)\)/;
  for (let match = rest.match(pseudo); match; match = rest.match(pseudo)) {
    if (match[1] !== "where") {
      const args = match[2].split(/,(?![^(]*\))/).map((arg) => specificity(arg.trim()));
      add(args.reduce((max, s) => (compare(s, max) > 0 ? s : max)));
    }
    rest = rest.replace(match[0], " ");
  }
  total[0] += (rest.match(/#[\w-]+/g) ?? []).length;
  total[1] += (rest.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? []).length;
  total[2] += (rest.match(/(^|[\s>+~])[a-z][\w-]*/gi) ?? []).length;
  return total;
}

function compare(a: number[], b: number[]): number {
  for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

const gateRules = scopesDeclaring(STYLES, "--focus-ring");
const gateSelectors = gateRules.flat();

test("styles.css empties --focus-ring only under the explicit pointer modality", () => {
  expect(gateSelectors.length, "styles.css must gate --focus-ring").toBeGreaterThan(0);
  for (const selector of gateSelectors) {
    // Gating on anything but the explicit value would hide rings when the
    // tracker is absent (no script), which must keep every ring.
    expect(selector, "the gate selects only the explicit pointer modality").toContain(GATE);
    expect(selector.startsWith(`:root${GATE}`), selector).toBe(true);
  }
  const block = STYLES.slice(STYLES.indexOf(gateSelectors.at(-1)!));
  expect(block.slice(block.indexOf("{"), block.indexOf("}"))).toMatch(/--focus-ring:\s*0 0 #0000;/);
});

test("with no modality attribute the ring is a real ring, in light and dark", () => {
  const values = [...FOUNDATION.matchAll(/--focus-ring:\s*([^;]+);/g)].map((m) => m[1]);
  // light, explicit dark, system dark
  expect(values).toHaveLength(3);
  for (const value of values) expect(value).toMatch(/0 0 0 2px oklch\(.+\), 0 0 0 4px oklch\(/);
});

/**
 * Each scope that declares the ring in foundation.css, paired with the gate
 * selector that matches the same element. The gate wins on specificity, not
 * only on source order, because a consumer may load the foundation after it.
 */
const PAIRS: Array<[scope: string, gate: string]> = [
  [":where(:root)", `:root${GATE}`],
  [".light", `:root${GATE}`],
  [".dark", `:root${GATE}`],
  [":root:not(.light):not(.dark)", `:root${GATE}:not(.light):not(.dark)`],
  [".light", `:root${GATE} :is(.light, .dark)`],
  [".dark", `:root${GATE} :is(.light, .dark)`],
];

test("the gate outranks every scope that declares the ring: both modes, the system fallback and islands", () => {
  const scopes = new Set(scopesDeclaring(FOUNDATION, "--focus-ring").flat());
  expect([...scopes].sort()).toEqual([
    ".dark",
    ".light",
    ":root:not(.light):not(.dark)",
    ":where(:root)",
  ]);
  for (const [scope, gate] of PAIRS) {
    expect(gateSelectors, `missing gate for ${scope}`).toContain(gate);
    expect(
      compare(specificity(gate), specificity(scope)),
      `${gate} must outrank ${scope}`,
    ).toBeGreaterThan(0);
  }
});

test("the keyboard: variant matches unless the last input was a pointer", () => {
  expect(STYLES).toContain(`@custom-variant keyboard (&:not(:where(:root${GATE} *)));`);
});

const SRC_DIR = fileURLToPath(new URL(".", import.meta.url));
const DOC_SRC_DIR = fileURLToPath(new URL("../../../apps/doc/src", import.meta.url));

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current)) {
      if (entry === "node_modules" || entry === "dist") continue;
      const path = join(current, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(ts|tsx)$/.test(path) && !/\.test\./.test(path)) files.push(path);
    }
  };
  walk(dir);
  return files;
}

test("focus indicators are keyboard-only: focus-visible for fields, has-focus-visible for groups, keyboard: off the token", () => {
  const problems: string[] = [];
  for (const dir of [SRC_DIR, DOC_SRC_DIR]) {
    for (const file of sourceFiles(dir)) {
      const tokens = readFileSync(file, "utf8").split(/[\s"'`]+/);
      const present = new Set(tokens);
      /** A width the same variant turns off again (`…:outline-none`, `…:ring-0`) draws nothing. */
      const neutralized = (token: string) => {
        const prefix = token.slice(0, token.lastIndexOf(":") + 1);
        const utility = token.slice(prefix.length);
        if (utility.startsWith("outline-")) return present.has(`${prefix}outline-none`);
        if (utility.startsWith("ring-")) return present.has(`${prefix}ring-0`);
        return false;
      };
      for (const token of tokens) {
        // `focus:` rings a field clicked with the mouse and `focus-within:`
        // rings a group when a button inside it is clicked.
        if (/(^|:)focus(-within)?:shadow-focus$/.test(token)) problems.push(`${file}: ${token}`);
        // An outline or ring that is not the token has to carry the gate.
        if (
          /focus-visible\]?:(?!keyboard:)(before:|after:)?(outline-(\d|\[)|inset-ring-(\d|\[)|ring-(\d|\[)|w-0\.5|h-0\.5)/.test(
            token,
          ) &&
          !neutralized(token)
        ) {
          problems.push(`${relative(SRC_DIR, file)}: ${token}`);
        }
      }
    }
  }
  expect(problems).toEqual([]);
});
