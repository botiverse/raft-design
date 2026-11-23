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
 * - A size that switches with the pointer (`pointer-fine:`, `pointer-coarse:`)
 *   on a property a token could own reads a token instead, or sits under a
 *   `// web-only:` comment. The switches written before this rule are listed
 *   in POINTER_SWITCHES_TO_LIFT, the sizes still to lift into tokens; the
 *   list only shrinks.
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
  "size-row-action": "size",
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
  // The same switch inside a calc: `[--x:calc((--spacing(8)-18px)/2)]
  // md:pointer-fine:[--x:calc((var(--control-height)-18px)/2)]`.
  {
    pattern: /\(--spacing\(8\)[^\s]*\] md:pointer-fine:\[[^\s]*var\(--control-height\)/,
    use: "var(--control-height-small) inside the calc",
  },
  // The avatar column's width; an avatar's own size (Avatar `md`, IconTile
  // `md`) is the avatar ramp, not the column.
  { pattern: /(^|\s)w-\[35px\]/, use: "w-avatar-column" },
];

/**
 * Sizes that switch with the pointer, written before tokens covered them:
 * `path` and the class, as the check reports them. Lift one into a token (or
 * mark it web-only) and take it off the list; the check fails on an entry it
 * no longer finds, so the list can't keep a stale one.
 */
const POINTER_SWITCHES_TO_LIFT: string[] = [
  "components/app-rail/app-rail.recipe.ts md:pointer-fine:first:pt-1.5",
  "components/app-rail/app-rail.recipe.ts md:pointer-fine:gap-1",
  "components/app-rail/app-rail.recipe.ts md:pointer-fine:pb-1.5",
  "components/app-rail/app-rail.recipe.ts md:pointer-fine:pt-1.5",
  "components/avatar/avatar.tsx md:pointer-fine:h-(--bar-button-size)",
  "components/avatar/avatar.tsx md:pointer-fine:py-0",
  "components/badge/badge.tsx md:pointer-fine:h-5",
  "components/button/button-split.tsx md:pointer-fine:w-7",
  "components/choice-list/choice-list.recipe.ts pointer-coarse:min-h-11",
  "components/choice-list/choice-list.recipe.ts pointer-coarse:py-[calc((--spacing(11)-1lh)/2)]",
  "components/code-block/code-block.recipe.ts md:pointer-fine:size-control",
  "components/combobox/combobox.tsx md:pointer-fine:h-control",
  "components/composer/composer-toolbar-label.tsx md:pointer-fine:min-h-(--bar-button-size)",
  "components/fit-toolbar/fit-toolbar.recipe.ts md:pointer-fine:data-fit-label:w-(--control-height)",
  "components/fit-toolbar/fit-toolbar.recipe.ts md:pointer-fine:data-fit-plus:w-(--control-height)",
  "components/fit-toolbar/fit-toolbar.recipe.ts md:pointer-fine:in-data-fit-label:w-(--control-height)",
  "components/fit-toolbar/fit-toolbar.recipe.ts md:pointer-fine:in-data-fit-plus:w-(--control-height)",
  "components/inbox-item/inbox-item.recipe.ts pointer-coarse:gap-3",
  "components/message-item/message-item.recipe.ts md:pointer-fine:size-control",
  "components/message-item/message-reaction.recipe.ts md:pointer-fine:size-control",
  "components/panel/panel-header.recipe.ts md:pointer-fine:gap-1",
  "components/panel/panel-header.recipe.ts md:pointer-fine:size-(--bar-button-size)",
  "components/panel/panel-split-action.recipe.ts md:pointer-fine:w-5",
  "components/resizable/resizable.recipe.ts pointer-coarse:data-[orientation=horizontal]:h-6",
  "components/resizable/resizable.recipe.ts pointer-coarse:w-6",
  "components/search/search.recipe.ts md:pointer-fine:py-[calc((var(--header-height)-1px-var(--control-height))/2)]",
  "components/selection-toolbar/selection-toolbar.recipe.ts md:pointer-fine:data-fit-label:w-(--control-height)",
  "components/selection-toolbar/selection-toolbar.recipe.ts md:pointer-fine:gap-1",
  "components/selection-toolbar/selection-toolbar.recipe.ts md:pointer-fine:w-(--control-height)",
  "components/selection-toolbar/selection-toolbar.recipe.ts md:pointer-fine:w-auto",
  "components/sidebar/sidebar-item.recipe.ts md:pointer-fine:size-4",
  "components/sidebar/sidebar-section.recipe.ts md:pointer-fine:h-6",
  "components/sidebar/sidebar-section.recipe.ts md:pointer-fine:min-h-6",
  "components/sidebar/sidebar-section.recipe.ts md:pointer-fine:pt-1",
  "components/sidebar/sidebar-section.recipe.ts md:pointer-fine:pt-2",
  "components/sidebar/sidebar-section.recipe.ts md:pointer-fine:size-auto",
  "components/sidebar/sidebar-section.recipe.ts not-pointer-fine:pb-1.5",
  "components/sidebar/sidebar.recipe.ts md:pointer-fine:pt-2",
  "components/text-selection-toolbar/text-selection-toolbar.recipe.ts md:pointer-fine:h-control",
  "lib/head-edges.ts md:pointer-fine:size-(--bar-button-size)",
];

const POINTER_VARIANT = /^(not-)?pointer-(fine|coarse)$/;

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

// Longest prefix first, so `min-h-` is never read as `h-` nor `pt-` as `p-`
// whatever order SETS is written in.
const SETS_LONGEST_FIRST = Object.entries(SETS).sort(([a], [b]) => b.length - a.length);

function propertiesOf(utility: string): string[] {
  const bare = utility.replace(/^!|!$/g, "").replace(/^-/, "");
  for (const [prefix, properties] of SETS_LONGEST_FIRST) {
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

/** Pointer switches of a token-sized property that no token owns in their group. */
function pointerSwitches(path: string, source: string): { at: string; key: string }[] {
  const lines = source.split("\n");
  const found = literals(source);
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
  const switches: { at: string; key: string }[] = [];
  for (const literal of found) {
    if (WEB_ONLY.test(lines[literal.line - 2] ?? "")) continue;
    const properties = owned.get(literal.group);
    for (const cls of literal.classes) {
      const { variants, utility } = splitVariants(cls);
      if (stylesAnotherElement(variants) || !variants.some((v) => POINTER_VARIANT.test(v)))
        continue;
      const sets = propertiesOf(utility);
      // Owned by a token here: the stray-breakpoint rule reports it.
      if (sets.length === 0 || sets.some((p) => properties?.has(p))) continue;
      switches.push({ at: `${path}:${literal.line}`, key: `${path} ${cls}` });
    }
  }
  return switches;
}

describe("component size tokens", () => {
  test("recipes read the tokens and add no breakpoint of their own", () => {
    const problems = sourceFiles(SRC_DIR).flatMap((file) =>
      sizeTokenViolations(relative(SRC_DIR, file), readFileSync(file, "utf8")),
    );
    expect(problems).toEqual([]);
  });

  test("a size that switches with the pointer reads a token", () => {
    const switches = sourceFiles(SRC_DIR).flatMap((file) =>
      pointerSwitches(relative(SRC_DIR, file), readFileSync(file, "utf8")),
    );
    const keys = new Set(switches.map((s) => s.key));
    const unlisted = switches
      .filter((s) => !POINTER_SWITCHES_TO_LIFT.includes(s.key))
      .map(
        (s) =>
          `${s.at}: \`${s.key.split(" ")[1]}\` switches a size with the pointer; read a component token (design/foundations/tokens.md#component-tokens), or put it under a \`// web-only: <reason>\` comment`,
      );
    const stale = POINTER_SWITCHES_TO_LIFT.filter((key) => !keys.has(key)).map(
      (key) => `${key}: no longer found; take it off POINTER_SWITCHES_TO_LIFT`,
    );
    expect([...unlisted, ...stale]).toEqual([]);
  });

  test("the pointer-switch check finds a hand size and skips a token, a web-only line and a child", () => {
    expect(pointerSwitches("a.ts", `const a = "py-3 pointer-fine:py-2";`)).toHaveLength(1);
    expect(pointerSwitches("b.ts", `const b = ["h-8", "md:pointer-fine:h-control"];`)).toHaveLength(
      1,
    );
    expect(
      pointerSwitches("c.ts", `const c = ["py-list-row-inset", "pointer-fine:py-3"];`),
    ).toEqual([]);
    expect(
      pointerSwitches(
        "d.ts",
        [`const d = ["py-3",`, `  // web-only: a web density`, `  "pointer-fine:py-2"];`].join(
          "\n",
        ),
      ),
    ).toEqual([]);
    expect(
      pointerSwitches("e.ts", `const e = "after:pointer-coarse:h-11 md:pointer-fine:text-sm";`),
    ).toEqual([]);
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
    expect(
      sizeTokenViolations(
        "h.ts",
        `const h = "[--x:calc((--spacing(8)-18px)/2)] md:pointer-fine:[--x:calc((var(--control-height)-18px)/2)]";`,
      ),
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
