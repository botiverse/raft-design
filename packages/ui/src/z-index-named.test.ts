import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";
import { Z_INDEX_NAMES, cn } from "./lib/cn";
import { rawZIndexClasses } from "./lint/no-raw-z-index";

/**
 * Every z-index in the package is a named layer of the scale
 * (design/foundations/elevation.md#layer-order): `z-raised`, `z-popup`, ...
 * as a class, `var(--z-index-…)` in CSS or an inline style.
 *
 * This guard finds every z class with a number or an arbitrary value (`z-10`,
 * `-z-1`, `z-[60]`, any variant), every numeric `zIndex` in the TS sources,
 * and every `z-index:` in the CSS that isn't `auto`, `0` or a
 * `var(--z-index-…)`, and fails on a file that is not in the list below or has
 * more of them than the list says. Each entry is a kept exception
 * (elevation.md#kept-exceptions), with its reason. In an app,
 * `raft-ui/no-raw-z-index` reports the same classes and styles.
 */

type Allowed = { count: number; reason: string };

const ALLOWED: Record<string, Allowed> = {
  "components/scroll-area/scroll-area.css": {
    count: 1,
    reason:
      "The gutters stay at 2147483647 until slock's layers inside its ScrollAreas are named (#proj-raft-ui:#218 step 2); then var(--z-index-scrollbar).",
  },
  "components/toast/toast.tsx": {
    count: 2,
    reason:
      "Stacked toasts are ordered by their index, a calc on --toast-index that no name can be: the positioner's from var(--z-index-toast), the stacked root's inside the positioner's isolate.",
  },
  "components/drag/drag-lift.tsx": {
    count: 1,
    reason:
      "DRAG_LIFT_Z_INDEX is --z-index-drag as a number: dnd-kit's DragOverlay takes its zIndex as a number.",
  },
};

const SRC_DIR = fileURLToPath(new URL(".", import.meta.url));

// A numeric `zIndex` (`zIndex: 10`, `zIndex: "10"`, `zIndex={10}`, `.zIndex = 10`) and a numeric z-index const.
const STYLE = /\bzIndex\s*(?::|=\{?)\s*(?:[^,;}\n]*\?\s*)?["'`]?[-+]?\d/g;
const CONST = /\b\w*Z_INDEX\w*\s*=\s*[-+]?\d/g;
const DECLARATION = /(?<![\w-])z-index\s*:\s*([^;{}]+)/g;
const NAMED_VALUE = /^(?:auto|0|var\(--z-index-[\w-]+\)|calc\(.*var\(--z-index-[\w-]+\).*\))$/;

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === "lint") continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...sourceFiles(path));
    else if (
      /\.(?:tsx?|css)$/.test(entry) &&
      !/\.test\.|\.stories\.|(?:^|[-.])test-|\.d\.ts$/.test(entry)
    ) {
      files.push(path);
    }
  }
  return files;
}

function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}

function rawZIndexSites(source: string, css: boolean): string[] {
  const code = withoutComments(source);
  if (css) {
    return [...code.matchAll(DECLARATION)]
      .filter((m) => !NAMED_VALUE.test(m[1]!.trim()))
      .map((m) => m[0].trim());
  }
  return [
    ...rawZIndexClasses(code),
    ...[...code.matchAll(STYLE)].map((m) => m[0]),
    ...[...code.matchAll(CONST)].map((m) => m[0]),
  ];
}

test("every z-index is a named layer, but for the kept exceptions", () => {
  const found: Record<string, string[]> = {};
  for (const path of sourceFiles(SRC_DIR)) {
    const sites = rawZIndexSites(readFileSync(path, "utf8"), path.endsWith(".css"));
    if (sites.length > 0) found[relative(SRC_DIR, path).replaceAll("\\", "/")] = sites;
  }

  const unexpected = Object.entries(found)
    .filter(([file, sites]) => sites.length > (ALLOWED[file]?.count ?? 0))
    .map(
      ([file, sites]) =>
        `${file}: ${sites.join(", ")} (allowed ${ALLOWED[file]?.count ?? 0}). ` +
        "Use a layer name (z-raised, z-control, z-sticky, ...; var(--z-index-…) in CSS), " +
        "or add the exception to elevation.md#kept-exceptions and this list.",
    );
  expect(unexpected).toEqual([]);

  // An entry whose sites are gone is lowered or removed, so the list stays the exceptions.
  const stale = Object.entries(ALLOWED)
    .filter(([file, { count }]) => (found[file]?.length ?? 0) < count)
    .map(([file]) => file);
  expect(stale).toEqual([]);
});

test("the guard finds raw z-index values in classes, styles and CSS", () => {
  expect(rawZIndexSites('"relative z-10 md:-z-1 data-open:z-[60]"', false)).toEqual([
    "z-10",
    "-z-1",
    "z-[60]",
  ]);
  expect(rawZIndexSites('"z-raised max-md:z-chrome z-auto size-10 translate-z-10"', false)).toEqual(
    [],
  );
  expect(rawZIndexSites("style={{ zIndex: open ? 20 : undefined }}", false)).toHaveLength(1);
  expect(rawZIndexSites('{ zIndex: "var(--z-index-raised)" }', false)).toEqual([]);
  expect(rawZIndexSites("export const LIFT_Z_INDEX = 999;", false)).toHaveLength(1);
  expect(
    rawZIndexSites(
      ".a { z-index: 5; } .b { z-index: var(--z-index-popup); } .c { z-index: auto; }",
      true,
    ),
  ).toEqual(["z-index: 5"]);
  expect(rawZIndexSites("/* z-index: 5 */ .a { color: red; }", true)).toEqual([]);
});

function themeScale(): [string, number][] {
  const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
  return [...css.matchAll(/^\s*--z-index-([\w-]+):\s*(-?\d+);/gm)].map((m) => [
    m[1]!,
    Number(m[2]),
  ]);
}

test("styles.css defines the scale in order, every in-page layer below the overlays", () => {
  const scale = themeScale();
  expect(scale.map(([name]) => name)).toEqual(Z_INDEX_NAMES);
  const values = scale.map(([, value]) => value);
  expect(values).toEqual([...values].sort((a, b) => a - b));
  const popup = Object.fromEntries(scale).popup!;
  const inPage = scale.slice(
    0,
    scale.findIndex(([name]) => name === "popup"),
  );
  expect(inPage.every(([, value]) => value < popup)).toBe(true);
  // Nothing sits above the drag lift.
  expect(Math.max(...values)).toBe(Object.fromEntries(scale).drag);
});

test("a layer name merges with a z class an app passes", () => {
  expect(cn("isolate z-popup", "z-40")).toBe("isolate z-40");
  expect(cn("z-10", "z-raised")).toBe("z-raised");
  expect(cn("max-md:z-chrome", "max-md:z-auto")).toBe("max-md:z-auto");
});
