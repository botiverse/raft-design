import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * Hover and press change at once, with no fade (design/foundations/motion.md):
 * no component transitions a color, a fill, a filter or everything at once.
 * Asserted on the source, since CI runs no browser test. Transitions of
 * movement and size (a sheet, a chevron, a switch's thumb), of the focus ring
 * (box-shadow) and of a toast's or a tooltip's entrance stay.
 */

const ROOT = fileURLToPath(new URL(".", import.meta.url));

/**
 * Changes that animate on purpose and are not a hover or a press: a switch
 * flipping, a bar filling, the copy icon swapping to a check, a drawer
 * sliding in.
 */
const ALLOWED = new Set([
  "components/switch/switch.tsx",
  "components/progress/progress.tsx",
  "components/meter/meter.tsx",
  "components/copyable-code/copyable-code.tsx",
  "components/drawer/drawer.recipe.ts",
]);

const FADE =
  /(?:^|[\s"'`:])transition(?:-colors|-all|-\[[^\]]*\b(?:color|background-color|border-color|filter|all)\b[^\]]*\])(?=[\s"'`]|$)/;

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    if (
      !/\.tsx?$/.test(name) ||
      /\.(test|browser\.test|stories)\.tsx?$/.test(name) ||
      /\.test-/.test(name)
    )
      return [];
    return [path];
  });
}

test("no component fades a hover or a press", () => {
  const offenders: string[] = [];
  for (const path of sources(ROOT)) {
    const file = relative(ROOT, path);
    if (ALLOWED.has(file)) continue;
    readFileSync(path, "utf8")
      .split("\n")
      .forEach((line, index) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
        if (FADE.test(line)) offenders.push(`${file}:${index + 1}: ${line.trim()}`);
      });
  }
  expect(offenders).toEqual([]);
});
