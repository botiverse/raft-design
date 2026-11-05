import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * A browser test file that emulates touch runs in a browser of its own: once a
 * page has had touch emulation on and off again, headless Chromium reports
 * `hover: none` and no pointer for every file after it (AGENTS.md, "Browser
 * Tests Run by Hand"). `vite.config.ts` finds those files by reading each
 * `*.browser.test.{ts,tsx}` file under `src` for the CDP call
 * `setTouchEmulationEnabled`, and nothing else. A call in a shared helper, or
 * in a file a test imports, hides it: the test that turns touch on runs in the
 * shared browser, and the files after it lose their mouse. So the call is
 * written in the test file itself, and nowhere else.
 *
 * Asserted on the source, so it runs in CI, where browser tests don't.
 */

const CALL = "setTouchEmulationEnabled";
const PACKAGE_DIR = fileURLToPath(new URL("..", import.meta.url));
const THIS_FILE = fileURLToPath(import.meta.url);
/** The detector itself names the call. */
const DETECTOR = join(PACKAGE_DIR, "vite.config.ts");
const BROWSER_TEST = /^src\/.+\.browser\.test\.tsx?$/;

function scriptFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...scriptFiles(path));
    else if (/\.[cm]?[jt]sx?$/.test(entry)) files.push(path);
  }
  return files;
}

const emulates = (file: string) => readFileSync(file, "utf8").includes(CALL);
const files = scriptFiles(PACKAGE_DIR).filter((file) => file !== THIS_FILE && file !== DETECTOR);

test("touch emulation is turned on only in a browser test file, where vite.config finds it", () => {
  const elsewhere = files
    .filter(emulates)
    .map((file) => relative(PACKAGE_DIR, file).split("\\").join("/"))
    .filter((file) => !BROWSER_TEST.test(file));
  expect(
    elsewhere,
    `${CALL} outside a src/**/*.browser.test.{ts,tsx} file: vite.config.ts doesn't see it, ` +
      "so the test that emulates touch shares the browser of the others. Call it in the test file.",
  ).toEqual([]);
});

/** The files a module imports by a relative path, resolved as Vite would. */
function relativeImports(file: string): string[] {
  const source = readFileSync(file, "utf8");
  const specifiers = [
    ...source.matchAll(/\bfrom\s+["'](\.{1,2}\/[^"']+)["']/g),
    ...source.matchAll(/\bimport\s*\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g),
  ].map((match) => match[1]!);
  const resolved: string[] = [];
  for (const specifier of specifiers) {
    const base = resolve(dirname(file), specifier);
    const found = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]
      .map((suffix) => base + suffix)
      .find((path) => existsSync(path) && statSync(path).isFile());
    if (found) resolved.push(found);
  }
  return resolved;
}

test("a browser test doesn't turn touch on through a file it imports", () => {
  const hidden: string[] = [];
  for (const file of files) {
    const rel = relative(PACKAGE_DIR, file).split("\\").join("/");
    if (!BROWSER_TEST.test(rel) || emulates(file)) continue;
    for (const imported of relativeImports(file)) {
      if (emulates(imported)) hidden.push(`${rel} imports ${relative(PACKAGE_DIR, imported)}`);
    }
  }
  expect(
    hidden,
    `a browser test reaches ${CALL} through an import, so vite.config.ts doesn't give it a ` +
      "browser of its own. Call it in the test file.",
  ).toEqual([]);
});
