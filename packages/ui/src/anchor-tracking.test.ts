import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * A positioner wrapper leaves Base UI's anchor tracking on: it passes
 * `disableAnchorTracking` through with no default of its own and never sets it
 * to `true`. With tracking off, a `fixed` popup stays at the coordinates where
 * it opened while an ancestor scrolls, so it detaches from its trigger
 * (packages/ui/AGENTS.md, Base UI, Overlays, and Portals;
 * design/foundations/elevation.md#popups). Wrappers once defaulted it to
 * `true`, and 18 popups on the docs site drifted 40-160px on scroll.
 */
const SRC = fileURLToPath(new URL(".", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

// `disableAnchorTracking = true` (a destructuring default),
// `disableAnchorTracking: true` (an object default) and
// `disableAnchorTracking={true}` (a JSX prop).
const TURNS_TRACKING_OFF = /disableAnchorTracking\s*(=\s*true\b|:\s*true\b|=\{\s*true\s*\})/;

test("no wrapper turns Base UI's anchor tracking off", () => {
  const offenders = sourceFiles(SRC)
    .filter((file) => TURNS_TRACKING_OFF.test(readFileSync(file, "utf8")))
    .map((file) => relative(SRC, file));
  expect(offenders).toEqual([]);
});
