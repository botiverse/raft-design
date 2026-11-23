import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vite-plus/test";

/**
 * Component tokens are sizes the web and the iOS and Android apps both draw
 * (design/foundations/tokens.md#component-tokens). The token switches between
 * a phone, a mouse and a desktop once, in the token layer; a recipe that
 * reads one adds no breakpoint of its own for that property, so the web
 * can't drift from the apps one recipe at a time.
 *
 * Two rules, over the package's source (tests excluded):
 *
 * - A hand-written copy of a token's value is gone: `h-8
 *   md:pointer-fine:h-control` is `h-control-small`, and so on (HAND_COPIES).
 * - A file that reads a component token utility for a property (`min-h-`,
 *   `py-`, ...) adds no responsive or pointer variant of that property on the
 *   element itself, except on a line right under a `// web-only: <reason>`
 *   comment, which says why the web needs its own value on top.
 */

const SRC_DIR = fileURLToPath(new URL(".", import.meta.url));

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current)) {
      if (entry === "node_modules" || entry === "dist") continue;
      const path = join(current, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path)) files.push(path);
    }
  };
  walk(dir);
  return files;
}

/** Utilities that read a component token, by the property they set. */
const TOKEN_UTILITIES: Record<string, string> = {
  "h-control-small": "h",
  "size-control-small": "size",
  "min-h-list-row": "min-h",
  "py-list-row-inset": "py",
  "w-avatar-column": "w",
  "size-avatar-column": "size",
  "gap-avatar-column-gap": "gap",
  "min-h-list-toolbar": "min-h",
  "py-list-toolbar-air": "py",
};

/** A token's value written by hand, and the utility that replaces it. */
const HAND_COPIES: { pattern: RegExp; use: string }[] = [
  { pattern: /(^|\s)h-8 md:pointer-fine:h-control(\s|$)/, use: "h-control-small" },
  { pattern: /(^|\s)size-8 md:pointer-fine:size-control(\s|$)/, use: "size-control-small" },
  { pattern: /pointer-coarse:min-h-14/, use: "min-h-list-row" },
  // A custom property set to the same switch: `[--x:2rem]
  // md:pointer-fine:[--x:var(--control-height)]`.
  {
    pattern: /md:pointer-fine:\[--[\w-]+:var\(--control-height\)\]/,
    use: "[--x:var(--control-height-small)]",
  },
  // The avatar column's width; an avatar's own size (Avatar `md`, IconTile
  // `md`) is the avatar ramp, not the column.
  { pattern: /(^|\s)w-\[35px\]/, use: "w-avatar-column" },
];

const LITERAL = /"[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`/g;
const WEB_ONLY = /^\s*\/\/ web-only: \S/;

/** Splits `md:pointer-fine:py-3` into its variants and its utility, outside brackets. */
function splitVariants(token: string): { variants: string[]; utility: string } {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) {
      parts.push(token.slice(start, i));
      start = i + 1;
    }
  }
  return { variants: parts, utility: token.slice(start) };
}

/** A variant that styles another element (a child, a pseudo-element), not the element itself. */
function stylesAnotherElement(variants: string[]): boolean {
  return variants.some(
    (v) =>
      v === "*" ||
      v === "**" ||
      v.startsWith("[&") ||
      v === "before" ||
      v === "after" ||
      v === "placeholder",
  );
}

/**
 * The token properties a utility sets, shorthands included: `p-3` sets the
 * `py` a token owns, `size-8` sets `h` and `w`.
 */
const SETS: Record<string, string[]> = {
  "min-h": ["min-h"],
  size: ["size", "h", "w"],
  "gap-x": ["gap"],
  "gap-y": ["gap"],
  gap: ["gap"],
  py: ["py"],
  pt: ["py"],
  pb: ["py"],
  p: ["py"],
  h: ["h", "size"],
  w: ["w", "size"],
};

function propertiesOf(utility: string): string[] {
  const bare = utility.replace(/^!|!$/g, "").replace(/^-/, "");
  for (const [prefix, properties] of Object.entries(SETS)) {
    if (bare.startsWith(`${prefix}-`)) return properties;
  }
  return [];
}

type Literal = { line: number; group: number; classes: string[] };

/**
 * Every string literal with its line and its group: the array literal or the
 * call it sits in (one element's class list in a recipe, the arguments of a
 * `cn()`), or the string itself when it is an object's value.
 */
function literals(source: string): Literal[] {
  const found: Literal[] = [];
  // The open brackets around the current point: `[` an array, `(` a call
  // (`cn("a", cond && "b")`), `{` an object, whose values (a recipe's
  // variants) are separate class lists.
  const open: { char: string; at: number }[] = [];
  let line = 1;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === "\n") line++;
    else if (c === "/" && source[i + 1] === "/") {
      while (i < source.length && source[i] !== "\n") i++;
      line++;
    } else if (c === "/" && source[i + 1] === "*") {
      const close = source.indexOf("*/", i + 2);
      const stop = close === -1 ? source.length : close + 2;
      line += source.slice(i, stop).split("\n").length - 1;
      i = stop - 1;
    } else if (c === "[" || c === "(" || c === "{") open.push({ char: c, at: i });
    else if (c === "]" || c === ")" || c === "}") open.pop();
    else if (c === '"' || c === "'" || c === "`") {
      LITERAL.lastIndex = i;
      const match = LITERAL.exec(source);
      if (!match || match.index !== i) continue;
      const text = match[0].slice(1, -1);
      const inner = open.at(-1);
      const group = inner && inner.char !== "{" ? inner.at : i;
      found.push({ line, group, classes: text.split(/\s+/).filter(Boolean) });
      line += text.split("\n").length - 1;
      i += match[0].length - 1;
    }
  }
  return found;
}

function sizeTokenViolations(path: string, source: string): string[] {
  const lines = source.split("\n");
  const found = literals(source);
  const problems: string[] = [];

  for (const literal of found) {
    for (const { pattern, use } of HAND_COPIES) {
      if (pattern.test(literal.classes.join(" "))) {
        problems.push(`${path}:${literal.line}: a token's value by hand; use ${use}`);
      }
    }
  }

  const owned = new Map<number, Set<string>>();
  for (const literal of found) {
    for (const cls of literal.classes) {
      const { variants, utility } = splitVariants(cls);
      if (variants.length > 0 || !(utility in TOKEN_UTILITIES)) continue;
      const properties = owned.get(literal.group) ?? new Set<string>();
      properties.add(TOKEN_UTILITIES[utility]);
      owned.set(literal.group, properties);
    }
  }

  for (const literal of found) {
    const properties = owned.get(literal.group);
    if (!properties) continue;
    const webOnly = WEB_ONLY.test(lines[literal.line - 2] ?? "");
    for (const cls of literal.classes) {
      const { variants, utility } = splitVariants(cls);
      if (variants.length === 0 || stylesAnotherElement(variants)) continue;
      const property = propertiesOf(utility).find((p) => properties.has(p));
      if (!property || webOnly) continue;
      problems.push(
        `${path}:${literal.line}: \`${cls}\` adds a breakpoint to ${property}, which a component token sets here; drop it, or put it under a \`// web-only: <reason>\` comment`,
      );
    }
  }
  return problems;
}

describe("component size tokens", () => {
  test("recipes read the tokens and add no breakpoint of their own", () => {
    const problems = sourceFiles(SRC_DIR).flatMap((file) =>
      sizeTokenViolations(relative(SRC_DIR, file), readFileSync(file, "utf8")),
    );
    expect(problems).toEqual([]);
  });

  test("the check finds a hand copy, a stray breakpoint, and lets a web-only one through", () => {
    expect(sizeTokenViolations("a.ts", `const a = "h-8 md:pointer-fine:h-control";`)).toHaveLength(
      1,
    );
    expect(
      sizeTokenViolations("b.ts", `const b = ["min-h-list-row", "md:pointer-fine:min-h-16"];`),
    ).toHaveLength(1);
    expect(
      sizeTokenViolations(
        "c.ts",
        [
          `const c = ["min-h-list-row",`,
          `  // web-only: a web density the apps don't have`,
          `  "pointer-fine:min-h-16"];`,
        ].join("\n"),
      ),
    ).toEqual([]);
    expect(
      sizeTokenViolations("e.ts", `const e = cn("min-h-list-row", x && "md:min-h-8");`),
    ).toHaveLength(1);
    expect(sizeTokenViolations("f.ts", `const f = ["py-list-row-inset", "md:p-3"];`)).toHaveLength(
      1,
    );
    expect(
      sizeTokenViolations(
        "g.ts",
        `const g = tv({ variants: { size: { sm: "h-control-small", lg: "md:h-10" } } });`,
      ),
    ).toEqual([]);
    expect(
      sizeTokenViolations(
        "d.ts",
        `const d = ["min-h-list-row", "*:data-[x]:md:min-h-4", "after:md:min-h-4"];`,
      ),
    ).toEqual([]);
  });
});
